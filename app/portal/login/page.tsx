'use client';

import { useState, useTransition } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showGuide, setShowGuide] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const supabase = createClient();

        startTransition(async () => {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                console.error('Login error:', error);
                setError(error.message === 'Invalid login credentials' 
                    ? 'Invalid credentials. Please check your email and password.' 
                    : error.message);
            } else {
                router.push('/portal/eb');
                router.refresh();
            }
        });
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#0a0a0f] selection:bg-[#c9a84c]/30">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#c9a84c]/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-sm relative z-10">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 mb-6 shadow-2xl">
                        <svg className="w-8 h-8 text-[#c9a84c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Executive Portal</h1>
                    <p className="text-sm text-white/40 font-mono">SISMUN CONCLAVE 2026</p>
                </div>

                {/* Form Card */}
                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold font-mono text-white/30 tracking-widest uppercase ml-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/20 focus:border-[#c9a84c]/40 transition-all"
                                placeholder="name@sismun.org"
                            />
                        </div>
                        
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-end px-1">
                                <label className="text-[10px] font-bold font-mono text-white/30 tracking-widest uppercase">
                                    Access Key
                                </label>
                                <button 
                                    type="button"
                                    onClick={() => setShowGuide(!showGuide)}
                                    className="text-[10px] font-mono text-[#c9a84c]/60 hover:text-[#c9a84c] transition-colors"
                                >
                                    SETUP GUIDE
                                </button>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/20 focus:border-[#c9a84c]/40 transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="animate-in fade-in slide-in-from-top-2 text-[11px] text-red-400 font-mono bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full py-3.5 bg-gradient-to-r from-[#c9a84c] to-[#e0c068] hover:from-[#d4b560] hover:to-[#ebcc7a] disabled:from-[#c9a84c]/40 disabled:to-[#c9a84c]/40 text-[#0a0a0f] text-sm font-bold rounded-xl transition-all shadow-lg shadow-[#c9a84c]/10 active:scale-[0.98]"
                        >
                            {isPending ? 'VALIDATING...' : 'ENTER PORTAL'}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center space-y-4">
                    <p className="text-xs text-white/20 font-mono">
                        Not an EB member? {' '}
                        <a href="/portal/floor" className="text-[#c9a84c]/60 hover:text-[#c9a84c] transition-colors underline underline-offset-4 decoration-white/10">
                            View Committee Floor
                        </a>
                    </p>
                </div>

                {/* Setup Guide Modal-like overlay */}
                {showGuide && (
                    <div className="mt-6 p-5 bg-[#c9a84c]/5 border border-[#c9a84c]/20 rounded-2xl animate-in fade-in zoom-in-95">
                        <h3 className="text-xs font-bold text-[#c9a84c] mb-3 font-mono tracking-widest uppercase">Secretariat Setup Guide</h3>
                        <div className="space-y-3 text-[11px] text-white/60 font-mono leading-relaxed">
                            <p>1. Create user in <span className="text-white">Supabase Dashboard &gt; Auth</span></p>
                            <p>2. Copy their <span className="text-white">User UID</span></p>
                            <p>3. Run this in <span className="text-white">SQL Editor</span>:</p>
                            <div className="bg-black/40 p-3 rounded-lg text-[10px] text-[#c9a84c]/80 break-all select-all">
                                INSERT INTO eb_profiles (id, name, role) VALUES ('PASTE_UID', 'SG', 'sg');
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
