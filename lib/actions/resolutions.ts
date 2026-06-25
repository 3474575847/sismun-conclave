'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

// ── Types ─────────────────────────────────────────────────────────────────────

export type Resolution = {
  id: string
  committee_slug: string
  title: string
  topic_index: number | null
  resolution_code: string | null
  status: 'published' | 'archived'
  current_file_path: string | null
  uploaded_by: string | null
  published_at: string | null
  archived_at: string | null
  created_at: string
  is_deleted: boolean
}

export type ResolutionFile = {
  id: string
  resolution_id: string
  committee_slug: string
  file_path: string
  file_name: string
  version_number: number
  status: 'active' | 'archived'
  uploaded_by: string | null
  uploaded_at: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function assertSecretariatAccess(committeeSlug?: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('eb_profiles')
    .select('committee_slug, role')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error('Not an EB member')
  if (!['secretariat', 'sg', 'admin'].includes(profile.role)) {
    throw new Error('Only Secretariat members can manage resolutions')
  }
  if (committeeSlug && profile.committee_slug !== null && profile.committee_slug !== committeeSlug) {
    throw new Error('Access denied: wrong committee')
  }

  return { user, profile }
}

export async function assertEBAccess(committeeSlug?: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('eb_profiles')
    .select('committee_slug, role')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error('Not an EB member')

  // Require a recognised EB role — prevents phantom eb_profiles rows with no role
  const validRoles = ['chair', 'secretariat', 'sg', 'admin']
  if (!profile.role || !validRoles.includes(profile.role)) {
    throw new Error('Access denied: invalid EB role')
  }

  if (committeeSlug && profile.committee_slug !== null && profile.committee_slug !== committeeSlug) {
    throw new Error('Access denied: wrong committee')
  }

  return { user, profile }
}

// ── Resolution Actions ────────────────────────────────────────────────────────

/**
 * Upload a new resolution DOCX and publish it.
 * Creates a resolutions row + resolution_files row.
 * Requirements: 1.1, 1.2
 */
export async function uploadResolution(formData: FormData): Promise<{ resolutionId: string }> {
  const { user } = await assertSecretariatAccess()
  const supabase = createClient()

  const committeeSlug = formData.get('committeeSlug') as string
  const title = formData.get('title') as string
  const topicIndex = formData.get('topicIndex') ? Number(formData.get('topicIndex')) : null
  const resolutionCode = (formData.get('resolutionCode') as string) || null
  const file = formData.get('file') as File

  if (!committeeSlug || !title || !file) {
    throw new Error('committeeSlug, title, and file are required')
  }

  // Validate DOCX MIME type (Req 1.3)
  const validMime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  if (file.type !== validMime) {
    throw new Error('Only DOCX files are accepted (.docx)')
  }

  // Validate file size ≤ 10 MB (Req 1.4)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File size must not exceed 10 MB')
  }

  // Generate resolution ID upfront for use in storage path
  const resolutionId = crypto.randomUUID()
  const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const filePath = `${committeeSlug}/${resolutionId}/v1_${safeFileName}`

  // Upload to Supabase Storage bucket 'resolutions'
  const { error: uploadError } = await supabase.storage
    .from('resolutions')
    .upload(filePath, file, { contentType: file.type, upsert: false })

  if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`)

  // Insert resolutions row
  const { error: resError } = await supabase
    .from('resolutions')
    .insert({
      id: resolutionId,
      committee_slug: committeeSlug,
      title,
      topic_index: topicIndex,
      resolution_code: resolutionCode,
      status: 'published',
      current_file_path: filePath,
      uploaded_by: user.id,
      published_at: new Date().toISOString(),
    })

  if (resError) throw new Error(`Failed to create resolution: ${resError.message}`)

  // Insert resolution_files row (version 1)
  const { error: fileError } = await supabase
    .from('resolution_files')
    .insert({
      resolution_id: resolutionId,
      committee_slug: committeeSlug,
      file_path: filePath,
      file_name: file.name,
      version_number: 1,
      status: 'active',
      uploaded_by: user.id,
    })

  if (fileError) throw new Error(`Failed to create file record: ${fileError.message}`)

  revalidatePath(`/committees/${committeeSlug}`)
  revalidatePath('/portal/eb/resolutions')

  return { resolutionId }
}

/**
 * Re-upload an updated DOCX for an existing resolution.
 * Archives the current active file, inserts a new active file.
 * Requirements: 6.1, 6.2
 */
export async function republishResolution(formData: FormData): Promise<void> {
  const supabase = createClient()

  const resolutionId = formData.get('resolutionId') as string
  const file = formData.get('file') as File

  if (!resolutionId || !file) throw new Error('resolutionId and file are required')

  const validMime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  if (file.type !== validMime) throw new Error('Only DOCX files are accepted (.docx)')
  if (file.size > 10 * 1024 * 1024) throw new Error('File size must not exceed 10 MB')

  // Fetch resolution for committee_slug
  const { data: resolution } = await supabase
    .from('resolutions')
    .select('committee_slug, is_deleted')
    .eq('id', resolutionId)
    .single()

  if (!resolution || resolution.is_deleted) throw new Error('Resolution not found')

  const { user } = await assertSecretariatAccess(resolution.committee_slug)

  // Get current active file to determine next version number
  const { data: currentFile } = await supabase
    .from('resolution_files')
    .select('id, version_number')
    .eq('resolution_id', resolutionId)
    .eq('status', 'active')
    .single()

  const nextVersion = currentFile ? currentFile.version_number + 1 : 2
  const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const filePath = `${resolution.committee_slug}/${resolutionId}/v${nextVersion}_${safeFileName}`

  // Upload new file to Storage
  const { error: uploadError } = await supabase.storage
    .from('resolutions')
    .upload(filePath, file, { contentType: file.type, upsert: false })

  if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`)

  // Archive current active file record
  if (currentFile) {
    await supabase
      .from('resolution_files')
      .update({ status: 'archived' })
      .eq('id', currentFile.id)
  }

  // Insert new active file record
  const { error: fileError } = await supabase
    .from('resolution_files')
    .insert({
      resolution_id: resolutionId,
      committee_slug: resolution.committee_slug,
      file_path: filePath,
      file_name: file.name,
      version_number: nextVersion,
      status: 'active',
      uploaded_by: user.id,
    })

  if (fileError) throw new Error(`Failed to create file record: ${fileError.message}`)

  // Update resolution's current_file_path
  await supabase
    .from('resolutions')
    .update({ current_file_path: filePath })
    .eq('id', resolutionId)

  revalidatePath(`/committees/${resolution.committee_slug}`)
  revalidatePath('/portal/eb/resolutions')
}

