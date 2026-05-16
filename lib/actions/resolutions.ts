'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

// Types
export type Clause = {
    position: number;
    text: string;
    type: 'preamble' | 'operative';
};

export type ContentJson = {
    preamble: Clause[];
    operative: Clause[];
};

export type Resolution = {
    id: string;
    bloc_id: string;
    committee_slug: string;
    topic_index: number;
    status: 'pending' | 'floor' | 'rejected' | 'drafting' | 'submitted';
    content_json: ContentJson;
    snapshot_json: ContentJson | null;
    submitted_at: string | null;
    updated_at: string;
    created_at: string;
    is_deleted: boolean;
    rejection_note?: string | null;
    blocs?: { bloc_name: string; member_countries: string[] };
};

// ---- Helpers ----

async function assertEBAccess(committeeSlug?: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data: profile } = await supabase
        .from('eb_profiles')
        .select('committee_slug, role')
        .eq('id', user.id)
        .single();

    if (!profile) throw new Error('Not an EB member');

    // SG (committee_slug = null) sees everything
    if (profile.committee_slug !== null && committeeSlug) {
        if (profile.committee_slug !== committeeSlug) {
            throw new Error('Access denied: wrong committee');
        }
    }

    return { user, profile };
}

// ---- Resolution Actions ----

