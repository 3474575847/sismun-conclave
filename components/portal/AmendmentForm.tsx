'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { proposeAmendment } from '@/lib/actions/amendments';
import AmendmentClosedBanner from '@/components/portal/AmendmentClosedBanner';

interface AmendmentFormProps {
    resId: string;
    acceptingAmendments: boolean;
}

export default function AmendmentForm({ resId, acceptingAmendments }: AmendmentFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [form, setForm] = useState({
        proposer_name: '',
        proposer_country: '',
        clause_section: 'operative' as 'preamble' | 'operative',
        clause_position: 1.0,
        type: 'modify' as 'add' | 'strike' | 'modify',
        suggested_text: '',
        target_position: 2.0,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Client-side gate: check accepting_amendments before any server call
        if (!acceptingAmendments) {
            setError('Amendment proposals are currently closed. Please try again later.');
            return;
        }

        startTransition(async () => {
            try {
                await proposeAmendment({
                    resolution_id: resId,
                    clause_section: form.clause_section,
                    clause_position: form.clause_position,
                    target_position: form.type === 'add' ? form.target_position : undefined,
                    proposer_name: form.proposer_name.trim(),
                    proposer_country: form.proposer_country.trim(),
                    type: form.type,
                    suggested_text: form.type !== 'strike' ? form.suggested_text.trim() : undefined,
                });
                setSuccess(true);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : (err as { message?: string })?.message ?? 'Submission failed.';
                setError(message);
            }
        });
    };

    if (success) {
        return (
            <div className="max-w-lg mx-auto px-6 py-20 text-center">
                <div className="text-4xl mb-4">✓</div>
                <h2 className="text-lg font-semibold text-white mb-2">Amendment Proposed</h2>
                <p className="text-sm text-white/40 mb-8">
                    Your amendment has been submitted to the EB queue for review.
                </p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => { setSuccess(false); setForm({ ...form, suggested_text: '' }); }}
                        className="px-4 py-2 text-sm font-mono border border-white/10 text-white/40 rounded hover:text-white/70 transition-colors"
                    >
                        Propose Another
                    </button>
                    <button
                        onClick={() => router.push(`/portal/floor/${resId}`)}
                        className="px-4 py-2 text-sm font-mono bg-[#c9a84c]/15 border border-[#c9a84c]/30 text-[#c9a84c] rounded hover:bg-[#c9a84c]/25 transition-colors"
                    >
                        Back to Resolution
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto px-6 py-8">
            <div className="mb-6">
                <div className="flex items-center gap-2 text-xs font-mono text-white/30 mb-3">
                    <a href={`/portal/floor/${resId}`} className="hover:text-white/60 transition-colors">← Resolution</a>
                </div>
                <h1 className="text-xl font-semibold text-white mb-1">Propose Amendment</h1>
                <p className="text-sm text-white/40">Your proposal will be reviewed by the EB before being applied.</p>
            </div>

            {/* Closed banner — shown above the form when amendments are closed */}
            {!acceptingAmendments && (
                <AmendmentClosedBanner message="The Executive Board has closed amendment proposals. No new amendments can be submitted at this time." />
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Proposer */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[10px] font-mono text-white/40 mb-1.5 tracking-wider uppercase">Your Name</label>
                        <input
                            value={form.proposer_name}
                            onChange={e => setForm({ ...form, proposer_name: e.target.value })}
                            required
                            placeholder="Delegate Name"
                            disabled={!acceptingAmendments}
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c9a84c]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-mono text-white/40 mb-1.5 tracking-wider uppercase">Country</label>
                        <input
                            value={form.proposer_country}
                            onChange={e => setForm({ ...form, proposer_country: e.target.value })}
                            required
                            placeholder="Country Name"
                            disabled={!acceptingAmendments}
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c9a84c]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>
                </div>

                {/* Clause target */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[10px] font-mono text-white/40 mb-1.5 tracking-wider uppercase">Clause Section</label>
                        <select
                            value={form.clause_section}
                            onChange={e => setForm({ ...form, clause_section: e.target.value as 'preamble' | 'operative' })}
                            disabled={!acceptingAmendments}
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#c9a84c]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="preamble">Preamble</option>
                            <option value="operative">Operative</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-mono text-white/40 mb-1.5 tracking-wider uppercase">Clause #</label>
                        <input
                            type="number"
                            min={1}
                            step={0.5}
                            value={form.clause_position}
                            onChange={e => setForm({ ...form, clause_position: parseFloat(e.target.value) })}
                            disabled={!acceptingAmendments}
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#c9a84c]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>
                </div>

                {/* Type */}
                <div>
                    <label className="block text-[10px] font-mono text-white/40 mb-2 tracking-wider uppercase">Amendment Type</label>
                    <div className="grid grid-cols-3 gap-2">
                        {(['modify', 'add', 'strike'] as const).map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setForm({ ...form, type })}
                                disabled={!acceptingAmendments}
                                className={`py-2 text-xs font-mono rounded border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                    form.type === type
                                        ? type === 'add' ? 'bg-emerald-400/15 border-emerald-400/40 text-emerald-400'
                                        : type === 'strike' ? 'bg-red-400/15 border-red-400/40 text-red-400'
                                        : 'bg-blue-400/15 border-blue-400/40 text-blue-400'
                                        : 'border-white/10 text-white/40 hover:text-white/70'
                                }`}
                            >
                                {type.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Add: target position */}
                {form.type === 'add' && (
                    <div>
                        <label className="block text-[10px] font-mono text-white/40 mb-1.5 tracking-wider uppercase">
                            Insert After Clause # (position)
                        </label>
                        <input
                            type="number"
                            min={0.5}
                            step={0.5}
                            value={form.target_position}
                            onChange={e => setForm({ ...form, target_position: parseFloat(e.target.value) })}
                            disabled={!acceptingAmendments}
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#c9a84c]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <p className="text-[11px] font-mono text-white/25 mt-1">
                            Use 1.5 to insert between clauses 1 and 2
                        </p>
                    </div>
                )}

                {/* Suggested text */}
                {form.type !== 'strike' && (
                    <div>
                        <label className="block text-[10px] font-mono text-white/40 mb-1.5 tracking-wider uppercase">
                            {form.type === 'add' ? 'New Clause Text' : 'Replacement Text'}
                        </label>
                        <textarea
                            value={form.suggested_text}
                            onChange={e => setForm({ ...form, suggested_text: e.target.value })}
                            required
                            rows={4}
                            disabled={!acceptingAmendments}
                            placeholder={form.type === 'add'
                                ? 'Encourages all member states to...'
                                : 'Replace existing clause with...'}
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c9a84c]/40 transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>
                )}

                {form.type === 'strike' && (
                    <div className="bg-red-400/5 border border-red-400/20 rounded p-3 text-xs font-mono text-red-400/70">
                        This will propose the complete removal of clause {form.clause_position} from the {form.clause_section}.
                    </div>
                )}

                {error && (
                    <div className="text-xs text-red-400 font-mono bg-red-400/10 border border-red-400/20 rounded px-3 py-2">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isPending || !acceptingAmendments}
                    className="w-full py-2.5 bg-[#c9a84c] hover:bg-[#d4b560] disabled:bg-[#c9a84c]/40 disabled:cursor-not-allowed text-[#0a0a0f] text-sm font-semibold rounded transition-colors"
                >
                    {isPending ? 'Submitting...' : !acceptingAmendments ? 'Amendments Closed' : 'Submit Amendment'}
                </button>
            </form>
        </div>
    );
}
