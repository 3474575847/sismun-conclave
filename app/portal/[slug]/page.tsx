import { createClient } from '@/lib/supabase-server';
import { committees } from '@/data/committees';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CommitteeFloorPage({ params }: { params: { slug: string } }) {
    const committee = committees.find(c => c.slug === params.slug);
    if (!committee) notFound();

    const supabase = createClient();
    const { data: resolutions } = await supabase
        .from('resolutions')
        .select('*, blocs(bloc_name, member_countries)')
        .eq('committee_slug', params.slug)
        .eq('status', 'floor')
        .eq('is_deleted', false)
        .order('submitted_at', { ascending: false });

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            {/* Committee Header */}
            <div className="mb-10 pb-8 border-b border-white/8">
                <div className="flex items-start justify-between gap-6">
                    <div>
                        <span className="inline-block text-xs font-mono text-[#c9a84c]/60 tracking-widest uppercase mb-3">{committee.acronym}</span>
                        <h1 className="text-2xl font-bold text-white mb-2">{committee.name}</h1>
                        <p className="text-sm text-white/40 max-w-xl">{committee.description}</p>
                    </div>
                    <Link
                        href={`/portal/${params.slug}/submit`}
                        className="shrink-0 px-5 py-2.5 bg-[#c9a84c]/10 hover:bg-[#c9a84c]/20 border border-[#c9a84c]/30 hover:border-[#c9a84c]/50 rounded-lg text-xs font-mono text-[#c9a84c] transition-all whitespace-nowrap"
                    >
                        + Submit Resolution
                    </Link>
                </div>

                {/* Topics */}
                <div className="mt-6 space-y-2">
                    <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-3">Agenda Topics</p>
                    {committee.topics.map((topic, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <span className="text-xs font-mono text-[#c9a84c]/40 shrink-0 mt-0.5">{i + 1}.</span>
                            <p className="text-xs text-white/50 leading-relaxed">{topic}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Resolutions on Floor */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-sm font-semibold text-white">Approved Resolutions</h2>
                    <span className="text-xs font-mono text-white/20">{resolutions?.length ?? 0} on floor</span>
                </div>

                {!resolutions || resolutions.length === 0 ? (
                    <div className="text-center py-20 bg-white/[0.02] border border-dashed border-white/8 rounded-xl">
                        <div className="text-white/10 text-3xl mb-4 font-mono">_</div>
                        <p className="text-sm text-white/25 font-mono">No approved resolutions yet.</p>
                        <p className="text-xs text-white/15 mt-2">
                            Delegates can <Link href={`/portal/${params.slug}/submit`} className="text-[#c9a84c]/40 hover:text-[#c9a84c] underline">submit a resolution</Link> for EB review.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {resolutions.map((res: any) => {
                            const topic = committee.topics[res.topic_index] ?? `Topic ${res.topic_index + 1}`;
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
                                                <span className="text-[10px] font-mono text-emerald-400/70 border border-emerald-400/20 bg-emerald-400/5 px-2 py-0.5 rounded">ON FLOOR</span>
                                                {res.submitted_by_name && (
                                                    <span className="text-[10px] font-mono text-white/25">
                                                        by {res.submitted_by_name} · {res.submitted_by_country}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-sm font-semibold text-white/90 group-hover:text-white mb-1 truncate">
                                                {res.blocs?.bloc_name ?? 'Unnamed Bloc'}
                                            </h3>
                                            <p className="text-xs text-white/40 line-clamp-1 mb-3">{topic}</p>
                                            <div className="flex items-center gap-4 text-[11px] font-mono text-white/25">
                                                <span>{preambleCount} preambular</span>
                                                <span>{operativeCount} operative</span>
                                                {res.blocs?.member_countries?.length > 0 && (
                                                    <span>{res.blocs.member_countries.length} countries</span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-[#c9a84c]/40 group-hover:text-[#c9a84c] text-lg shrink-0 mt-1">→</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
