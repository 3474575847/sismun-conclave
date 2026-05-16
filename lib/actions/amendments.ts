'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import type { ContentJson } from './resolutions';

export type AmendmentType = 'add' | 'strike' | 'modify';

export async function proposeAmendment(data: {
    resolution_id: string;
    clause_section: 'preamble' | 'operative';
    clause_position: number;
    target_position?: number;
    proposer_name: string;
    proposer_country: string;
    type: AmendmentType;
    suggested_text?: string;
}) {
    const supabase = createClient();

    // Validate amendment type vs suggested_text
    if (data.type !== 'strike' && !data.suggested_text?.trim()) {
        throw new Error('Suggested text is required for add/modify amendments');
    }
    if (data.type === 'add' && !data.target_position) {
        throw new Error('Target position is required for add amendments');
    }

    // Validate resolution is on the floor
    const { data: resolution } = await supabase
        .from('resolutions')
        .select('status, committee_slug')
        .eq('id', data.resolution_id)
        .single();

    if (!resolution) throw new Error('Resolution not found');
    if (resolution.status !== 'floor') {
        throw new Error('This resolution is not on the floor and cannot receive amendments');
    }

    // Check conference settings
    const { data: settings } = await supabase
        .from('conference_settings')
        .select('accepting_amendments')
        .eq('id', 1)
        .single();

    if (!settings?.accepting_amendments) {
        throw new Error('Amendments are currently closed by the EB');
    }

    // Rate limit: max 5 pending amendments per country per resolution
    const { count } = await supabase
        .from('amendments')
        .select('*', { count: 'exact', head: true })
        .eq('resolution_id', data.resolution_id)
        .eq('proposer_country', data.proposer_country)
        .eq('vote_status', 'pending')
        .eq('is_deleted', false);

    if ((count ?? 0) >= 5) {
        throw new Error('Maximum 5 pending amendments per country per resolution');
    }

    // Req 6.5: committee_slug is always inherited from the parent resolution, never from user input
    const { error } = await supabase
        .from('amendments')
        .insert({
            ...data,
            committee_slug: resolution.committee_slug,
            vote_status: 'pending',
        });

    if (error) throw new Error(error.message);
    revalidatePath(`/portal/floor/${data.resolution_id}`);
}

export async function approveAmendment(amendmentId: string) {
    const supabase = createClient();

    // Get amendment + resolution
    const { data: amendment } = await supabase
        .from('amendments')
        .select('*, resolutions(committee_slug, content_json, status)')
        .eq('id', amendmentId)
        .single();

    if (!amendment) throw new Error('Amendment not found');
    if (amendment.vote_status !== 'pending') throw new Error('Already resolved');

    const resolution = amendment.resolutions as any;
    if (!resolution) throw new Error('Resolution not found');

    // Check EB access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');
    const { data: profile } = await supabase
        .from('eb_profiles')
        .select('committee_slug')
        .eq('id', user.id)
        .single();

    if (!profile) throw new Error('Not an EB member');
    if (profile.committee_slug && profile.committee_slug !== amendment.committee_slug) {
        throw new Error('Access denied: wrong committee');
    }

    // Apply the amendment to content_json
    const content: ContentJson = JSON.parse(JSON.stringify(resolution.content_json));
    const section = amendment.clause_section as 'preamble' | 'operative';
    const clauses = content[section];
    const clauseBefore = clauses.find(c => c.position === amendment.clause_position);

    if (amendment.type === 'strike') {
        // Req 4.3: guard — target clause must exist before striking
        if (!clauseBefore) {
            throw new Error(`Target clause not found at position ${amendment.clause_position}`);
        }
        content[section] = clauses.filter(c => c.position !== amendment.clause_position);
    } else if (amendment.type === 'modify') {
        // Req 4.2: guard — target clause must exist before modifying
        const idx = clauses.findIndex(c => c.position === amendment.clause_position);
        if (idx === -1) {
            throw new Error(`Target clause not found at position ${amendment.clause_position}`);
        }
        clauses[idx].text = amendment.suggested_text!;
    } else if (amendment.type === 'add') {
        const newClause = {
            position: amendment.target_position!,
            text: amendment.suggested_text!,
            type: section,
        };
        // Sorted by position ascending to maintain clause order (Req 4.4)
        content[section] = [...clauses, newClause].sort((a, b) => a.position - b.position);
    }

    // Update resolution content + mark amendment passed
    const { error: resErr } = await supabase
        .from('resolutions')
        .update({ content_json: content })
        .eq('id', amendment.resolution_id);

    if (resErr) throw new Error(resErr.message);

    await supabase
        .from('amendments')
        .update({ vote_status: 'passed', resolved_at: new Date().toISOString() })
        .eq('id', amendmentId);

    // Write audit log
    await supabase.from('amendment_log').insert({
        amendment_id: amendmentId,
        resolution_id: amendment.resolution_id,
        action: 'approved',
        eb_profile_id: user.id,
        clause_before: clauseBefore?.text ?? null,
        clause_after: amendment.type === 'strike' ? null : amendment.suggested_text,
        full_snapshot_json: content,
    });

    revalidatePath(`/portal/floor/${amendment.resolution_id}`);
    revalidatePath('/portal/eb/amendments');
}

export async function rejectAmendment(amendmentId: string) {
    const supabase = createClient();

    // Fetch full amendment row so we can record clause_before for modify/strike types
    const { data: amendment } = await supabase
        .from('amendments')
        .select('committee_slug, resolution_id, clause_section, clause_position, type')
        .eq('id', amendmentId)
        .single();

    if (!amendment) throw new Error('Not found');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');
    const { data: profile } = await supabase
        .from('eb_profiles')
        .select('committee_slug')
        .eq('id', user.id)
        .single();

    if (!profile) throw new Error('Not EB');
    if (profile.committee_slug && profile.committee_slug !== amendment.committee_slug) {
        throw new Error('Access denied');
    }

    // Fetch the resolution's current content_json for the snapshot and clause_before
    const { data: resolution } = await supabase
        .from('resolutions')
        .select('content_json')
        .eq('id', amendment.resolution_id)
        .single();

    if (!resolution) throw new Error('Resolution not found');

    const content: ContentJson = resolution.content_json;
    const section = amendment.clause_section as 'preamble' | 'operative';

    // For modify/strike, record the current text of the targeted clause
    let clauseBefore: string | null = null;
    if (amendment.type === 'modify' || amendment.type === 'strike') {
        const targetClause = content[section]?.find(
            (c) => c.position === amendment.clause_position
        );
        clauseBefore = targetClause?.text ?? null;
    }

    await supabase
        .from('amendments')
        .update({ vote_status: 'failed', resolved_at: new Date().toISOString() })
        .eq('id', amendmentId);

    await supabase.from('amendment_log').insert({
        amendment_id: amendmentId,
        resolution_id: amendment.resolution_id,
        action: 'rejected',
        eb_profile_id: user.id,
        clause_before: clauseBefore,
        full_snapshot_json: content,
    });

    revalidatePath('/portal/eb/amendments');
    revalidatePath(`/portal/floor/${amendment.resolution_id}`);
}
