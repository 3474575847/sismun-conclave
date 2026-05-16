import { createClient } from '@/lib/supabase-server';
import { committees } from '@/data/committees';
import { notFound } from 'next/navigation';
import ResolutionViewer from '@/components/portal/ResolutionViewer';
import AmendmentList from '@/components/portal/AmendmentList';

export const dynamic = 'force-dynamic';

export default async function ResolutionPage({ params }: { params: { res_id: string } }) {
    const supabase = createClient();

    const { data: resolution } = await supabase
        .from('resolutions')
        .select('*, blocs(bloc_name, member_countries)')
        .eq('id', params.res_id)
        .eq('status', 'floor')
        .eq('is_deleted', false)
        .single();

    if (!resolution) return notFound();

    const { data: amendments } = await supabase
        .from('amendments')
        .select('*')
        .eq('resolution_id', params.res_id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

    const { data: log } = await supabase
        .from('amendment_log')
        .select('*')
        .eq('resolution_id', params.res_id)
        .order('timestamp', { ascending: false });

    const committee = committees.find(c => c.slug === resolution.committee_slug);
    const topic = committee?.topics?.[resolution.topic_index] ?? `Topic ${resolution.topic_index + 1}`;

    return (
        <div className="max-w-4xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-2">
                <div className="flex items-center gap-2 text-xs font-mono text-white/30 mb-3">
                    <a href="/portal/floor" className="hover:text-white/60 transition-colors">Floor</a>
                    <span>›</span>
                    <span className="text-white/50">{resolution.blocs?.bloc_name}</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-white mb-1">
                            {resolution.blocs?.bloc_name ?? 'Resolution'}
                        </h1>
                        <p className="text-sm text-white/40">{topic}</p>
                        <p className="text-xs text-white/25 font-mono mt-1">
                            {committee?.name} · {committee?.acronym}
                        </p>
                    </div>
                    {resolution.status === 'floor' && (
                        <a
                            href={`/portal/floor/${params.res_id}/amend`}
                            className="shrink-0 px-4 py-2 bg-[#c9a84c]/10 hover:bg-[#c9a84c]/20 border border-[#c9a84c]/30 text-[#c9a84c] text-xs font-mono rounded transition-colors"
                        >
                            + PROPOSE AMENDMENT
                        </a>
                    )}
                </div>
            </div>

            {/* Countries */}
            {resolution.blocs?.member_countries?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4 mb-6">
                    {resolution.blocs.member_countries.map((c: string) => (
                        <span key={c} className="text-[10px] font-mono px-2 py-0.5 bg-white/5 border border-white/10 rounded text-white/40">
                            {c}
                        </span>
                    ))}
                </div>
            )}

            {/* Resolution Document */}
            <ResolutionViewer resolution={resolution} />

            {/* Amendments */}
            <AmendmentList
                amendments={amendments ?? []}
                resolutionId={params.res_id}
                log={log ?? []}
            />
        </div>
    );
}
