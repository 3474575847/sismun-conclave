'use server';

import { createClient } from '@/lib/supabase-server';
import { committees } from '@/data/committees';

export type DelegateSubmissionInput = {
    submitterName: string;
    submitterCountry: string;
    blocName: string;
    memberCountries: string[];
    topicIndex: number;
    committeeSlug: string;
    preamble: { text: string }[];
    operative: { text: string }[];
};

/**
 * Server action for delegate resolution submission.
 * Validates all required fields, checks the accepting_submissions gate,
 * validates the committeeSlug, then inserts a blocs row and a resolutions row.
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 6.1, 7.1, 7.5
 */
export async function createDelegateSubmission(
    input: DelegateSubmissionInput
): Promise<{ success: true; resolutionId: string }> {
    const {
        submitterName,
        submitterCountry,
        blocName,
        memberCountries,
        topicIndex,
        committeeSlug,
        preamble,
        operative,
    } = input;

    // --- Server-side field validation (Requirement 1.4) ---
    if (!submitterName || !submitterName.trim()) {
        throw new Error('Submitter name is required.');
    }
    if (!submitterCountry || !submitterCountry.trim()) {
        throw new Error('Submitter country is required.');
    }
    if (!blocName || !blocName.trim()) {
        throw new Error('Bloc name is required.');
    }
    if (!committeeSlug || !committeeSlug.trim()) {
        throw new Error('Committee slug is required.');
    }

    const nonEmptyPreamble = preamble.filter(c => c.text.trim());
    if (nonEmptyPreamble.length === 0) {
        throw new Error('At least one non-empty preambulatory clause is required.');
    }

    const nonEmptyOperative = operative.filter(c => c.text.trim());
    if (nonEmptyOperative.length === 0) {
        throw new Error('At least one non-empty operative clause is required.');
    }

    // --- Validate committeeSlug against the committees data source (Requirement 6.1) ---
    const committee = committees.find(c => c.slug === committeeSlug);
    if (!committee) {
        throw new Error(`Invalid committee: '${committeeSlug}' is not a recognised committee slug.`);
    }

    // Validate topicIndex is within range
    if (topicIndex < 0 || topicIndex >= committee.topics.length) {
        throw new Error(`Invalid topic index ${topicIndex} for committee '${committeeSlug}'.`);
    }

    // --- Check accepting_submissions — read fresh, no cache (Requirements 1.3, 7.1, 7.5) ---
    const supabase = createClient();

    const { data: settings, error: settingsErr } = await supabase
        .from('conference_settings')
        .select('accepting_submissions')
        .eq('id', 1)
        .single();

    if (settingsErr) {
        throw new Error('Could not read conference settings. Please try again.');
    }

    if (!settings?.accepting_submissions) {
        throw new Error('Submissions are currently closed by the EB. Please try again later.');
    }

    // --- Insert blocs row (Requirement 1.1) ---
    const { data: bloc, error: blocErr } = await supabase
        .from('blocs')
        .insert({
            committee_slug: committeeSlug,
            topic_index: topicIndex,
            bloc_name: blocName.trim(),
            member_countries: memberCountries,
        })
        .select('id')
        .single();

    if (blocErr) {
        throw new Error(`Failed to create bloc: ${blocErr.message}`);
    }

    // --- Build content_json ---
    const content_json = {
        preamble: nonEmptyPreamble.map((c, i) => ({
            position: i + 1.0,
            text: c.text.trim(),
            type: 'preamble' as const,
        })),
        operative: nonEmptyOperative.map((c, i) => ({
            position: i + 1.0,
            text: c.text.trim(),
            type: 'operative' as const,
        })),
    };

    // --- Insert resolutions row with status = 'pending' (Requirement 1.1) ---
    const { data: resolution, error: resErr } = await supabase
        .from('resolutions')
        .insert({
            bloc_id: bloc.id,
            committee_slug: committeeSlug,
            topic_index: topicIndex,
            status: 'pending',
            content_json,
            submitted_by_name: submitterName.trim(),
            submitted_by_country: submitterCountry.trim(),
            submitted_at: new Date().toISOString(),
        })
        .select('id')
        .single();

    if (resErr) {
        throw new Error(`Failed to create resolution: ${resErr.message}`);
    }

    return { success: true, resolutionId: resolution.id };
}
