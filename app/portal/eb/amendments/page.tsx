import { createClient } from '@/lib/supabase-server';
import { committees } from '@/data/committees';
import { redirect } from 'next/navigation';
import AmendmentQueueList from '@/components/portal/AmendmentQueueList';

export const dynamic = 'force-dynamic';

export default async function AmendmentQueuePage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/portal/login');

    const { data: profile } = await supabase
        .from('eb_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!profile) redirect('/portal/login');

    // Fetch pending amendments
    let query = supabase
        .from('amendments')
        .select('*, resolutions(bloc_id, blocs(bloc_name))')
        .eq('vote_status', 'pending')
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

    if (profile.role !== 'sg' && profile.committee_slug) {
        query = query.eq('committee_slug', profile.committee_slug);
    }

    const { data: amendments } = await query;
    const committee = committees.find(c => c.slug === profile.committee_slug);

    return (
        <div className="max-w-5xl mx-auto px-6 py-10">
            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-2 text-xs font-mono text-white/30 mb-3 uppercase tracking-widest">
                    <a href="/portal/eb" className="hover:text-white transition-colors">EB Dashboard</a>
                    <span>›</span>
                    <span className="text-white/60">Amendment Queue</span>
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">
                    Pending Amendments
                </h1>
                <p className="text-sm text-white/40 font-mono italic">
                    Review, approve, or reject proposed changes from the floor.
                </p>
            </div>

            {/* List */}
            <AmendmentQueueList 
                initialAmendments={amendments ?? []} 
                profile={profile}
            />

            {(!amendments || amendments.length === 0) && (
                <div className="text-center py-32 bg-white/[0.02] border border-dashed border-white/5 rounded-xl">
                    <div className="text-emerald-400/20 text-4xl mb-4 font-mono">✓</div>
                    <p className="text-sm text-white/20 font-mono italic">
                        The queue is empty. No pending amendments for {committee?.acronym ?? 'all committees'}.
                    </p>
                </div>
            )}
        </div>
    );
}
