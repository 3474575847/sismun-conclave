/**
 * Pure utility functions for applying amendment mutations to ContentJson.
 * Extracted from approveAmendment for testability.
 */

import type { ContentJson } from './actions/resolutions';

export type AmendmentInput = {
    type: 'add' | 'strike' | 'modify';
    clause_section: 'preamble' | 'operative';
    clause_position: number;
    target_position?: number;
    suggested_text?: string;
};

/**
 * Apply a single amendment to a deep copy of content_json.
 * Throws if the target clause is not found for modify/strike.
 * Returns the mutated content (does not mutate the input).
 */
export function applyAmendment(content: ContentJson, amendment: AmendmentInput): ContentJson {
    // Deep copy to avoid mutating the original
    const result: ContentJson = JSON.parse(JSON.stringify(content));
    const section = amendment.clause_section;
    const clauses = result[section];

    if (amendment.type === 'strike') {
        // Req 4.3: guard — target clause must exist before striking
        const exists = clauses.some(c => c.position === amendment.clause_position);
        if (!exists) {
            throw new Error(`Target clause not found at position ${amendment.clause_position}`);
        }
        result[section] = clauses.filter(c => c.position !== amendment.clause_position);
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
        result[section] = [...clauses, newClause].sort((a, b) => a.position - b.position);
    }

    return result;
}
