'use client';

import { useState, useEffect } from 'react';
import { committees } from '@/data/committees';
import Link from 'next/link';

const CHAIR_PASSWORD = 'sismun2026'; // Simple password gate for chairs

export default function ChairAdminPage() {
    const [authed, setAuthed] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [draftUrls, setDraftUrls] = useState<Record<string, string>>({});
    const [inputs, setInputs] = useState<Record<string, string>>({});
    const [saved, setSaved] = useState<Record<string, boolean>>({});

    useEffect(() => {
        // Load all stored draft URLs on mount
        const loaded: Record<string, string> = {};
        committees.forEach(c => {
            const url = localStorage.getItem(`draft-resolution-${c.slug}`);
            if (url) loaded[c.slug] = url;
        });
        setDraftUrls(loaded);
        setInputs(loaded);
    }, []);

    const handleLogin = () => {
        if (passwordInput === CHAIR_PASSWORD) {
            setAuthed(true);
            setPasswordError(false);
        } else {
            setPasswordError(true);
        }
    };

    const handleSave = (slug: string) => {
        const url = inputs[slug]?.trim();
        if (url) {
            localStorage.setItem(`draft-resolution-${slug}`, url);
        } else {
            localStorage.removeItem(`draft-resolution-${slug}`);
        }
        setDraftUrls(prev => ({ ...prev, [slug]: url }));
        setSaved(prev => ({ ...prev, [slug]: true }));
        setTimeout(() => setSaved(prev => ({ ...prev, [slug]: false })), 2000);
    };

    const handleClear = (slug: string) => {
        localStorage.removeItem(`draft-resolution-${slug}`);
        setDraftUrls(prev => { const n = { ...prev }; delete n[slug]; return n; });
        setInputs(prev => ({ ...prev, [slug]: '' }));
    };

    if (!authed) {
        return (
            <main className="min-h-screen bg-platinum flex items-center justify-center px-8">
                <div className="w-full max-w-sm space-y-8">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-2xl font-display font-bold tracking-tighter">
                                <span className="text-school-red">SISMUN</span>
                                <span className="text-charcoal ml-1 uppercase">Conclave</span>
                            </span>
                        </div>
                        <h1 className="text-3xl font-display font-bold text-charcoal tracking-tight">Chair Portal</h1>
                        <p className="text-charcoal/50 font-mono text-xs uppercase tracking-widest mt-2">Post draft resolution links for your committee</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-mono text-charcoal/40 uppercase tracking-widest mb-2">Access Password</label>
                            <input
                                type="password"
                                value={passwordInput}
                                onChange={e => { setPasswordInput(e.target.value); setPasswordError(false); }}
                                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                                placeholder="Enter chair password"
                                className={`w-full px-5 py-4 bg-white border ${passwordError ? 'border-school-red' : 'border-charcoal/10'} rounded-xl font-mono text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-school-red transition-colors`}
                            />
                            {passwordError && <p className="text-school-red font-mono text-[10px] uppercase tracking-widest mt-2">Incorrect password</p>}
                        </div>
                        <button
                            onClick={handleLogin}
                            className="w-full px-6 py-4 bg-school-red text-white font-mono text-[10px] uppercase tracking-[0.4em] rounded-xl hover:bg-school-red/90 transition-colors"
                        >
                            Access Chair Portal
                        </button>
                    </div>

                    <div className="pt-4 border-t border-charcoal/10">
                        <Link href="/" className="text-[10px] font-mono text-charcoal/40 uppercase tracking-widest hover:text-charcoal transition-colors">
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-platinum text-charcoal">
            {/* Header */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-charcoal/10 px-8 py-5 flex items-center justify-between">
                <span className="text-xl font-display font-bold tracking-tighter">
                    <span className="text-school-red">SISMUN</span> Conclave Chair Portal
                </span>
                <div className="flex items-center gap-6">
                    <Link href="/" className="font-mono text-[10px] uppercase tracking-widest text-charcoal/40 hover:text-charcoal transition-colors">
                        ← Back to Site
                    </Link>
                    <button
                        onClick={() => setAuthed(false)}
                        className="font-mono text-[10px] uppercase tracking-widest text-school-red hover:text-school-red/70 transition-colors"
                    >
                        Log Out
                    </button>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-8 py-16 space-y-4">
                <div className="mb-12">
                    <h1 className="text-4xl font-display font-bold text-charcoal tracking-tight mb-3">Draft Resolution Links</h1>
                    <p className="text-charcoal/50 font-mono text-xs uppercase tracking-widest">
                        Paste a Google Docs link below for each committee. Delegates will see it on the committee page.
                    </p>
                </div>

                {committees.map(committee => (
                    <div key={committee.slug} className="bg-white rounded-2xl border border-charcoal/10 p-8 space-y-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="block text-[10px] font-mono text-school-red uppercase tracking-widest">{committee.acronym}</span>
                                <h2 className="text-xl font-display font-semibold text-charcoal mt-1">{committee.name}</h2>
                            </div>
                            {draftUrls[committee.slug] && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    <span className="text-green-700 font-mono text-[9px] uppercase tracking-widest">Live</span>
                                </span>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <input
                                type="url"
                                value={inputs[committee.slug] || ''}
                                onChange={e => setInputs(prev => ({ ...prev, [committee.slug]: e.target.value }))}
                                placeholder="https://docs.google.com/document/d/..."
                                className="flex-1 px-5 py-3 bg-charcoal/[0.03] border border-charcoal/10 rounded-xl font-mono text-xs text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-school-red transition-colors"
                            />
                            <button
                                onClick={() => handleSave(committee.slug)}
                                className={`px-6 py-3 rounded-xl font-mono text-[10px] uppercase tracking-widest transition-all duration-300 ${saved[committee.slug]
                                    ? 'bg-green-500 text-white'
                                    : 'bg-school-red text-white hover:bg-school-red/90'
                                    }`}
                            >
                                {saved[committee.slug] ? 'Saved ✓' : 'Save'}
                            </button>
                            {draftUrls[committee.slug] && (
                                <button
                                    onClick={() => handleClear(committee.slug)}
                                    className="px-5 py-3 rounded-xl font-mono text-[10px] uppercase tracking-widest border border-charcoal/20 text-charcoal/50 hover:border-charcoal/40 hover:text-charcoal transition-all"
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        {draftUrls[committee.slug] && (
                            <a
                                href={draftUrls[committee.slug]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-[10px] font-mono text-charcoal/40 hover:text-school-red transition-colors uppercase tracking-widest"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Preview link
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </main>
    );
}
