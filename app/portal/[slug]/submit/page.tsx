import { notFound } from 'next/navigation';
import { committees } from '@/data/committees';
import { createClient } from '@/lib/supabase-server';
import SubmissionForm from '@/components/portal/SubmissionForm';

interface PageProps {
    params: { slug: string };
}

export default async function CommitteeSubmitPage({ params }: PageProps) {
    // Validate committee slug — returns 404 for unknown slugs (Req 6.1, 6.2, 11)
    const committee = committees.find(c => c.slug === params.slug);
    if (!committee) {
        notFound();
    }

    // Fetch conference_settings on every request — no caching (Req 7.5)
    const supabase = createClient();
    const { data: settings } = await supabase
        .from('conference_settings')
        .select('accepting_submissions')
        .eq('id', 1)
        .single();

    const acceptingSubmissions = settings?.accepting_submissions ?? true;

    return (
        <SubmissionForm
            committee={committee}
            acceptingSubmissions={acceptingSubmissions}
        />
    );
}
