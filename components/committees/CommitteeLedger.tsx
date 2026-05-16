'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';
import Link from 'next/link';

interface Resolution {
    id: string;
    topic_index: number;
    content_json: { preamble: any[]; operative: any[] };
    submitted_by_name?: string;
    submitted_by_country?: string;
    blocs?: { bloc_name: string; member_countries: string[] } | null;
}

export default function CommitteeLedger({ slug, acronym, topics }: { slug: string; acronym: string; topics: string[] }) {
    const [resolutions, setResolutions] = useState<Resolution[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchResolutions() {
            const { data } = await supabase
                .from('resolutions')
                .select('*, blocs(bloc_name, member_countries)')
                .eq('committee_slug', slug)
                .eq('status', 'floor')
                .eq('is_deleted', false)
                .order('submitted_at', { ascending: false });

            if (data) setResolutions(data);
            setLoading(false);
        }
        fetchResolutions();
    }, [slug, supabase]);

    if (loading) return (
        <div className="py-20 text-center animate-pulse">
            <div className="w-12 h-12 bg-charcoal/5 rounded-full mx-auto mb-4" />
            <p className="text-xs font-mono text-charcoal/30 uppercase tracking-widest">Loading Ledger...</p>
        </div>
    );

    return (
        <div className="mt-24 pt-24 border-t border-charcoal/10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-4 mb-4 text-school-red font-mono text-[10px] tracking-[0.4em] uppercase font-bold">
                        <span className="w-1.5 h-1.5 bg-school-red rounded-full" />
                        Digital Resolution Ledger
                    </div>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-charcoal uppercase tracking-tighter">
                        On The Floor
                    </h2>
                </div>
                <Link
                    href={`/portal/${slug}/submit`}
                    className="group inline-flex items-center gap-3 px-6 py-3 bg-charcoal text-white rounded-full text-xs font-mono uppercase tracking-widest hover:bg-school-red transition-all duration-500"
                >
                    Submit Resolution
                    <span className="group-hover:translate-x-1 transition-transform duration-500">→</span>
                </Link>
            </div>

            {resolutions.length === 0 ? (
                <div className="bg-charcoal/[0.02] border border-dashed border-charcoal/10 rounded-3xl p-20 text-center">
                    <p className="text-charcoal/30 font-mono text-sm uppercase tracking-widest mb-4">No resolutions approved yet</p>
                    <p className="text-charcoal/50 text-sm max-w-sm mx-auto leading-relaxed">
                        Delegates from the <span className="text-charcoal font-bold">{acronym}</span> committee can submit their draft resolutions for EB review via the portal.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {resolutions.map((res) => {
                        const topic = topics[res.topic_index] ?? `Topic ${res.topic_index + 1}`;
                        const preambleCount = res.content_json?.preamble?.length ?? 0;
                        const operativeCount = res.content_json?.operative?.length ?? 0;

                        return (
                            <Link
                                key={res.id}
                                href={`/portal/floor/${res.id}`}
                                className="group relative bg-white border border-charcoal/5 hover:border-school-red/30 rounded-2xl p-8 transition-all duration-700 hover:shadow-2xl hover:shadow-school-red/5 overflow-hidden"
                            >
                                {/* Decorative Gradient */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-school-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-6">
                                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-full border border-emerald-500/20 uppercase tracking-widest">
                                            Live
                                        </span>
                                        {res.submitted_by_country && (
                                            <span className="text-[10px] font-mono text-charcoal/30 uppercase tracking-widest">
                                                By {res.submitted_by_country}
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-2xl font-display font-bold text-charcoal mb-3 group-hover:text-school-red transition-colors duration-500 leading-tight">
                                        {res.blocs?.bloc_name ?? 'Unnamed Bloc'}
                                    </h3>
                                    
                                    <p className="text-sm text-charcoal/50 line-clamp-2 mb-8 font-light italic">
                                        {topic}
                                    </p>

                                    <div className="flex items-center justify-between pt-6 border-t border-charcoal/5">
                                        <div className="flex gap-4">
                                            <div className="text-center">
                                                <p className="text-[10px] font-mono text-charcoal/20 uppercase">Preambs</p>
                                                <p className="text-sm font-display font-bold text-charcoal/70">{preambleCount}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] font-mono text-charcoal/20 uppercase">Operative</p>
                                                <p className="text-sm font-display font-bold text-charcoal/70">{operativeCount}</p>
                                            </div>
                                        </div>
                                        <span className="text-school-red opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                                            View Resolution →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