export async function createResolution(data: {
    bloc_id: string;
    committee_slug: string;
    topic_index: number;
}) {
    await assertEBAccess(data.committee_slug);
    const supabase = createClient();

    const { data: res, error } = await supabase
        .from('resolutions')
        .insert({
            bloc_id: data.bloc_id,
            committee_slug: data.committee_slug,
            topic_index: data.topic_index,
            status: 'drafting',
            content_json: { preamble: [], operative: [] },
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    revalidatePath('/portal/eb');
    return res;
}

export async function updateResolutionContent(data: {
    id: string;
    content_json: ContentJson;
    last_known_updated_at: string; // optimistic concurrency check
}) {
    const supabase = createClient();

    // Fetch current updated_at to detect conflicts
    const { data: current } = await supabase
        .from('resolutions')
        .select('updated_at, committee_slug, status')
        .eq('id', data.id)
        .single();

    if (!current) throw new Error('Resolution not found');
    if (current.status !== 'drafting') throw new Error('Resolution is no longer in draft');

    await assertEBAccess(current.committee_slug);

    // Optimistic concurrency: reject if someone else updated since we last read
    if (current.updated_at !== data.last_known_updated_at) {
        return { conflict: true, server_updated_at: current.updated_at };
    }

    const { error } = await supabase
        .from('resolutions')
        .update({ content_json: data.content_json })
        .eq('id', data.id);

    if (error) throw new Error(error.message);
    revalidatePath(`/portal/eb/resolutions/${data.id}`);
    return { conflict: false };
}

export async function submitResolution(id: string) {
    const supabase = createClient();

    const { data: current } = await supabase
        .from('resolutions')
        .select('committee_slug, status, content_json')
        .eq('id', id)
        .single();

    if (!current) throw new Error('Resolution not found');
    if (current.status !== 'drafting') throw new Error('Already submitted');

    await assertEBAccess(current.committee_slug);

    // Check conference settings
    const { data: settings } = await supabase
        .from('conference_settings')
        .select('accepting_submissions')
        .eq('id', 1)
        .single();

    if (!settings?.accepting_submissions) {
        throw new Error('Submissions are currently closed by the EB');
    }

    const { error } = await supabase
        .from('resolutions')
        .update({
            status: 'floor',
            submitted_at: new Date().toISOString(),
            snapshot_json: current.content_json, // freeze snapshot at submission
        })
        .eq('id', id);

    if (error) throw new Error(error.message);
    revalidatePath('/portal/floor');
    revalidatePath('/portal/eb');
}

export async function softDeleteResolution(id: string) {
    const supabase = createClient();
    const { data: current } = await supabase
        .from('resolutions')
        .select('committee_slug')
        .eq('id', id)
        .single();

    if (!current) throw new Error('Not found');
    await assertEBAccess(current.committee_slug);

    await supabase.from('resolutions').update({ is_deleted: true }).eq('id', id);
    revalidatePath('/portal/eb');
    revalidatePath('/portal/floor');
}

/**
 * Approve a pending resolution, transitioning it to the floor.
 * Only an EB member scoped to the resolution's committee (or an SG) may approve.
 * Requirements: 2.2, 2.5
 */
export async function approveResolution(id: string) {
    const supabase = createClient();

    // Fetch the resolution to get its committee_slug for scoping
    const { data: current } = await supabase
        .from('resolutions')
        .select('committee_slug, status, is_deleted')
        .eq('id', id)
        .single();

    if (!current) throw new Error('Resolution not found');
    if (current.is_deleted) throw new Error('Resolution has been deleted');
    if (current.status !== 'pending') throw new Error('Resolution is not in pending state');

    // Enforce committee scoping: Chair can only approve resolutions in their own committee
    await assertEBAccess(current.committee_slug);

    const { error } = await supabase
        .from('resolutions')
        .update({
            status: 'floor',
            submitted_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('status', 'pending'); // guard against concurrent updates

    if (error) throw new Error(error.message);

    revalidatePath('/portal/eb');
    revalidatePath('/portal/floor');
}

/**
 * Reject a pending resolution, soft-deleting it from all public views.
 * Only an EB member scoped to the resolution's committee (or an SG) may reject.
 * Requirements: 2.3, 2.5
 */
export async function rejectResolution(id: string, note?: string) {
    const supabase = createClient();

    // Fetch the resolution to get its committee_slug for scoping
    const { data: current } = await supabase
        .from('resolutions')
        .select('committee_slug, status, is_deleted')
        .eq('id', id)
        .single();

    if (!current) throw new Error('Resolution not found');
    if (current.is_deleted) throw new Error('Resolution has already been deleted');
    if (current.status !== 'pending') throw new Error('Resolution is not in pending state');

    // Enforce committee scoping: Chair can only reject resolutions in their own committee
    await assertEBAccess(current.committee_slug);

    const updates: Record<string, unknown> = { is_deleted: true };
    if (note !== undefined && note !== '') {
        updates.rejection_note = note;
    }

    const { error } = await supabase
        .from('resolutions')
        .update(updates)
        .eq('id', id);

    if (error) throw new Error(error.message);

    revalidatePath('/portal/eb');
    revalidatePath('/portal/floor');
}

// ---- Bloc Actions ----

export async function createBloc(data: {
    committee_slug: string;
    topic_index: number;
    bloc_name: string;
    member_countries: string[];
}) {
    await assertEBAccess(data.committee_slug);
    const supabase = createClient();

    const { data: bloc, error } = await supabase
        .from('blocs')
        .insert(data)
        .select()
        .single();

    if (error) throw new Error(error.message);
    revalidatePath('/portal/eb');
    return bloc;
}

export async function updateBloc(id: string, data: {
    bloc_name?: string;
    member_countries?: string[];
}) {
    const supabase = createClient();
    const { data: current } = await supabase
        .from('blocs')
        .select('committee_slug')
        .eq('id', id)
        .single();

    if (!current) throw new Error('Not found');
    await assertEBAccess(current.committee_slug);

    await supabase.from('blocs').update(data).eq('id', id);
    revalidatePath('/portal/eb');
}

// ---- Conference Settings Actions ----

/**
 * Update a single boolean field in the conference_settings singleton row.
 * Only the SG (role = 'sg') may call this action.
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */
export async function updateConferenceSettings(
    field: 'accepting_submissions' | 'accepting_amendments',
    value: boolean
) {
    // assertEBAccess with no committee slug — verifies the caller is any EB member
    const { profile } = await assertEBAccess();

    if (profile.role !== 'sg') {
        throw new Error('Only the SG can modify conference settings');
    }

    const supabase = createClient();
    const { error } = await supabase
        .from('conference_settings')
        .update({ [field]: value })
        .eq('id', 1);

    if (error) throw new Error(error.message);
    revalidatePath('/portal/eb');
}
