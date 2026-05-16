'use client';

import Link from 'next/link';
import { committees } from '@/data/committees';

export default function ResolutionGrid({ 
    resolutions, 
    isEB,
    committee
}: { 
    resolutions: any[]; 
    isEB: boolean;
    committee?: any;
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resolutions.map((res) => {
                const resCommittee = committee || committees.find(c => c.slug === res.committee_slug);
                const topic = resCommittee?.topics?.[res.topic_index] ?? `Topic ${res.topic_index + 1}`;
                
                return (
                    <Link
                        key={res.id}
                        href={isEB ? `/portal/eb/resolutions/${res.id}` : `/portal/floor/${res.id}`}
                        className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/8 hover:border-white/20 rounded-xl p-5 transition-all flex flex-col h-full"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-mono text-white/30 tracking-widest uppercase">
                                {resCommittee?.acronym ?? res.committee_slug}
                            </span>
                            <div className="w-2 h-2 rounded-full bg-[#c9a84c] animate-pulse" />
                        </div>
                        
                        <h3 className="text-white font-semibold mb-1 group-hover:text-[#c9a84c] transition-colors line-clamp-1">
                            {res.blocs?.bloc_name ?? 'Untitled Bloc'}
                        </h3>
                        <p className="text-xs text-white/40 line-clamp-2 mb-6 h-8">
                            {topic}
                        </p>
                        
                        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/20">
                            <span>
                                {res.content_json?.preamble?.length + res.content_json?.operative?.length} CLAUSES
                            </span>
                            <span>
                                UPDATED {new Date(res.updated_at).toLocaleDateString()}
                            </span>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
