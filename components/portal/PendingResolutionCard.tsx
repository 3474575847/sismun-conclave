'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Resolution {
    id: string;
    committee_slug: string;
    topic_index: number;
    status: string;
    content_json: { preamble: any[]; operative: any[] };
    submitted_by_name?: string;
    submitted_by_country?: string;
    submitted_at?: string;
    blocs?: { bloc_name: string; member_countries: string[] } | null;
}

interface Props {
    resolution: Resolution;
    topicName: string;
    onAction: (id: string, action: 'approve' | 'reject', note?: string) => Promise<void>;
}

export default function PendingResolutionCard({ resolution, topicName, onAction }: Props) {
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [rejectNote, setRejectNote] = useState('');

    const handle = async (action: 'approve' | 'reject') => {
        setLoading(true);
        await onAction(resolution.id, action, action === 'reject' ? rejectNote : undefined);
        setLoading(false);
        setRejecting(false);
    };

    const preamble = resolution.content_json?.preamble ?? [];
    const operative = resolution.content_json?.operative ?? [];

    return (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
            {/* Card Header */}
            <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-[10px] font-mono text-amber-400/70 border border-amber-400/20 bg-amber-400/5 px-2 py-0.5 rounded">
                                PENDING REVIEW
                            </span>
                            {resolution.submitted_by_name && (
                                <span className="text-[10px] font-mono text-white/30">
                                    by {resolution.submitted_by_name} ({resolution.submitted_by_country})
                                </span>
                            )}
                            {resolution.submitted_at && (
                                <span className="text-[10px] font-mono text-white/20">
                                    {new Date(resolution.submitted_at).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                        <h3 className="text-sm font-semibold text-white mb-1">
                            {resolution.blocs?.bloc_name ?? 'Unnamed Bloc'}
                        </h3>
                        <p className="text-xs text-white/35 line-clamp-2 mb-3">{topicName}</p>
                        {resolution.blocs?.member_countries?.length ? (
                            <div className="flex flex-wrap gap-1">
                                {resolution.blocs.member_countries.map(c => (
                                    <span key={c} className="text-[10px] font-mono bg-white/5 border border-white/8 px-2 py-0.5 rounded text-white/40">{c}</span>
                                ))}
                            </div>
                        ) : null}
                    </div>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-xs font-mono text-white/30 hover:text-white/60 border border-white/10 px-3 py-1 rounded transition-all shrink-0"
                    >
                        {expanded ? 'Collapse' : `Preview (${preamble.length}P / ${operative.length}O)`}
                    </button>
                </div>
            </div>

            {/* Expanded Preview */}
            {expanded && (
                <div className="border-t border-white/8 px-5 py-4 bg-black/20 space-y-4">
                    {preamble.length > 0 && (
                        <div>
                            <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-2">Preambulatory Clauses</p>
                            <ol className="space-y-1.5">
                                {preamble.map((c: any, i: number) => (
                                    <li key={i} className="text-xs text-white/50 leading-relaxed">
                                        <span className="text-white/20 font-mono mr-2">{i + 1}.</span>{c.text}
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}
                    {operative.length > 0 && (
                        <div>
                            <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-2">Operative Clauses</p>
                            <ol className="space-y-1.5">
                                {operative.map((c: any, i: number) => (
                                    <li key={i} className="text-xs text-white/50 leading-relaxed">
                                        <span className="text-white/20 font-mono mr-2">{i + 1}.</span>{c.text}
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="border-t border-white/8 px-5 py-3 flex items-center gap-3">
                {rejecting ? (
                    <div className="flex-1 flex items-center gap-3">
                        <input
                            type="text"
                            placeholder="Rejection reason (optional)..."
                            value={rejectNote}
                            onChange={e => setRejectNote(e.target.value)}
                            className="flex-1 bg-white/[0.04] border border-white/10 rounded px-3 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-red-400/30"
                        />
                        <button
                            onClick={() => handle('reject')}
                            disabled={loading}
                            className="px-4 py-1.5 bg-red-500/10 border border-red-500/30 rounded text-xs font-mono text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-40"
                        >
                            {loading ? '…' : 'Confirm Reject'}
                        </button>
                        <button
                            onClick={() => setRejecting(false)}
                            className="text-xs font-mono text-white/30 hover:text-white/60 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <>
                        <button
                            onClick={() => handle('approve')}
                            disabled={loading}
                            className="px-5 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-xs font-mono text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-40"
                        >
                            {loading ? '…' : '✓ Approve'}
                        </button>
                        <button
                            onClick={() => setRejecting(true)}
                            disabled={loading}
                            className="px-5 py-1.5 bg-red-500/10 border border-red-500/30 rounded text-xs font-mono text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-40"
                        >
                            ✕ Reject
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
