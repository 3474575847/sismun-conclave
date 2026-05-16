import { createClient } from '@/lib/supabase-server';
import { committees } from '@/data/committees';
import { redirect } from 'next/navigation';
import EBReviewPanel from '../../../components/portal/EBReviewPanel';
import ConferenceSettingsPanel from '../../../components/portal/ConferenceSettingsPanel';

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

    // Fetch all pending resolutions (SG sees all, chairs see their committee only)
    let query = supabase
        .from('resolutions')
        .select('*, blocs(bloc_name, member_countries)')
        .eq('status', 'pending')
        .eq('is_deleted', false)
        .order('submitted_at', { ascending: true });

    if (profile.role !== 'sg' && profile.committee_slug) {
        query = query.eq('committee_slug', profile.committee_slug);
    }

    const { data: pendingResolutions } = await query;

    // Fetch conference settings for SG (needed for ConferenceSettingsPanel)
    const { data: conferenceSettings } = profile.role === 'sg'
        ? await supabase
            .from('conference_settings')
            .select('accepting_submissions, accepting_amendments')
            .eq('id', 1)
            .single()
        : { data: null };

    // Filter committees this user can manage
    const managedCommittees = profile.role === 'sg'
        ? committees
        : committees.filter(c => c.slug === profile.committee_slug);

    return (
        <div className="max-w-6xl mx-auto px-6 py-10">
            {/* Header */}
            <div className="flex items-end justify-between gap-4 mb-10 pb-6 border-b border-white/10">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">
                        {profile.role === 'sg' ? 'SG Control Panel' : 'EB Review Dashboard'}
                    </h1>
                    <p className="text-sm text-white/40 font-mono">
                        {profile.name} · {profile.role === 'sg' ? 'Secretary General' : 'Committee Chair'}
                        {profile.committee_slug && profile.role !== 'sg' ? ` · ${profile.committee_slug.toUpperCase()}` : ''}
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-amber-400/5 border border-amber-400/20 rounded-lg px-4 py-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-xs font-mono text-amber-400">
                        {pendingResolutions?.length ?? 0} pending review
                    </span>
                </div>
            </div>

            {profile.role === 'sg' && conferenceSettings && (
                <ConferenceSettingsPanel settings={conferenceSettings} />
            )}

            <EBReviewPanel
                pendingResolutions={pendingResolutions ?? []}
                managedCommittees={managedCommittees}
            />
        </div>
    );
}