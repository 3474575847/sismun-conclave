'use server'

import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import { validateCommitteePassword } from '@/lib/committee-password'
import { assertEBAccess } from '@/lib/actions/resolutions'

// ── Types ─────────────────────────────────────────────────────────────────────

export type Amendment = {
  id: string
  resolution_id: string
  committee_slug: string
  delegate_name: string
  delegate_country: string
  amendment_type: 'modify' | 'strike' | 'add' | null
  clause_reference: string
  proposed_text: string
  status: 'pending' | 'passed' | 'failed' | 'withdrawn'
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  is_deleted: boolean
}

// ── Actions ───────────────────────────────────────────────────────────────────

/**
 * Delegate submits an amendment (unauthenticated).
 * Validates: committee password, accepting_amendments flag, resolution is published.
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.7, 3.8
 */
export async function proposeAmendment(data: {
  resolutionId: string
  committeeSlug: string
  delegateName: string
  delegateCountry: string
  amendmentType: 'modify' | 'strike' | 'add'
  clauseReference: string
  proposedText: string
  committeePassword: string
}): Promise<void> {
  const {
    resolutionId,
    committeeSlug,
    delegateName,
    delegateCountry,
    amendmentType,
    clauseReference,
    proposedText,
    committeePassword,
  } = data

  // Validate all required fields non-empty (Req 3.4)
  if (!delegateName?.trim())      throw new Error('Delegate name is required')
  if (!delegateCountry?.trim())   throw new Error('Delegate country is required')
  if (!amendmentType)             throw new Error('Amendment type is required')
  if (!clauseReference?.trim())   throw new Error('Clause reference is required')
  if (!proposedText?.trim())      throw new Error('Proposed text is required')
  if (!committeePassword?.trim()) throw new Error('Committee password is required')

  // Validate committee password server-side — never stored (Req 3.2, 3.3)
  const passwordValid = validateCommitteePassword(committeeSlug, committeePassword)
  if (!passwordValid) {
    throw new Error('Incorrect committee password. Please check with your Chair.')
  }

  const supabase = createClient()

  // Check accepting_amendments — read fresh, no cache (Req 3.5, 7.3)
  const { data: settings } = await supabase
    .from('conference_settings')
    .select('accepting_amendments')
    .eq('id', 1)
    .single()

  if (!settings?.accepting_amendments) {
    throw new Error('Amendment submissions are currently closed.')
  }

  // Verify resolution is published (Req 3.8)
  const { data: resolution } = await supabase
    .from('resolutions')
    .select('status, committee_slug, is_deleted')
    .eq('id', resolutionId)
    .single()

  if (!resolution || resolution.is_deleted) {
    throw new Error('Resolution not found.')
  }
  if (resolution.status !== 'floor') {
    throw new Error('This resolution is not on the floor and cannot receive amendments')
  }
  if (resolution.committee_slug !== committeeSlug) {
    throw new Error('Resolution does not belong to this committee.')
  }

  // Rate-limit check: reject if delegate already has >= 5 pending amendments on this resolution (Req 3.5)
  const { count: pendingCount, error: countError } = await supabase
    .from('amendments')
    .select('id', { count: 'exact', head: true })
    .eq('resolution_id', resolutionId)
    .eq('delegate_country', delegateCountry.trim())
    .eq('status', 'pending')
    .eq('is_deleted', false)

  if (countError) throw new Error(`Failed to check amendment rate limit: ${countError.message}`)

  if ((pendingCount ?? 0) >= 5) {
    throw new Error(
      'Rate limit reached: you already have 5 or more pending amendments on this resolution.'
    )
  }

  // Insert amendment row using admin client to bypass RLS
  // All validation above (password, settings, resolution status) is the authorization gate
  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('amendments')
    .insert({
      resolution_id: resolutionId,
      committee_slug: committeeSlug,
      delegate_name: delegateName.trim(),
      delegate_country: delegateCountry.trim(),
      amendment_type: amendmentType,
      clause_reference: clauseReference.trim(),
      proposed_text: proposedText.trim(),
      status: 'pending',
    })

  if (error) throw new Error(`Failed to submit amendment: ${error.message}`)

  revalidatePath(`/committees/${committeeSlug}`)
}

/**
 * Chair updates amendment outcome after physical vote.
 * Requirements: 5.2, 5.3, 5.4, 5.5, 4.6, 8.1, 8.2, 8.3, 8.4
 */
export async function updateAmendmentStatus(
  amendmentId: string,
  status: 'passed' | 'failed' | 'withdrawn'
): Promise<void> {
  const supabase = createClient()

  // Fetch amendment to get committee_slug, resolution_id, and type for access check and audit log
  const { data: amendment } = await supabase
    .from('amendments')
    .select('committee_slug, status, is_deleted, resolution_id, amendment_type')
    .eq('id', amendmentId)
    .single()

  if (!amendment || amendment.is_deleted) throw new Error('Amendment not found')

  // Assert EB access scoped to this committee (Req 5.5)
  const { user } = await assertEBAccess(amendment.committee_slug)

  const { error } = await supabase
    .from('amendments')
    .update({
      status,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', amendmentId)

  if (error) throw new Error(`Failed to update amendment: ${error.message}`)

  // Map vote status to audit log action (Req 4.6, 8.1)
  const action = status === 'passed' ? 'approved' : 'rejected'

  // Fetch resolution content for full_snapshot_json (Req 8.4)
  let fullSnapshotJson: object | null = null
  if (status === 'passed') {
    const { data: resolution } = await supabase
      .from('resolutions')
      .select('content_json')
      .eq('id', amendment.resolution_id)
      .single()
    fullSnapshotJson = resolution?.content_json ?? null
  }

  // Insert audit log entry (Req 4.6, 8.1, 8.2, 8.3, 8.4)
  await supabase.from('amendment_log').insert({
    amendment_id: amendmentId,
    resolution_id: amendment.resolution_id,
    action,
    eb_profile_id: user.id,
    timestamp: new Date().toISOString(),
    full_snapshot_json: fullSnapshotJson,
    clause_before: null,  // simplified: full clause tracking is a future enhancement
    clause_after: null,   // simplified: full clause tracking is a future enhancement
  })

  revalidatePath('/portal/eb/amendments')
  revalidatePath(`/committees/${amendment.committee_slug}`)
}
