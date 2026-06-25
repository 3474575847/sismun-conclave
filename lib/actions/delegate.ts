'use server'

import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

export type DelegateSubmissionData = {
  submitterName: string
  submitterCountry: string
  blocName: string
  committeeSlug: string
  topicIndex: number
  preambleClauses: string[]   // array of non-empty strings
  operativeClauses: string[]  // array of non-empty strings
}

export async function createDelegateSubmission(data: DelegateSubmissionData): Promise<void> {
  // 1. Validate all required fields (Req 1.4)
  if (!data.submitterName?.trim()) throw new Error('Submitter name is required')
  if (!data.submitterCountry?.trim()) throw new Error('Submitter country is required')
  if (!data.blocName?.trim()) throw new Error('Bloc name is required')
  if (!data.committeeSlug?.trim()) throw new Error('Committee slug is required')
  if (data.topicIndex === undefined || data.topicIndex === null) throw new Error('Topic selection is required')
  const validPreamble = data.preambleClauses?.filter(c => c?.trim())
  const validOperative = data.operativeClauses?.filter(c => c?.trim())
  if (!validPreamble?.length) throw new Error('At least one preamble clause is required')
  if (!validOperative?.length) throw new Error('At least one operative clause is required')

  const supabase = createClient()

  // 2. Check accepting_submissions — read fresh, no cache (Req 1.3, 7.1, 7.5)
  const { data: settings } = await supabase
    .from('conference_settings')
    .select('accepting_submissions')
    .eq('id', 1)
    .single()

  if (!settings?.accepting_submissions) {
    throw new Error('Resolution submissions are currently closed.')
  }

  // 3. Insert blocs row then resolutions row via admin client (bypasses RLS for anon users)
  const adminClient = createAdminClient()

  const { data: bloc, error: blocError } = await adminClient
    .from('blocs')
    .insert({
      committee_slug: data.committeeSlug,
      topic_index: data.topicIndex,
      bloc_name: data.blocName.trim(),
      member_countries: [data.submitterCountry.trim()],
    })
    .select('id')
    .single()

  if (blocError || !bloc) throw new Error(`Failed to create bloc: ${blocError?.message}`)

  const contentJson = {
    preamble: validPreamble.map((text, i) => ({ position: i + 1, text: text.trim(), type: 'preamble' })),
    operative: validOperative.map((text, i) => ({ position: i + 1, text: text.trim(), type: 'operative' })),
  }

  const { error: resError } = await adminClient
    .from('resolutions')
    .insert({
      bloc_id: bloc.id,
      committee_slug: data.committeeSlug,
      topic_index: data.topicIndex,
      status: 'pending',
      content_json: contentJson,
      submitted_by_name: data.submitterName.trim(),
      submitted_by_country: data.submitterCountry.trim(),
    })

  if (resError) throw new Error(`Failed to create resolution: ${resError.message}`)

  revalidatePath(`/portal/${data.committeeSlug}`)
}
