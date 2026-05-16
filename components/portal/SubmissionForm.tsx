'use client';

import { useState } from 'react';
import type { Committee } from '@/data/committees';
import SubmissionClosedBanner from '@/components/portal/SubmissionClosedBanner';
import { createDelegateSubmission } from '@/lib/actions/delegate';

interface Clause {
    id: string;
    text: string;
}

interface SubmissionFormProps {
    committee: Committee;
    acceptingSubmissions: boolean;
}

function makeId() { return Math.random().toString(36).slice(2); }

export default function SubmissionForm({ committee, acceptingSubmissions }: SubmissionFormProps) {
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [submitterName, setSubmitterName] = useState('');
    const [submitterCountry, setSubmitterCountry] = useState('');
    const [blocName, setBlocName] = useState('');
    const [memberCountries, setMemberCountries] = useState('');
    const [topicIndex, setTopicIndex] = useState(0);
    const [preamble, setPreamble] = useState<Clause[]>([{ id: makeId(), text: '' }]);
    const [operative, setOperative] = useState<Clause[]>([{ id: makeId(), text: '' }]);

    const addClause = (setter: React.Dispatch<React.SetStateAction<Clause[]>>) => {
        setter(prev => [...prev, { id: makeId(), text: '' }]);
    };

    const updateClause = (setter: React.Dispatch<React.SetStateAction<Clause[]>>, id: string, text: string) => {
        setter(prev => prev.map(c => c.id === id ? { ...c, text } : c));
    };

    const removeClause = (setter: React.Dispatch<React.SetStateAction<Clause[]>>, id: string) => {
        setter(prev => prev.filter(c => c.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Client-side gate: UX optimisation — the server action is the authoritative gate
        if (!acceptingSubmissions) {
            setError('Submissions are currently closed. Please try again later.');
            return;
        }

        if (!submitterName || !submitterCountry || !blocName) {
            setError('Please fill in all required fields.');
            return;
        }
        if (preamble.every(c => !c.text.trim()) || operative.every(c => !c.text.trim())) {
            setError('Please add at least one preambulatory and one operative clause.');
            return;
        }

        setSubmitting(true);
        try {
            const countries = memberCountries.split(',').map(s => s.trim()).filter(Boolean);

            // Delegate all validation, settings checks, and DB writes to the server action
            await createDelegateSubmission({
                submitterName,
                submitterCountry,
                blocName,
                memberCountries: countries,
                topicIndex,
                committeeSlug: committee.slug,
                preamble: preamble.map(c => ({ text: c.text })),
                operative: operative.map(c => ({ text: c.text })),
            });

            setStep('success');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : (err as { message?: string })?.message ?? 'Submission failed. Please try again.';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    if (step === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center px-6">
                <div className="max-w-md w-full text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
                        <span className="text-emerald-400 text-2xl">✓</span>
                    </div>
                    <h1 className="text-xl font-bold text-white mb-3">Resolution Submitted</h1>
                    <p className="text-white/40 text-sm mb-8">
                        Your resolution has been submitted to the{' '}
                        <span className="text-[#c9a84c]">{committee.acronym}</span> committee for EB review.
                        It will appear on the floor once approved.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => {
                                setStep('form');
                                setSubmitterName(''); setSubmitterCountry(''); setBlocName('');
                                setMemberCountries(''); setTopicIndex(0);
                                setPreamble([{ id: makeId(), text: '' }]);
                                setOperative([{ id: makeId(), text: '' }]);
                            }}
                            className="px-4 py-2 bg-white/5 border border-white/10 rounded text-xs font-mono text-white/60 hover:text-white transition-all"
                        >
                            Submit Another
                        </button>
                        <a
                            href={`/portal/${committee.slug}`}
                            className="px-4 py-2 bg-[#c9a84c]/10 border border-[#c9a84c]/30 rounded text-xs font-mono text-[#c9a84c] hover:bg-[#c9a84c]/20 transition-all"
                        >
                            View Floor →
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    const inputCls = "w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#c9a84c]/40 focus:bg-white/[0.06] transition-all";
    const labelCls = "block text-xs font-mono text-white/40 mb-1.5 uppercase tracking-widest";

    return (
        <div className="max-w-2xl mx-auto px-6 py-10">
            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-mono text-[#c9a84c]/60 tracking-widest uppercase">{committee.acronym}</span>
                    <span className="text-white/20">·</span>
                    <span className="text-xs font-mono text-white/30">Resolution Submission</span>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">{committee.name}</h1>
                <p className="text-sm text-white/40">
                    Submit your bloc&apos;s draft resolution. The EB will review it before it appears on the floor.
                </p>
            </div>

            {/* Closed banner — shown above the form when submissions are closed */}
            {!acceptingSubmissions && (
                <SubmissionClosedBanner message="The Executive Board has closed resolution submissions. No new resolutions can be submitted at this time." />
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Submitter Info */}
                <div className="bg-white/[0.02] border border-white/8 rounded-xl p-6">
                    <h2 className="text-sm font-semibold text-white mb-5">Submitter Details</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Your Name *</label>
                            <input
                                className={inputCls}
                                placeholder="e.g. Aryan Jindal"
                                value={submitterName}
                                onChange={e => setSubmitterName(e.target.value)}
                                required
                                disabled={!acceptingSubmissions}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Your Country *</label>
                            <input
                                className={inputCls}
                                placeholder="e.g. India"
                                value={submitterCountry}
                                onChange={e => setSubmitterCountry(e.target.value)}
                                required
                                disabled={!acceptingSubmissions}
                            />
                        </div>
                    </div>
                </div>

                {/* Bloc Info */}
                <div className="bg-white/[0.02] border border-white/8 rounded-xl p-6">
                    <h2 className="text-sm font-semibold text-white mb-5">Bloc Information</h2>
                    <div className="space-y-4">
                        <div>
                            <label className={labelCls}>Bloc Name *</label>
                            <input
                                className={inputCls}
                                placeholder="e.g. Western Bloc"
                                value={blocName}
                                onChange={e => setBlocName(e.target.value)}
                                required
                                disabled={!acceptingSubmissions}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Member Countries (comma-separated)</label>
                            <input
                                className={inputCls}
                                placeholder="e.g. USA, UK, France, Germany"
                                value={memberCountries}
                                onChange={e => setMemberCountries(e.target.value)}
                                disabled={!acceptingSubmissions}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Topic *</label>
                            <div className="space-y-2">
                                {committee.topics.map((topic, i) => (
                                    <label key={i} className="flex items-start gap-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="topic"
                                            checked={topicIndex === i}
                                            onChange={() => setTopicIndex(i)}
                                            className="mt-0.5 accent-[#c9a84c]"
                                            disabled={!acceptingSubmissions}
                                        />
                                        <span className={`text-xs leading-relaxed transition-colors ${topicIndex === i ? 'text-white/80' : 'text-white/35 group-hover:text-white/55'}`}>
                                            {topic}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preamble Clauses */}
                <div className="bg-white/[0.02] border border-white/8 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-sm font-semibold text-white">Preambulatory Clauses</h2>
                        <button
                            type="button"
                            onClick={() => addClause(setPreamble)}
                            disabled={!acceptingSubmissions}
                            className="text-xs font-mono text-[#c9a84c]/70 hover:text-[#c9a84c] border border-[#c9a84c]/20 hover:border-[#c9a84c]/40 px-3 py-1 rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            + Add Clause
                        </button>
                    </div>
                    <div className="space-y-3">
                        {preamble.map((clause, i) => (
                            <div key={clause.id} className="flex gap-3 items-start">
                                <span className="text-xs font-mono text-white/20 mt-2.5 w-5 shrink-0">{i + 1}.</span>
                                <textarea
                                    className={`${inputCls} resize-none`}
                                    rows={2}
                                    placeholder="e.g. Noting with concern that..."
                                    value={clause.text}
                                    onChange={e => updateClause(setPreamble, clause.id, e.target.value)}
                                    disabled={!acceptingSubmissions}
                                />
                                {preamble.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeClause(setPreamble, clause.id)}
                                        disabled={!acceptingSubmissions}
                                        className="text-white/20 hover:text-red-400 text-lg mt-1.5 transition-colors shrink-0 disabled:cursor-not-allowed"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Operative Clauses */}
                <div className="bg-white/[0.02] border border-white/8 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-sm font-semibold text-white">Operative Clauses</h2>
                        <button
                            type="button"
                            onClick={() => addClause(setOperative)}
                            disabled={!acceptingSubmissions}
                            className="text-xs font-mono text-[#c9a84c]/70 hover:text-[#c9a84c] border border-[#c9a84c]/20 hover:border-[#c9a84c]/40 px-3 py-1 rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            + Add Clause
                        </button>
                    </div>
                    <div className="space-y-3">
                        {operative.map((clause, i) => (
                            <div key={clause.id} className="flex gap-3 items-start">
                                <span className="text-xs font-mono text-white/20 mt-2.5 w-5 shrink-0">{i + 1}.</span>
                                <textarea
                                    className={`${inputCls} resize-none`}
                                    rows={2}
                                    placeholder="e.g. Calls upon all member states to..."
                                    value={clause.text}
                                    onChange={e => updateClause(setOperative, clause.id, e.target.value)}
                                    disabled={!acceptingSubmissions}
                                />
                                {operative.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeClause(setOperative, clause.id)}
                                        disabled={!acceptingSubmissions}
                                        className="text-white/20 hover:text-red-400 text-lg mt-1.5 transition-colors shrink-0 disabled:cursor-not-allowed"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400 font-mono">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={submitting || !acceptingSubmissions}
                    className="w-full py-3 bg-[#c9a84c]/15 hover:bg-[#c9a84c]/25 border border-[#c9a84c]/30 hover:border-[#c9a84c]/50 rounded-lg text-sm font-semibold text-[#c9a84c] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {submitting ? 'Submitting…' : !acceptingSubmissions ? 'Submissions Closed' : 'Submit Resolution for EB Review →'}
                </button>
            </form>
        </div>
    );
}
