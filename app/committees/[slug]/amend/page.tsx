import { notFound } from 'next/navigation'
import { committees } from '@/data/committees'
import { createClient } from '@/lib/supabase-server'
import AmendmentSubmitForm from '@/components/portal/AmendmentSubmitForm'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { slug: string }
}

export default async function AmendPage({ params }: PageProps) {
  const committee = committees.find(c => c.slug === params.slug)
  if (!committee) notFound()

  const supabase = createClient()

  const { data: resolutions } = await supabase
    .from('resolutions')
    .select('id, title, resolution_code')
    .eq('committee_slug', params.slug)
    .eq('status', 'published')
    .eq('is_deleted', false)
    .order('published_at', { ascending: false })

  const resolutionOptions = (resolutions ?? []).map(r => ({
    id: r.id,
    title: r.title,
    resolution_code: r.resolution_code,
  }))

  return (
    <main className="min-h-screen bg-platinum dark:bg-charcoal text-charcoal dark:text-platinum">
      <div className="max-w-3xl mx-auto px-6 pt-24 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-charcoal/30 dark:text-platinum/30 mb-10 uppercase tracking-widest">
          <Link href={`/committees/${params.slug}`} className="hover:text-school-red transition-colors">
            {committee.acronym}
          </Link>
          <span>/</span>
          <span className="text-charcoal/50 dark:text-platinum/50">Submit Amendment</span>
        </div>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-serif font-bold text-charcoal dark:text-platinum mb-3">
            Submit an Amendment
          </h1>
          <p className="text-charcoal/50 dark:text-platinum/50 font-light">
            {committee.name}
          </p>
          <div className="h-px w-16 bg-school-red mt-6" />
        </div>

        <AmendmentSubmitForm
          resolutions={resolutionOptions}
          committeeSlug={params.slug}
        />
      </div>
    </main>
  )
}
