import { createClient } from '@/lib/supabase-server';
import { committees } from '@/data/committees';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; color: string }> = {
        drafting: { label: 'DRAFTING', color: 'text-amber-400 border-amber-400/30 bg-amber-400/10' },
        submitted: { label: 'SUBMITTED', color: 'text-blue-400 border-blue-400/30 bg-blue-400/10' },
        floor: { label: 'ON FLOOR', color: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10' },
    };
    const s = map[status] ?? { label: status.toUpperCase(), color: 'text-white/40 border-white/10 bg-white/5' };
    return (
        <span className={`text-[10px] font-mono tracking-wider px-2 py-0.5 rounded border ${s.color}`}>
            {s.label}
        </span>
    );
}

export default async function FloorPage({
    searchParams,
}: {
    searchParams: { committee?: string };
}) {
    const supabase = createClient();
    const selectedCommittee = searchParams.committee ?? '';

    let query = supabase
        .from('resolutions')
        .select('*, blocs(bloc_name, member_countries)')
        .in('status', ['submitted', 'floor'])
        .eq('is_deleted', false)
        .order('submitted_at', { ascending: false });

    if (selectedCommittee) {
        query = query.eq('committee_slug', selectedCommittee);
    }

    const { data: resolutions } = await query;

    return (
        <div className="max-w-5xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-white mb-1">Committee Floor</h1>
                <p className="text-sm text-white/40 font-mono">
                    Public resolutions — read-only view · Delegates may propose amendments
                </p>
            </div>

            {/* Committee Filter */}
            <div className="flex flex-wrap gap-2 mb-8">
                <Link
                    href="/portal/floor"
                    className={`px-3 py-1.5 rounded text-xs font-mono tracking-wider border transition-colors ${
                        !selectedCommittee
                            ? 'bg-[#c9a84c]/15 text-[#c9a84c] border-[#c9a84c]/30'
                            : 'text-white/40 border-white/10 hover:text-white/70'
                    }`}
                >
                    ALL
                </Link>
                {committees.map(c => (
                    <Link
                        key={c.slug}
                        href={`/portal/floor?committee=${c.slug}`}
                        className={`px-3 py-1.5 rounded text-xs font-mono tracking-wider border transition-colors ${
                            selectedCommittee === c.slug
                                ? 'bg-[#c9a84c]/15 text-[#c9a84c] border-[#c9a84c]/30'
                                : 'text-white/40 border-white/10 hover:text-white/70'
                        }`}
                    >
                        {c.acronym}
                    </Link>
                ))}
            </div>

            {/* Resolutions */}
            {!resolutions || resolutions.length === 0 ? (
                <div className="text-center py-20 text-white/30 font-mono text-sm">
                    No resolutions on the floor yet.
                </div>
            ) : (
                <div className="space-y-3">
                    {resolutions.map((res: any) => {
                        const committee = committees.find(c => c.slug === res.committee_slug);
                        const topic = committee?.topics?.[res.topic_index] ?? `Topic ${res.topic_index + 1}`;
                        const preambleCount = res.content_json?.preamble?.length ?? 0;
                        const operativeCount = res.content_json?.operative?.length ?? 0;

                        return (
                            <Link
                                key={res.id}
                                href={`/portal/floor/${res.id}`}
                                className="block bg-white/[0.03] hover:bg-white/[0.06] border border-white/8 hover:border-white/15 rounded-lg p-5 transition-all group"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <span className="text-[10px] font-mono text-white/30 tracking-widest uppercase">
                                                {committee?.acronym ?? res.committee_slug}
                                            </span>
                                            <span className="text-white/20 text-xs">·</span>
                                            <StatusBadge status={res.status} />
                                        </div>
                                        <h2 className="text-sm font-semibold text-white/90 group-hover:text-white mb-1 truncate">
                                            {res.blocs?.bloc_name ?? 'Unnamed Bloc'}
                                        </h2>
                                        <p className="text-xs text-white/40 line-clamp-1 mb-3">{topic}</p>
                                        <div className="flex items-center gap-4 text-[11px] font-mono text-white/30">
                                            <span>{preambleCount} preambular</span>
                                            <span>{operativeCount} operative</span>
                                            {res.blocs?.member_countries?.length > 0 && (
                                                <span>{res.blocs.member_countries.length} countries</span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-[#c9a84c]/60 group-hover:text-[#c9a84c] text-lg shrink-0 mt-1">→</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
