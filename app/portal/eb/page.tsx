import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import ConferenceSettingsPanel from '@/components/portal/ConferenceSettingsPanel';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function EBDashboard() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/portal/login');

    const { data: profile, error: profileError } = await supabase
        .from('eb_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!profile) {
        return (
            <div className="max-w-xl mx-auto py-20 text-center">
                <h1 className="text-xl font-bold text-white mb-4">Access Denied</h1>
                <p className="text-white/40 mb-4 text-sm">
                    Your account is not registered as an EB member.
                </p>
                <div className="text-xs font-mono text-white/20 p-4 border border-white/10 rounded">
                    User ID: {user.id}
                </div>
                {profileError && (
                    <p className="text-xs text-red-400/60 mt-4 font-mono">{profileError.message}</p>
                )}
            </div>
        );
    }

    // Fetch pending amendment count for badge
    let amendmentQuery = supabase
        .from('amendments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .eq('is_deleted', false);

    if (profile.role !== 'sg' && profile.role !== 'admin' && profile.committee_slug) {
        amendmentQuery = amendmentQuery.eq('committee_slug', profile.committee_slug);
    }

    const { count: pendingAmendments } = await amendmentQuery;

    // Fetch conference settings for all EB members
    const { data: conferenceSettings } = await supabase
        .from('conference_settings')
        .select('accepting_submissions, accepting_amendments')
        .eq('id', 1)
        .single();

    const isSGOrAdmin = profile.role === 'sg' || profile.role === 'admin';

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            {/* Header */}
            <div className="mb-10 pb-6 border-b border-white/10">
                <h1 className="text-2xl font-bold text-white mb-1">
                    {isSGOrAdmin ? 'SG Control Panel' : 'EB Dashboard'}
                </h1>
                <p className="text-sm text-white/40 font-mono">
                    {profile.name} · {
                        profile.role === 'sg' ? 'Secretary General' :
                        profile.role === 'admin' ? 'Admin' :
                        profile.role === 'secretariat' ? 'Secretariat' :
                        'Committee Chair'
                    }
                    {profile.committee_slug && !isSGOrAdmin
                        ? ` · ${profile.committee_slug.toUpperCase()}`
                        : ''}
                </p>
            </div>

            {/* Conference Settings — SG/Admin only can toggle, others see status */}
            {conferenceSettings && (
                isSGOrAdmin ? (
                    <ConferenceSettingsPanel settings={conferenceSettings} />
                ) : (
                    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-1.5 h-5 rounded-full bg-amber-400/40" />
                            <h2 className="text-sm font-mono font-semibold text-white/60 tracking-wider uppercase">
                                Conference Status
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                <div>
                                    <p className="text-sm font-mono text-white/70">Accepting Submissions</p>
                                    <p className="text-xs text-white/35 mt-0.5">Delegate submissions of new resolutions</p>
                                </div>
                                <span className={`text-xs font-mono px-2.5 py-1 rounded ${
                                    conferenceSettings.accepting_submissions
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-white/5 text-white/30 border border-white/10'
                                }`}>
                                    {conferenceSettings.accepting_submissions ? 'ACTIVE' : 'CLOSED'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                <div>
                                    <p className="text-sm font-mono text-white/70">Accepting Amendments</p>
                                    <p className="text-xs text-white/35 mt-0.5">Delegate proposals for floor resolutions</p>
                                </div>
                                <span className={`text-xs font-mono px-2.5 py-1 rounded ${
                                    conferenceSettings.accepting_amendments
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-white/5 text-white/30 border border-white/10'
                                }`}>
                                    {conferenceSettings.accepting_amendments ? 'ACTIVE' : 'CLOSED'}
                                </span>
                            </div>
                        </div>
                        <p className="text-[10px] font-mono text-white/20 mt-5 italic text-center">
                            * Note: Only the Secretary General / Admin can modify these settings.
                        </p>
                    </div>
                )
            )}
        </div>
    );
}
