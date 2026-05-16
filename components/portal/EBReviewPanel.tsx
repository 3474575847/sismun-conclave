'use client';

import { useState } from 'react';
import { Committee } from '@/data/committees';
import PendingResolutionCard from './PendingResolutionCard';
import { useRouter } from 'next/navigation';
import { approveResolution, rejectResolution } from '@/lib/actions/resolutions';

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
    pendingResolutions: Resolution[];
    managedCommittees: Committee[];
}

export default function EBReviewPanel({ pendingResolutions, managedCommittees }: Props) {
    const [activeSlug, setActiveSlug] = useState(managedCommittees[0]?.slug ?? '');
    const [resolutions, setResolutions] = useState<Resolution[]>(pendingResolutions);
    const [toast, setToast] = useState('');
    const [actionError, setActionError] = useState<string | null>(null);
    const router = useRouter();

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleAction = async (id: string, action: 'approve' | 'reject', note?: string) => {
        setActionError(null);
        try {
            if (action === 'approve') {
                await approveResolution(id);
            } else {
                await rejectResolution(id, note);
            }
            setResolutions(prev => prev.filter(r => r.id !== id));
            showToast(action === 'approve' ? '✓ Resolution approved and published to the floor.' : '✕ Resolution rejected and removed.');
            router.refresh();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
            setActionError(message);
        }
    };

    const committeeResolutions = resolutions.filter(r => r.committee_slug === activeSlug);
    const activeCommittee = managedCommittees.find(c => c.slug === activeSlug);

    return (
        <div>
            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 right-6 bg-white/10 backdrop-blur border border-white/20 rounded-lg px-5 py-3 text-sm text-white font-mono z-50 animate-fade-in">
                    {toast}
                </div>
            )}

            {/* Committee Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
                {managedCommittees.map(c => {
                    const count = resolutions.filter(r => r.committee_slug === c.slug).length;
                    return (
                        <button
                            key={c.slug}
                            onClick={() => setActiveSlug(c.slug)}
                            className={`relative px-4 py-2 rounded-lg text-xs font-mono tracking-wider border transition-all ${
                                activeSlug === c.slug
                                    ? 'bg-[#c9a84c]/10 text-[#c9a84c] border-[#c9a84c]/30'
                                    : 'text-white/40 border-white/10 hover:text-white/70 hover:border-white/20'
                            }`}
                        >
                            {c.acronym}
                            {count > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-500 text-[9px] text-black font-bold flex items-center justify-center">
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Active Committee Panel */}
            {activeCommittee && (
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-base font-semibold text-white">{activeCommittee.name}</h2>
                            <p className="text-xs text-white/30 mt-1">
                                {committeeResolutions.length === 0
                                    ? 'No pending submissions'
                                    : `${committeeResolutions.length} resolution${committeeResolutions.length > 1 ? 's' : ''} awaiting review`}
                            </p>
                        </div>
                        <a
                            href={`/portal/${activeSlug}`}
                            className="text-xs font-mono text-white/30 hover:text-[#c9a84c] border border-white/10 hover:border-[#c9a84c]/30 px-3 py-1.5 rounded transition-all"
                            target="_blank"
                        >
                            View Floor ↗
                        </a>
                    </div>

                    {committeeResolutions.length === 0 ? (
                        <div className="text-center py-20 bg-white/[0.02] border border-dashed border-white/8 rounded-xl">
                            <div className="text-white/10 text-3xl mb-4 font-mono">✓</div>
                            <p className="text-sm text-white/25 font-mono">All clear — no pending submissions.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {committeeResolutions.map(res => (
                                <PendingResolutionCard
                                    key={res.id}
                                    resolution={res}
                                    topicName={activeCommittee.topics[res.topic_index] ?? `Topic ${res.topic_index + 1}`}
                                    onAction={handleAction}
                                />
                            ))}
                            {actionError && (
                                <div className="mt-3 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
                                    {actionError}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
