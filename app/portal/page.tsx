import { committees } from '@/data/committees';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function PortalIndexPage() {
    const supabase = createClient();

    // Fetch pending counts per committee (for display)
    const { data: pending } = await supabase
        .from('resolutions')
        .select('committee_slug')
        .eq('status', 'pending')
        .eq('is_deleted', false);

    const { data: floor } = await supabase
        .from('resolutions')
        .select('committee_slug')
        .eq('status', 'floor')
        .eq('is_deleted', false);

    const pendingCount = (slug: string) => pending?.filter(r => r.committee_slug === slug).length ?? 0;
    const floorCount = (slug: string) => floor?.filter(r => r.committee_slug === slug).length ?? 0;

    return (
        <div className="max-w-5xl mx-auto px-6 py-12">
            {/* Header */}
            <div className="mb-12 text-center">
                <p className="text-xs font-mono text-[#c9a84c]/60 tracking-widest uppercase mb-4">SISMUN Conclave 2026</p>
                <h1 className="text-3xl font-bold text-white mb-3">Digital Resolution Ledger</h1>
                <p className="text-sm text-white/40 max-w-lg mx-auto">
                    Each committee has an independent ledger. Delegates submit resolutions for EB review, and approved resolutions appear on the floor.
                </p>
            </div>

            {/* Committee Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {committees.map(c => {
                    const pending = pendingCount(c.slug);
                    const onFloor = floorCount(c.slug);
                    return (
                        <div
                            key={c.slug}
                            className="bg-white/[0.03] hover:bg-white/[0.05] border border-white/8 hover:border-white/15 rounded-xl p-6 transition-all group"
                        >
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div>
                                    <span className="text-xs font-mono text-[#c9a84c]/60 tracking-widest">{c.acronym}</span>
                                    <h2 className="text-sm font-semibold text-white mt-1 leading-snug">{c.name}</h2>
                                </div>
                                {pending > 0 && (
                                    <span className="shrink-0 px-2 py-0.5 bg-amber-400/10 border border-amber-400/25 rounded text-[10px] font-mono text-amber-400">
                                        {pending} pending
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-white/30 line-clamp-2 mb-5">{c.description}</p>

                            {/* Stats */}
                            <div className="flex items-center gap-4 mb-5 text-[11px] font-mono text-white/25">
                                <span>{onFloor} on floor</span>
                                <span>{c.topics.length} topics</span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <Link
                                    href={`/portal/${c.slug}`}
                                    className="flex-1 text-center px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-lg text-xs font-mono text-white/50 hover:text-white transition-all"
                                >
                                    View Floor
                                </Link>
                                <Link
                                    href={`/portal/${c.slug}/submit`}
                                    className="flex-1 text-center px-3 py-2 bg-[#c9a84c]/8 hover:bg-[#c9a84c]/15 border border-[#c9a84c]/20 hover:border-[#c9a84c]/40 rounded-lg text-xs font-mono text-[#c9a84c]/70 hover:text-[#c9a84c] transition-all"
                                >
                                    Submit Resolution
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* EB Login link */}
            <div className="text-center mt-12">
                <Link href="/portal/login" className="text-xs font-mono text-white/20 hover:text-white/40 transition-all">
                    EB / Secretary General Login →
                </Link>
            </div>
        </div>
    );
}
