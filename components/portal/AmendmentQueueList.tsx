'use client';

import { useState, useTransition } from 'react';
import { approveAmendment, rejectAmendment } from '@/lib/actions/amendments';
import { useRouter } from 'next/navigation';

export default function AmendmentQueueList({ 
    initialAmendments,
    profile 
}: { 
    initialAmendments: any[];
    profile: any;
}) {
    const [isPending, startTransition] = useTransition();
    const [processingId, setProcessingId] = useState<string | null>(null);
    const router = useRouter();

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        if (!confirm(`Are you sure you want to ${action} this amendment?`)) return;
        
        setProcessingId(id);
        startTransition(async () => {
            try {
                if (action === 'approve') {
                    await approveAmendment(id);
                } else {
                    await rejectAmendment(id);
                }
                router.refresh();
            } catch (err: any) {
                alert(err.message);
            } finally {
                setProcessingId(null);
            }
        });
    };

    return (
        <div className="space-y-4">
            {initialAmendments.map((amd) => (
                <div 
                    key={amd.id} 
                    className={`bg-white/[0.03] border border-white/10 rounded-xl p-6 transition-all ${processingId === amd.id ? 'opacity-50 grayscale' : ''}`}
                >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                                    amd.type === 'add' ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10' :
                                    amd.type === 'strike' ? 'text-red-400 border-red-400/30 bg-red-400/10' :
                                    'text-blue-400 border-blue-400/30 bg-blue-400/10'
                                }`}>
                                    {amd.type.toUpperCase()}
                                </span>
                                <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                                    {amd.resolutions?.blocs?.bloc_name} · {amd.clause_section} {amd.clause_position}
                                </span>
                            </div>

                            <div className="mb-4">
                                {amd.suggested_text ? (
                                    <p className="text-sm text-white/80 font-mono italic leading-relaxed border-l-2 border-white/10 pl-4 py-1">
                                        &ldquo;{amd.suggested_text}&rdquo;
                                    </p>
                                ) : (
                                    <p className="text-sm text-red-400/60 font-mono italic">Striking existing clause.</p>
                                )}
                            </div>

                            <div className="flex items-center gap-4 text-[11px] font-mono text-white/20">
                                <span>PROPOSED BY: <span className="text-white/40">{amd.proposer_name} ({amd.proposer_country})</span></span>
                                <span>TIME: <span className="text-white/40">{new Date(amd.created_at).toLocaleTimeString()}</span></span>
                            </div>
                        </div>

                        <div className="flex md:flex-col gap-2 shrink-0">
                            <button
                                onClick={() => handleAction(amd.id, 'approve')}
                                disabled={isPending}
                                className="flex-1 px-6 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono rounded transition-all"
                            >
                                APPROVE
                            </button>
                            <button
                                onClick={() => handleAction(amd.id, 'reject')}
                                disabled={isPending}
                                className="flex-1 px-6 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold font-mono rounded transition-all"
                            >
                                REJECT
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
