import { committees } from '@/data/committees';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import ResolutionUploadForm from '@/components/portal/ResolutionUploadForm';
import ResolutionVersionHistory from '@/components/portal/ResolutionVersionHistory';
import DeleteResolutionButton from '@/components/portal/DeleteResolutionButton';
import ArchiveResolutionButton from '@/components/portal/ArchiveResolutionButton';
import ChairAmendmentQueue from '@/components/portal/ChairAmendmentQueue';
import type { Amendment } from '@/lib/actions/amendments';
import type { ResolutionFile } from '@/lib/actions/resolutions';

export const dynamic = 'force-dynamic';

interface Props {
    searchParams: { tab?: string; committee?: string };
}

export default async function PortalIndexPage({ searchParams }: Props) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check if the user has an EB profile
    let profile = null;
    if (user) {
        const { data: prof } = await supabase
            .from('eb_profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        profile = prof;
    }

    // Common statistics for display
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

    // Render Public Delegate view if not logged in as EB
    if (!profile) {
        return (
            <div className="max-w-5xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="mb-12 text-center">
                    <p className="text-xs font-mono text-[#c9a84c]/60 tracking-widest uppercase mb-4">SISMUN Conclave 2026</p>
                    <h1 className="text-3xl font-bold text-white mb-3">Digital Resolutions</h1>
                    <p className="text-sm text-white/40 max-w-lg mx-auto">
                        Each committee has independent resolutions. EB-approved resolutions are live on the floor. Delegates can view live resolutions and propose amendments on their committee page.
                    </p>
                </div>

                {/* Committee Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {committees.map(c => {
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
                                        href={`/committees/${c.slug}`}
                                        className="flex-1 text-center px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-lg text-xs font-mono text-white/50 hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        View Resolutions →
                                    </Link>
                                    <Link
                                        href={`/committees/${c.slug}/amend`}
                                        className="flex-1 text-center px-4 py-2.5 bg-[#c9a84c]/[0.06] hover:bg-[#c9a84c]/[0.14] border border-[#c9a84c]/20 hover:border-[#c9a84c]/40 rounded-lg text-xs font-mono text-[#c9a84c]/70 hover:text-[#c9a84c] transition-all flex items-center justify-center gap-2"
                                    >
                                        Add Amendment →
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

    // EB Member Authorized Flow
    const isSecretariat = ['secretariat', 'sg', 'admin'].includes(profile.role);
    const defaultTab = 'amendments';
    const activeTab = searchParams.tab || defaultTab;

    // Fetch resolutions scoped to EB user's permissions
    let query = supabase
        .from('resolutions')
        .select(`
            *,
            resolution_files(*),
            amendments(id, resolution_id, committee_slug, delegate_name, delegate_country, amendment_type, clause_reference, proposed_text, status, reviewed_by, reviewed_at, created_at, is_deleted)
        `)
        .eq('is_deleted', false)
        .order('published_at', { ascending: false });

    if (profile.role !== 'sg' && profile.role !== 'admin' && profile.committee_slug) {
        query = query.eq('committee_slug', profile.committee_slug);
    }

    const { data: resolutions } = await query;

    // Build groups for ChairAmendmentQueue
    const groups = (resolutions ?? [])
        .filter(r => r.status !== 'archived')
        .map(r => ({
            id: r.id,
            title: r.title,
            resolution_code: r.resolution_code,
            amendments: ((r.amendments ?? []) as Amendment[]).filter(a => !a.is_deleted),
        }));

    const totalPending = groups.reduce(
        (sum, g) => sum + g.amendments.filter(a => a.status === 'pending').length,
        0
    );

    // Filter to managed committees for resolution upload
    const managedCommittees = profile.committee_slug
        ? committees.filter(c => c.slug === profile.committee_slug)
        : committees;

    // Committee sub-tab for resolution uploads (multi-committee users only)
    const activeCommitteeSlug =
        searchParams.committee ??
        managedCommittees[0]?.slug ??
        '';
    const committeeResolutions =
        resolutions?.filter(r => r.committee_slug === activeCommitteeSlug) ?? [];

    return (
        <div className="max-w-5xl mx-auto px-6 py-10">
            {/* EB Header */}
            <div className="mb-8 pb-6 border-b border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">EB Workspace</h1>
                    <p className="text-sm text-white/40 font-mono">
                        {profile.name} · {
                            profile.role === 'sg' ? 'Secretary General' :
                            profile.role === 'admin' ? 'Admin' :
                            profile.role === 'secretariat' ? 'Secretariat' :
                            'Committee Chair'
                        }
                        {profile.committee_slug ? ` · ${profile.committee_slug.toUpperCase()}` : ' · All Committees'}
                    </p>
                </div>
                
                {/* Stats quick pill */}
                {totalPending > 0 && (
                    <div className="self-start md:self-auto flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-lg px-4 py-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-xs font-mono text-amber-400">
                            {totalPending} pending amendments
                        </span>
                    </div>
                )}
            </div>

            {/* Premium Tab Selector */}
            <div className="flex border-b border-white/10 gap-6 mb-8 overflow-x-auto pb-px">
                <Link
                    href="?tab=amendments"
                    className={`pb-4 text-xs font-mono tracking-wider transition-all relative whitespace-nowrap ${
                        activeTab === 'amendments'
                            ? 'text-[#c9a84c] border-b-2 border-[#c9a84c]'
                            : 'text-white/45 hover:text-white/70'
                    }`}
                >
                    AMENDMENT QUEUE
                    {totalPending > 0 && (
                        <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                            {totalPending}
                        </span>
                    )}
                </Link>

                {isSecretariat && (
                    <Link
                        href="?tab=resolutions"
                        className={`pb-4 text-xs font-mono tracking-wider transition-all relative whitespace-nowrap ${
                            activeTab === 'resolutions'
                                ? 'text-[#c9a84c] border-b-2 border-[#c9a84c]'
                                : 'text-white/45 hover:text-white/70'
                        }`}
                    >
                        RESOLUTION UPLOADS
                    </Link>
                )}

                <Link
                    href="?tab=committees"
                    className={`pb-4 text-xs font-mono tracking-wider transition-all relative whitespace-nowrap ${
                        activeTab === 'committees'
                            ? 'text-[#c9a84c] border-b-2 border-[#c9a84c]'
                            : 'text-white/45 hover:text-white/70'
                    }`}
                >
                    COMMITTEE FLOORS
                </Link>
            </div>

            {/* Tab Contents */}
            <div>
                {/* 1. Amendment Queue Tab */}
                {activeTab === 'amendments' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between gap-4 mb-4">
                            <h2 className="text-sm font-semibold text-white">Live Amendment Queue</h2>
                            <p className="text-xs text-white/30 font-mono">Scope: {profile.committee_slug ? profile.committee_slug.toUpperCase() : 'ALL'}</p>
                        </div>
                        <ChairAmendmentQueue groups={groups} />
                    </div>
                )}

                {/* 2. Resolution Uploads Tab */}
                {activeTab === 'resolutions' && isSecretariat && (
                    <div className="space-y-8 animate-fadeIn">

                        {/* Committee Sub-tabs — only for multi-committee users */}
                        {managedCommittees.length > 1 && (
                            <div className="flex gap-1 border-b border-white/10 pb-px overflow-x-auto">
                                {managedCommittees.map(c => {
                                    const count = resolutions?.filter(
                                        r => r.committee_slug === c.slug && r.status !== 'archived' && !r.is_deleted
                                    ).length ?? 0;
                                    const isActive = activeCommitteeSlug === c.slug;
                                    return (
                                        <Link
                                            key={c.slug}
                                            href={`?tab=resolutions&committee=${c.slug}`}
                                            className={`flex items-center gap-2 px-4 pb-3 pt-1 text-xs font-mono tracking-wider transition-all whitespace-nowrap border-b-2 ${
                                                isActive
                                                    ? 'text-[#c9a84c] border-[#c9a84c]'
                                                    : 'text-white/35 border-transparent hover:text-white/60 hover:border-white/20'
                                            }`}
                                        >
                                            {c.acronym}
                                            <span className={`px-1.5 py-0.5 text-[10px] rounded font-bold transition-all ${
                                                isActive
                                                    ? 'bg-[#c9a84c]/15 text-[#c9a84c]/80 border border-[#c9a84c]/20'
                                                    : 'bg-white/5 text-white/25 border border-white/8'
                                            }`}>
                                                {count}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}

                        {/* Active committee label for single-committee users */}
                        {managedCommittees.length === 1 && (
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-4 rounded-full bg-[#c9a84c]/50" />
                                <span className="text-xs font-mono text-[#c9a84c]/60 uppercase tracking-widest">
                                    {managedCommittees[0]?.acronym} — {managedCommittees[0]?.name}
                                </span>
                            </div>
                        )}

                        {/* Upload Form — scoped to active committee */}
                        <ResolutionUploadForm
                            committees={managedCommittees}
                            defaultSlug={activeCommitteeSlug || undefined}
                            key={activeCommitteeSlug}
                        />

                        {/* Published Resolutions — filtered to active committee */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-sm font-semibold text-white">Published Resolutions</h2>
                                <span className="text-xs font-mono text-white/25">
                                    {committeeResolutions.length} resolution{committeeResolutions.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            {committeeResolutions.length === 0 && (
                                <div className="text-center py-16 bg-white/[0.02] border border-dashed border-white/8 rounded-xl">
                                    <p className="text-sm text-white/25 font-mono">No resolutions uploaded yet.</p>
                                </div>
                            )}

                            <div className="space-y-4">
                                {committeeResolutions.map(resolution => {
                                    const committee = committees.find(c => c.slug === resolution.committee_slug);
                                    const files: ResolutionFile[] = resolution.resolution_files ?? [];

                                    return (
                                        <div key={resolution.id} className="space-y-2.5 bg-white/[0.01] hover:bg-white/[0.02] p-4 border border-white/5 rounded-xl transition-all">
                                            {/* Committee label + status */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-mono text-[#c9a84c]/70 uppercase tracking-widest bg-[#c9a84c]/5 border border-[#c9a84c]/10 px-2 py-0.5 rounded">
                                                    {committee?.acronym ?? resolution.committee_slug}
                                                </span>
                                                {resolution.status === 'archived' && (
                                                    <span className="text-[10px] font-mono text-white/25 border border-white/10 bg-white/5 px-2 py-0.5 rounded uppercase tracking-wider">
                                                        archived
                                                    </span>
                                                )}
                                            </div>

                                            <ResolutionVersionHistory
                                                resolutionId={resolution.id}
                                                title={resolution.title}
                                                files={files}
                                                committeeSlug={resolution.committee_slug}
                                            />

                                            {/* Archive / Delete actions */}
                                            <div className="flex items-center gap-4 pt-1 px-1 border-t border-white/5">
                                                {resolution.status === 'published' && (
                                                    <ArchiveResolutionButton resolutionId={resolution.id} />
                                                )}
                                                <DeleteResolutionButton resolutionId={resolution.id} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Committee Floors Directory Tab */}
                {activeTab === 'committees' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
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
                                            href={`/committees/${c.slug}`}
                                            className="w-full text-center px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-lg text-xs font-mono text-white/50 hover:text-white transition-all flex items-center justify-center gap-2"
                                        >
                                            Open Public Floor Page →
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
