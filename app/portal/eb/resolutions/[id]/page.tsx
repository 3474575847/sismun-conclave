import { createClient } from '@/lib/supabase-server';
import { committees } from '@/data/committees';
import { notFound, redirect } from 'next/navigation';
import ResolutionEditor from '@/components/portal/ResolutionEditor';

export const dynamic = 'force-dynamic';

export default async function EditorPage({ params }: { params: { id: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/portal/login');

    const { data: profile } = await supabase
        .from('eb_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!profile) redirect('/portal/login');

    const { data: resolution } = await supabase
        .from('resolutions')
        .select('*, blocs(*)')
        .eq('id', params.id)
        .eq('is_deleted', false)
        .single();

    if (!resolution) return notFound();

    // Access check
    if (profile.committee_slug && profile.committee_slug !== resolution.committee_slug) {
        return (
            <div className="max-w-xl mx-auto py-20 text-center">
                <h1 className="text-xl font-bold text-white mb-4">Access Denied</h1>
                <p className="text-white/40">
                    You do not have permission to edit resolutions for this committee.
                </p>
            </div>
        );
    }

    const committee = committees.find(c => c.slug === resolution.committee_slug);
    const topic = committee?.topics?.[resolution.topic_index] ?? `Topic ${resolution.topic_index + 1}`;

    return (
        <div className="min-h-screen bg-[#0a0a0f]">
            {/* Context bar */}
            <div className="h-10 bg-[#c9a84c]/5 border-b border-[#c9a84c]/10 flex items-center px-6 gap-4">
                <a href="/portal/eb" className="text-[10px] font-mono text-[#c9a84c] hover:underline uppercase tracking-widest">
                    ← Back to Dashboard
                </a>
                <span className="text-white/10 font-mono text-[10px]">|</span>
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                    Editing: {resolution.blocs?.bloc_name}
                </span>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                <ResolutionEditor 
                    initialResolution={resolution} 
                    profile={profile}
                    committee={committee}
                    topic={topic}
                />
            </div>
        </div>
    );
}
