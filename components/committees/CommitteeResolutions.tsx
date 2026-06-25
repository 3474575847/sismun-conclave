'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import AmendmentStatusList from '@/components/portal/AmendmentStatusList'
import Link from 'next/link'
import type { Amendment } from '@/lib/actions/amendments'

interface Props {
  slug: string
  acronym: string
  topics: string[]
}

interface ResolutionWithAmendments {
  id: string
  title: string
  resolution_code: string | null
  current_file_path: string | null
  published_at: string | null
  topic_index: number | null
  amendments: Amendment[]
}

export default function CommitteeResolutions({ slug, acronym, topics }: Props) {
  const [resolutions, setResolutions] = useState<ResolutionWithAmendments[]>([])
  const [loading, setLoading] = useState(true)
  const [acceptingAmendments, setAcceptingAmendments] = useState(false)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Fetch resolutions and conference settings in parallel
    Promise.all([
      supabase
        .from('resolutions')
        .select(`
          id, title, resolution_code, current_file_path, published_at, topic_index,
          amendments(id, resolution_id, committee_slug, delegate_name, delegate_country, clause_reference, proposed_text, status, reviewed_by, reviewed_at, created_at, is_deleted)
        `)
        .eq('committee_slug', slug)
        .eq('status', 'published')
        .eq('is_deleted', false)
        .order('published_at', { ascending: false }),
      supabase
        .from('conference_settings')
        .select('accepting_amendments')
        .eq('id', 1)
        .single(),
    ]).then(([resResult, settingsResult]) => {
      setResolutions((resResult.data as ResolutionWithAmendments[]) ?? [])
      setAcceptingAmendments(settingsResult.data?.accepting_amendments ?? false)
      setLoading(false)
    })
  }, [slug])

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const getDownloadUrl = (path: string) =>
    `${supabaseUrl}/storage/v1/object/public/resolutions/${path}`

  return (
    <div className="mt-16 pt-16 border-t border-charcoal/10 dark:border-platinum/10">
      {/* Section header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-school-red font-mono text-[10px] uppercase tracking-[0.4em] mb-3">
            Official Resolutions
          </h2>
          <p className="text-charcoal/50 dark:text-platinum/50 text-sm font-light">
            Published resolutions and amendment status for {acronym}
          </p>
        </div>
        {acceptingAmendments && (
          <Link
            href={`/committees/${slug}/amend`}
            className="px-5 py-2.5 border border-school-red/30 hover:border-school-red text-school-red text-xs font-mono uppercase tracking-widest transition-all hover:bg-school-red/5"
          >
            Submit Amendment
          </Link>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-12 text-center">
          <p className="text-charcoal/30 dark:text-platinum/30 font-mono text-sm animate-pulse">
            Loading resolutions…
          </p>
        </div>
      )}

      {/* No resolutions state */}
      {!loading && resolutions.length === 0 && (
        <div className="py-16 text-center border border-dashed border-charcoal/10 dark:border-platinum/10 rounded-2xl">
          <p className="text-charcoal/30 dark:text-platinum/30 font-mono text-sm">
            No resolutions have been published yet.
          </p>
          <p className="text-charcoal/20 dark:text-platinum/20 font-mono text-xs mt-2">
            Check back during the conference session.
          </p>
        </div>
      )}

      {/* Resolution cards */}
      {!loading && resolutions.length > 0 && (
        <div className="space-y-8">
          {resolutions.map(resolution => {
            const topic = resolution.topic_index !== null
              ? topics[resolution.topic_index]
              : null
            const activeAmendments = (resolution.amendments ?? []).filter(a => !a.is_deleted)

            return (
              <div
                key={resolution.id}
                className="border border-charcoal/10 dark:border-platinum/10 rounded-2xl overflow-hidden"
              >
                {/* Resolution header */}
                <div className="p-8 bg-charcoal/[0.02] dark:bg-platinum/[0.02]">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        {resolution.resolution_code && (
                          <span className="text-school-red font-mono text-[10px] uppercase tracking-widest border border-school-red/20 px-2 py-0.5 rounded">
                            {resolution.resolution_code}
                          </span>
                        )}
                        <span className="text-charcoal/30 dark:text-platinum/30 font-mono text-[10px]">
                          Published {resolution.published_at
                            ? new Date(resolution.published_at).toLocaleDateString('en-GB', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })
                            : '—'}
                        </span>
                      </div>
                      <h3 className="text-2xl font-display font-bold text-charcoal dark:text-platinum mb-2">
                        {resolution.title}
                      </h3>
                      {topic && (
                        <p className="text-charcoal/50 dark:text-platinum/50 text-sm font-light">
                          {topic}
                        </p>
                      )}
                    </div>

                    {resolution.current_file_path && (
                      <a
                        href={getDownloadUrl(resolution.current_file_path)}
                        download
                        className="shrink-0 flex items-center gap-2 px-5 py-2.5 border border-charcoal/20 dark:border-platinum/20 hover:border-school-red text-charcoal/60 dark:text-platinum/60 hover:text-school-red text-xs font-mono uppercase tracking-widest transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </a>
                    )}
                  </div>
                </div>

                {/* Amendments section */}
                <div className="px-8 py-6 border-t border-charcoal/5 dark:border-platinum/5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-school-red font-mono text-[10px] uppercase tracking-[0.3em]">
                      Amendments
                    </h4>
                    <span className="text-charcoal/30 dark:text-platinum/30 font-mono text-[10px]">
                      {activeAmendments.length} submitted
                    </span>
                  </div>
                  <AmendmentStatusList amendments={activeAmendments} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
