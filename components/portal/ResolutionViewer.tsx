'use client';

import type { Resolution } from '@/lib/actions/resolutions';

export default function ResolutionViewer({ resolution }: { resolution: any }) {
    const { preamble, operative } = resolution.content_json as {
        preamble: { position: number; text: string }[];
        operative: { position: number; text: string }[];
    };

    const sortedPreamble = [...preamble].sort((a, b) => a.position - b.position);
    const sortedOperative = [...operative].sort((a, b) => a.position - b.position);

    return (
        <>
            {/* Print styles */}
            <style>{`
                @media print {
                    nav, a[href], button { display: none !important; }
                    body { background: white !important; color: black !important; }
                    .resolution-doc { border: none !important; background: white !important; }
                    .clause-preamble { font-style: italic; color: black !important; }
                    .clause-operative { color: black !important; }
                }
            `}</style>

            <div className="resolution-doc bg-[#0d0d14] border border-white/10 rounded-lg p-8 mb-6 font-mono text-sm leading-relaxed">
                {/* Document Title */}
                <div className="text-center mb-8 pb-6 border-b border-white/10">
                    <div className="text-[#c9a84c] text-xs tracking-widest uppercase mb-2">Draft Resolution</div>
                    <div className="text-white/70 text-xs">SISMUN Conclave 2026</div>
                </div>

                {/* Preamble */}
                {sortedPreamble.length > 0 && (
                    <div className="mb-8">
                        <div className="text-[10px] font-mono text-white/25 tracking-widest uppercase mb-4">
                            Preambulatory Clauses
                        </div>
                        <div className="space-y-3">
                            {sortedPreamble.map((clause, i) => (
                                <p key={i} className="clause-preamble text-white/70 italic pl-4 border-l border-white/10">
                                    {clause.text}{i < sortedPreamble.length - 1 ? ',' : ';'}
                                </p>
                            ))}
                        </div>
                    </div>
                )}

                {/* Operative */}
                {sortedOperative.length > 0 && (
                    <div>
                        <div className="text-[10px] font-mono text-white/25 tracking-widest uppercase mb-4">
                            Operative Clauses
                        </div>
                        <ol className="space-y-3 list-none">
                            {sortedOperative.map((clause, i) => (
                                <li key={i} className="clause-operative flex gap-3">
                                    <span className="text-[#c9a84c] font-bold shrink-0 w-6 text-right">{i + 1}.</span>
                                    <span className="text-white/80 font-semibold">{clause.text}{i < sortedOperative.length - 1 ? ';' : '.'}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                )}

                {preamble.length === 0 && operative.length === 0 && (
                    <div className="text-center py-8 text-white/20 text-sm">
                        Resolution has no clauses yet.
                    </div>
                )}

                {/* Print button */}
                <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                    <button
                        onClick={() => window.print()}
                        className="text-xs font-mono text-white/25 hover:text-white/50 transition-colors"
                    >
                        ⊕ PRINT / PDF
                    </button>
                </div>
            </div>
        </>
    );
}
