'use client';

import { useState, useTransition } from 'react';
import { createResolution, createBloc } from '@/lib/actions/resolutions';
import { useRouter } from 'next/navigation';
import { committees as allCommittees } from '@/data/committees';

export default function CreateResolutionButton({ 
    committeeSlug, 
    role 
}: { 
    committeeSlug: string | null;
    role: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const [formData, setFormData] = useState({
        committee_slug: committeeSlug || '',
        topic_index: 0,
        bloc_name: '',
        member_countries: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        startTransition(async () => {
            try {
                // 1. Create the bloc
                const countries = formData.member_countries
                    .split(',')
                    .map(c => c.trim())
                    .filter(c => c.length > 0);

                const bloc = await createBloc({
                    committee_slug: formData.committee_slug,
                    topic_index: Number(formData.topic_index),
                    bloc_name: formData.bloc_name,
                    member_countries: countries,
                });

                // 2. Create the resolution
                const res = await createResolution({
                    bloc_id: bloc.id,
                    committee_slug: formData.committee_slug,
                    topic_index: Number(formData.topic_index),
                });

                setIsOpen(false);
                router.push(`/portal/eb/resolutions/${res.id}`);
            } catch (err: any) {
                alert(err.message);
            }
        });
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 bg-[#c9a84c] hover:bg-[#d4b560] text-[#0a0a0f] text-xs font-bold font-mono rounded transition-all shadow-lg shadow-[#c9a84c]/10"
            >
                + NEW RESOLUTION
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div 
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
                        onClick={() => !isPending && setIsOpen(false)}
                    />
                    
                    <form 
                        onSubmit={handleSubmit}
                        className="relative w-full max-w-md bg-[#0d0d14] border border-white/10 rounded-xl p-8 shadow-2xl"
                    >
                        <h2 className="text-xl font-bold text-white mb-1">Create Resolution</h2>
                        <p className="text-sm text-white/40 mb-8 font-mono">Initialize a new bloc and resolution document.</p>

                        <div className="space-y-4">
                            {role === 'sg' && (
                                <div>
                                    <label className="block text-[10px] font-mono text-white/40 mb-1.5 tracking-wider uppercase">Committee</label>
                                    <select
                                        value={formData.committee_slug}
                                        onChange={e => setFormData({ ...formData, committee_slug: e.target.value })}
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#c9a84c]/40 transition-colors"
                                    >
                                        <option value="" disabled>Select Committee</option>
                                        {allCommittees.map(c => (
                                            <option key={c.slug} value={c.slug}>{c.acronym}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-mono text-white/40 mb-1.5 tracking-wider uppercase">Topic</label>
                                <select
                                    value={formData.topic_index}
                                    onChange={e => setFormData({ ...formData, topic_index: Number(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#c9a84c]/40 transition-colors"
                                >
                                    <option value={0}>Agenda Item 1</option>
                                    <option value={1}>Agenda Item 2</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-mono text-white/40 mb-1.5 tracking-wider uppercase">Bloc Name</label>
                                <input
                                    value={formData.bloc_name}
                                    onChange={e => setFormData({ ...formData, bloc_name: e.target.value })}
                                    required
                                    placeholder="e.g. Global Health Initiative"
                                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c9a84c]/40 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-mono text-white/40 mb-1.5 tracking-wider uppercase">Countries (comma separated)</label>
                                <textarea
                                    value={formData.member_countries}
                                    onChange={e => setFormData({ ...formData, member_countries: e.target.value })}
                                    required
                                    placeholder="e.g. USA, UK, France, Japan"
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c9a84c]/40 transition-colors resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={() => setIsOpen(false)}
                                className="flex-1 py-2.5 text-xs font-mono text-white/40 border border-white/10 rounded hover:text-white/60 transition-colors"
                            >
                                CANCEL
                            </button>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="flex-1 py-2.5 bg-[#c9a84c] hover:bg-[#d4b560] disabled:bg-[#c9a84c]/40 text-[#0a0a0f] text-xs font-bold font-mono rounded transition-colors"
                            >
                                {isPending ? 'CREATING...' : 'CREATE'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}
