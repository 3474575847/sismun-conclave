'use client';

import { useState } from 'react';

type Amendment = {
    id: string;
    clause_section: string;
    clause_position: number;
    proposer_name: string;
    proposer_country: string;
    type: string;
    suggested_text: string | null;
    vote_status: string;
    created_at: string;
};

type Clause = {
    position: number;
    text: string;
    type: 'preamble' | 'operative';
};

type SnapshotJson = {
    preamble: Clause[];
    operative: Clause[];
};

type LogEntry = {
    id: string;
    action: string;
    clause_before: string | null;
    clause_after: string | null;
    full_snapshot_json: SnapshotJson | null;
    amendment_id: string | null;
    timestamp: string;
    // amendment details joined or inferred
    type?: string;
    clause_section?: string;
};

function SnapshotViewer({ snapshot }: { snapshot: SnapshotJson }) {
    const preamble = [...(snapshot.preamble ?? [])].sort((a, b) => a.position - b.position);
    const operative = [...(snapshot.operative ?? [])].sort((a, b) => a.position - b.position);

    return (
        <div className="mt-2 p-3 bg-black/30 border border-white/10 rounded-lg space-y-3">
            {preamble.length > 0 && (
                <div>
                    <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-1.5">
                        Preamble
                    </p>
                    <ol className="space-y-1">
                        {preamble.map((clause, i) => (
                            <li key={clause.position} className="flex gap-2 text-xs font-mono text-white/50">
                                <span className="shrink-0 text-white/25">{i + 1}.</span>
                                <span className="italic">{clause.text}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            )}
            {operative.length > 0 && (
                <div>
                    <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-1.5">
                        Operative
                    </p>
                    <ol className="space-y-1">
                        {operative.map((clause, i) => (
                            <li key={clause.position} className="flex gap-2 text-xs font-mono text-white/50">
                                <span className="shrink-0 text-white/25">{i + 1}.</span>
                                <span>{clause.text}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </div>
    );
}

function LogEntryRow({ entry }: { entry: LogEntry }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="py-2.5 border-b border-white/5">
            <div className="flex items-start gap-3">
                <div className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 mt-0.5 ${
                    entry.action === 'approved'
                        ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10'
                        : 'text-red-400 border-red-400/30 bg-red-400/10'
                }`}>
                    {entry.action.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    {/* Amendment type badge */}
                    {entry.type && (
                        <span className="text-[10px] font-mono text-white/30 mr-2">
                            {entry.type.toUpperCase()}
                            {entry.clause_section ? ` · ${entry.clause_section}` : ''}
                        </span>
                    )}

                    {/* Clause diff */}
                    {entry.clause_before && (
                        <div className="text-xs font-mono">
                            <span className="text-red-400/70 line-through">{entry.clause_before}</span>
                        </div>
                    )}
                    {entry.clause_after && (
                        <div className="text-xs font-mono">
                            <span className="text-emerald-400/70">+ {entry.clause_after}</span>
                        </div>
                    )}

                    {/* Timestamp */}
                    <div className="text-[11px] text-white/25 font-mono mt-0.5">
                        {new Date(entry.timestamp).toLocaleString()}
                    </div>

                    {/* Collapsible snapshot */}
                    {entry.full_snapshot_json && (
                        <div className="mt-1.5">
                            <button
                                onClick={() => setOpen(v => !v)}
                                className="flex items-center gap-1 text-[11px] font-mono text-white/30 hover:text-[#c9a84c] transition-colors"
                            >
                                <span className={`transition-transform duration-150 ${open ? 'rotate-90' : ''}`}>
                                    ▶
                                </span>
                                View snapshot
                            </button>
                            {open && <SnapshotViewer snapshot={entry.full_snapshot_json} />}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AmendmentList({
    amendments,
    resolutionId,
    log,
}: {
    amendments: Amendment[];
    resolutionId: string;
    log: LogEntry[];
}) {
    const [activeTab, setActiveTab] = useState<'pending' | 'resolved' | 'history'>('pending');

    const pending = amendments.filter(a => a.vote_status === 'pending');
    const resolved = amendments.filter(a => a.vote_status !== 'pending');

    const typeColor = (type: string) => {
        const m: Record<string, string> = {
            add: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
            strike: 'text-red-400 border-red-400/30 bg-red-400/10',
            modify: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
        };
        return m[type] ?? 'text-white/40 border-white/10 bg-white/5';
    };

    const voteColor = (status: string) => {
        const m: Record<string, string> = {
            pending: 'text-amber-400',
            passed: 'text-emerald-400',
            failed: 'text-red-400',
        };
        return m[status] ?? 'text-white/40';
    };

    // suppress unused warning — resolutionId kept for future use
    void resolutionId;

    return (
        <div className="mt-8">
            <div className="flex items-center gap-1 mb-4 border-b border-white/10 pb-1">
                {(['pending', 'resolved', 'history'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1.5 text-xs font-mono tracking-wider transition-colors ${
                            activeTab === tab
                                ? 'text-[#c9a84c] border-b-2 border-[#c9a84c] -mb-[3px]'
                                : 'text-white/30 hover:text-white/60'
                        }`}
                    >
                        {tab.toUpperCase()}
                        {tab === 'pending' && pending.length > 0 && (
                            <span className="ml-1.5 px-1 bg-amber-400/20 text-amber-400 rounded text-[10px]">
                                {pending.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {activeTab === 'pending' && (
                <div className="space-y-3">
                    {pending.length === 0 ? (
                        <p className="text-center py-8 text-white/20 text-sm font-mono">No pending amendments.</p>
                    ) : (
                        pending.map(a => (
                            <div key={a.id} className="bg-white/[0.03] border border-white/8 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${typeColor(a.type)}`}>
                                        {a.type.toUpperCase()}
                                    </span>
                                    <span className="text-[10px] font-mono text-white/30">
                                        {a.clause_section} · position {a.clause_position}
                                    </span>
                                </div>
                                {a.suggested_text && (
                                    <p className="text-sm text-white/70 italic mb-2 font-mono">
                                        &ldquo;{a.suggested_text}&rdquo;
                                    </p>
                                )}
                                <div className="text-[11px] font-mono text-white/30">
                                    Proposed by <span className="text-white/50">{a.proposer_name}</span>
                                    {' · '}<span className="text-white/50">{a.proposer_country}</span>
                                    {' · '}{new Date(a.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'resolved' && (
                <div className="space-y-3">
                    {resolved.length === 0 ? (
                        <p className="text-center py-8 text-white/20 text-sm font-mono">No resolved amendments.</p>
                    ) : (
                        resolved.map(a => (
                            <div key={a.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-4 opacity-70">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${typeColor(a.type)}`}>
                                        {a.type.toUpperCase()}
                                    </span>
                                    <span className={`text-[10px] font-mono ${voteColor(a.vote_status)}`}>
                                        {a.vote_status.toUpperCase()}
                                    </span>
                                </div>
                                {a.suggested_text && (
                                    <p className="text-sm text-white/50 italic font-mono">&ldquo;{a.suggested_text}&rdquo;</p>
                                )}
                                <div className="text-[11px] font-mono text-white/25 mt-1">
                                    {a.proposer_name} · {a.proposer_country}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'history' && (
                <div className="space-y-0">
                    {log.length === 0 ? (
                        <p className="text-center py-8 text-white/20 text-sm font-mono">No amendment history.</p>
                    ) : (
                        log.map(entry => (
                            <LogEntryRow key={entry.id} entry={entry} />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
