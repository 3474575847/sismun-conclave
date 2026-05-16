'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PortalNav() {
    const pathname = usePathname();
    const router = useRouter();
    const [isEB, setIsEB] = useState(false);
    const [ebName, setEbName] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setIsEB(true);
                const { data: profile } = await supabase
                    .from('eb_profiles')
                    .select('name')
                    .eq('id', user.id)
                    .single();
                if (profile) setEbName(profile.name);
            }
        };
        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
            setIsEB(!!session?.user);
            if (!session?.user) setEbName(null);
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/portal/login');
        router.refresh();
    };

    const isOnFloor = pathname.startsWith('/portal/floor');
    const isOnEB = pathname.startsWith('/portal/eb');

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#0d0d14] border-b border-white/10 flex items-center px-6 gap-6">
            {/* Logo */}
            <Link href="/portal" className="flex items-center gap-2 shrink-0">
                <span className="text-[#c9a84c] font-mono text-xs font-semibold tracking-widest uppercase">
                    SISMUN
                </span>
                <span className="text-white/30 font-mono text-xs">·</span>
                <span className="text-white/60 font-mono text-xs tracking-wider uppercase">
                    Digital Ledger
                </span>
            </Link>

            {/* Nav links */}
            <div className="flex items-center gap-1 ml-4">
                <Link
                    href="/portal"
                    className={`px-3 py-1.5 rounded text-xs font-mono tracking-wider transition-colors ${
                        pathname === '/portal'
                            ? 'bg-[#c9a84c]/15 text-[#c9a84c]'
                            : 'text-white/50 hover:text-white/80'
                    }`}
                >
                    COMMITTEE LEDGERS
                </Link>
                {isEB && (
                    <Link
                        href="/portal/eb"
                        className={`px-3 py-1.5 rounded text-xs font-mono tracking-wider transition-colors ${
                            isOnEB
                                ? 'bg-[#c9a84c]/15 text-[#c9a84c]'
                                : 'text-white/50 hover:text-white/80'
                        }`}
                    >
                        EB CONTROL
                    </Link>
                )}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Auth status */}
            {isEB ? (
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-mono text-white/50">{ebName ?? 'EB'}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-3 py-1.5 rounded text-xs font-mono text-white/40 hover:text-red-400 border border-white/10 hover:border-red-400/40 transition-colors"
                    >
                        LOGOUT
                    </button>
                </div>
            ) : (
                <Link
                    href="/portal/login"
                    className="px-3 py-1.5 rounded text-xs font-mono text-white/40 hover:text-[#c9a84c] border border-white/10 hover:border-[#c9a84c]/40 transition-colors"
                >
                    EB LOGIN
                </Link>
            )}
        </nav>
    );
}