/**
 * Archive a resolution — removes it from public view.
 * Requirements: 6.1
 */
export async function archiveResolution(resolutionId: string): Promise<void> {
  const supabase = createClient()

  const { data: resolution } = await supabase
    .from('resolutions')
    .select('committee_slug')
    .eq('id', resolutionId)
    .single()

  if (!resolution) throw new Error('Resolution not found')

  await assertSecretariatAccess(resolution.committee_slug)

  await supabase
    .from('resolutions')
    .update({ status: 'archived', archived_at: new Date().toISOString() })
    .eq('id', resolutionId)

  revalidatePath(`/committees/${resolution.committee_slug}`)
  revalidatePath('/portal/eb/resolutions')
}

/**
 * Permanently delete a resolution (soft-delete via is_deleted flag).
 * Only Secretariat/SG/Admin can delete. Removes from all public views.
 * Requirements: 2.3
 */
export async function deleteResolution(resolutionId: string): Promise<void> {
  const supabase = createClient()

  const { data: resolution } = await supabase
    .from('resolutions')
    .select('committee_slug')
    .eq('id', resolutionId)
    .single()

  if (!resolution) throw new Error('Resolution not found')

  await assertSecretariatAccess(resolution.committee_slug)

  const { error } = await supabase
    .from('resolutions')
    .update({ is_deleted: true })
    .eq('id', resolutionId)

  if (error) throw new Error(`Failed to delete resolution: ${error.message}`)

  revalidatePath(`/committees/${resolution.committee_slug}`)
  revalidatePath('/portal/eb/resolutions')
  revalidatePath('/portal/eb')
}

/**
 * Update conference settings (SG only).
 * Requirements: 7.1, 7.2, 7.4
 */
export async function updateConferenceSettings(
  field: 'accepting_amendments' | 'accepting_submissions' | 'debate_mode',
  value: boolean
): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('eb_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['sg', 'admin'].includes(profile.role)) {
    throw new Error('Only the SG or Admin can modify conference settings')
  }

  const { error } = await supabase
    .from('conference_settings')
    .update({ [field]: value })
    .eq('id', 1)

  if (error) throw new Error(error.message)
  revalidatePath('/portal/eb')
}

/**
 * Approve a pending resolution — transitions status from 'pending' → 'floor'
 * and records the submission timestamp.
 * Requirements: 2.2, 2.5
 */
export async function approveResolution(id: string): Promise<void> {
  const supabase = createClient()

  const { data: resolution } = await supabase
    .from('resolutions')
    .select('committee_slug')
    .eq('id', id)
    .single()

  if (!resolution) throw new Error('Resolution not found')

  await assertEBAccess(resolution.committee_slug)

  const { error } = await supabase
    .from('resolutions')
    .update({ status: 'floor', submitted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(`Failed to approve resolution: ${error.message}`)

  revalidatePath('/portal/eb')
  revalidatePath('/portal/floor')
}

/**
 * Reject a pending resolution — soft-deletes it and optionally records a note.
 * Requirements: 2.3, 2.5
 */
export async function rejectResolution(id: string, note?: string): Promise<void> {
  const supabase = createClient()

  const { data: resolution } = await supabase
    .from('resolutions')
    .select('committee_slug')
    .eq('id', id)
    .single()

  if (!resolution) throw new Error('Resolution not found')

  await assertEBAccess(resolution.committee_slug)

  const updatePayload: Record<string, unknown> = { is_deleted: true }
  if (note) updatePayload.rejection_note = note

  const { error } = await supabase
    .from('resolutions')
    .update(updatePayload)
    .eq('id', id)

  if (error) throw new Error(`Failed to reject resolution: ${error.message}`)

  revalidatePath('/portal/eb')
  revalidatePath('/portal/floor')
}
