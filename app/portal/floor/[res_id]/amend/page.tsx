import { createClient } from '@/lib/supabase-server';
import AmendmentForm from '@/components/portal/AmendmentForm';

export const dynamic = 'force-dynamic';

export default async function AmendmentFormPage({ params }: { params: { res_id: string } }) {
    // Fetch conference_settings server-side on every request — no caching (Req 7.5)
    const supabase = createClient();
    const { data: settings } = await supabase
        .from('conference_settings')
        .select('accepting_amendments')
        .eq('id', 1)
        .single();

    const acceptingAmendments = settings?.accepting_amendments ?? true;

    return (
        <AmendmentForm
            resId={params.res_id}
            acceptingAmendments={acceptingAmendments}
        />
    );
}
