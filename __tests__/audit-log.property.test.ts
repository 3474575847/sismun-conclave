// Feature: sismun-digital-ledger-redesign, Property 12: Every amendment action produces a complete audit log entry

/**
 * Property-based test for audit log completeness.
 *
 * **Validates: Requirements 4.6, 8.1, 8.2, 8.3, 8.4**
 *
 * For any amendment approval or rejection, the `amendment_log` SHALL contain
 * exactly one new entry recording: `amendment_id`, `resolution_id`,
 * `eb_profile_id`, `action`, and `timestamp`.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';

// ---------------------------------------------------------------------------
// Module mocks — must be declared before dynamic imports
// ---------------------------------------------------------------------------

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    getAll: () => [],
    set: vi.fn(),
  })),
}));

vi.mock('@/lib/supabase-server', () => ({
  createClient: vi.fn(),
}));

// Capture every payload sent to amendment_log.insert()
const amendmentLogInsertMock = vi.fn();

// ---------------------------------------------------------------------------
// Mock Factory
// ---------------------------------------------------------------------------

/**
 * Build a Supabase mock for updateAmendmentStatus.
 *
 * Tables handled:
 *   - amendments  : SELECT returns a minimal amendment row; UPDATE succeeds
 *   - resolutions : SELECT returns content_json (for full_snapshot_json on pass)
 *   - amendment_log: INSERT captured by amendmentLogInsertMock
 *
 * The assertEBAccess path uses eb_profiles:
 *   - eb_profiles : SELECT returns a valid chair profile
 * and auth.getUser returns a fixed user ID.
 */
function buildMock(
  amendmentId: string,
  resolutionId: string,
  amendmentType: 'modify' | 'strike' | 'add'
) {
  // auth.getUser
  const getUserMock = vi.fn().mockResolvedValue({
    data: { user: { id: 'eb-user-id-123' } },
    error: null,
  });

  // eb_profiles: SELECT .eq('id', userId).single()
  const singleProfileMock = vi.fn().mockResolvedValue({
    data: { committee_slug: 'ga4', role: 'chair' },
    error: null,
  });
  const eqProfileMock = vi.fn(() => ({ single: singleProfileMock }));
  const selectProfileMock = vi.fn(() => ({ eq: eqProfileMock }));

  // amendments: SELECT returns the amendment row
  const singleAmendmentMock = vi.fn().mockResolvedValue({
    data: {
      committee_slug: 'ga4',
      status: 'pending',
      is_deleted: false,
      resolution_id: resolutionId,
      amendment_type: amendmentType,
    },
    error: null,
  });
  const eqAmendmentSelectMock = vi.fn(() => ({ single: singleAmendmentMock }));
  const selectAmendmentMock = vi.fn(() => ({ eq: eqAmendmentSelectMock }));

  // amendments: UPDATE .eq('id', amendmentId) → success
  const eqAmendmentUpdateMock = vi.fn().mockResolvedValue({ error: null });
  const updateAmendmentMock = vi.fn(() => ({ eq: eqAmendmentUpdateMock }));

  // resolutions: SELECT content_json .eq('id', resolutionId).single()
  const sampleContentJson = { preamble: [{ position: 1, text: 'Noting that...', type: 'preamble' }], operative: [{ position: 1, text: 'Decides to...', type: 'operative' }] };
  const singleResolutionMock = vi.fn().mockResolvedValue({
    data: { content_json: sampleContentJson },
    error: null,
  });
  const eqResolutionMock = vi.fn(() => ({ single: singleResolutionMock }));
  const selectResolutionMock = vi.fn(() => ({ eq: eqResolutionMock }));

  // amendment_log: INSERT captured
  amendmentLogInsertMock.mockResolvedValue({ error: null });
  const insertLogMock = amendmentLogInsertMock;

  const fromMock = vi.fn((table: string) => {
    if (table === 'eb_profiles')     return { select: selectProfileMock };
    if (table === 'amendments')      return { select: selectAmendmentMock, update: updateAmendmentMock };
    if (table === 'resolutions')     return { select: selectResolutionMock };
    if (table === 'amendment_log')   return { insert: insertLogMock };
    return {};
  });

  return {
    auth: { getUser: getUserMock },
    from: fromMock,
  };
}

// ---------------------------------------------------------------------------
// Wire Helper
// ---------------------------------------------------------------------------

async function wireMocks(
  amendmentId: string,
  resolutionId: string,
  amendmentType: 'modify' | 'strike' | 'add'
) {
  const { createClient } = await import('@/lib/supabase-server');
  const client = buildMock(amendmentId, resolutionId, amendmentType);
  (createClient as ReturnType<typeof vi.fn>).mockReturnValue(client);
}

// ---------------------------------------------------------------------------
// Property 12: Every amendment action produces a complete audit log entry
// Validates: Requirements 4.6, 8.1, 8.2, 8.3, 8.4
// ---------------------------------------------------------------------------

describe('Property 12: Every amendment action produces a complete audit log entry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('inserts exactly one amendment_log row with required non-null fields for any status/type combination', async () => {
    // Feature: sismun-digital-ledger-redesign, Property 12: Every amendment action produces a complete audit log entry
    // **Validates: Requirements 4.6, 8.1, 8.2, 8.3, 8.4**
    const { updateAmendmentStatus } = await import('@/lib/actions/amendments');

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('passed' as const, 'failed' as const),
        fc.constantFrom('modify' as const, 'strike' as const, 'add' as const),
        fc.uuid(),  // amendmentId
        fc.uuid(),  // resolutionId
        async (status, amendmentType, amendmentId, resolutionId) => {
          vi.clearAllMocks();
          amendmentLogInsertMock.mockResolvedValue({ error: null });

          await wireMocks(amendmentId, resolutionId, amendmentType);

          // Should not throw
          await expect(updateAmendmentStatus(amendmentId, status)).resolves.not.toThrow();

          // Exactly one row must be inserted into amendment_log
          expect(amendmentLogInsertMock).toHaveBeenCalledTimes(1);

          const insertPayload = amendmentLogInsertMock.mock.calls[0][0] as Record<string, unknown>;

          // Core required fields must be non-null
          expect(insertPayload.amendment_id).toBeTruthy();
          expect(insertPayload.resolution_id).toBeTruthy();
          expect(insertPayload.eb_profile_id).toBeTruthy();
          expect(insertPayload.action).toBeTruthy();
          expect(insertPayload.timestamp).toBeTruthy();

          // action must map correctly: 'passed' → 'approved', 'failed'/'withdrawn' → 'rejected'
          const expectedAction = status === 'passed' ? 'approved' : 'rejected';
          expect(insertPayload.action).toBe(expectedAction);

          // timestamp must be a valid ISO 8601 string
          const parsed = new Date(insertPayload.timestamp as string);
          expect(Number.isNaN(parsed.getTime())).toBe(false);

          // eb_profile_id must be the authenticated user's id
          expect(insertPayload.eb_profile_id).toBe('eb-user-id-123');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('records full_snapshot_json (non-null) for approved amendments', async () => {
    // **Validates: Requirements 8.4**
    const { updateAmendmentStatus } = await import('@/lib/actions/amendments');

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('modify' as const, 'strike' as const, 'add' as const),
        fc.uuid(),
        fc.uuid(),
        async (amendmentType, amendmentId, resolutionId) => {
          vi.clearAllMocks();
          amendmentLogInsertMock.mockResolvedValue({ error: null });

          await wireMocks(amendmentId, resolutionId, amendmentType);

          await expect(updateAmendmentStatus(amendmentId, 'passed')).resolves.not.toThrow();

          expect(amendmentLogInsertMock).toHaveBeenCalledTimes(1);
          const payload = amendmentLogInsertMock.mock.calls[0][0] as Record<string, unknown>;

          // For approvals, full_snapshot_json must be non-null
          expect(payload.full_snapshot_json).not.toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('sets action to "rejected" for failed/withdrawn status', async () => {
    // **Validates: Requirements 8.1**
    const { updateAmendmentStatus } = await import('@/lib/actions/amendments');

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('failed' as const, 'withdrawn' as const),
        fc.constantFrom('modify' as const, 'strike' as const, 'add' as const),
        fc.uuid(),
        fc.uuid(),
        async (status, amendmentType, amendmentId, resolutionId) => {
          vi.clearAllMocks();
          amendmentLogInsertMock.mockResolvedValue({ error: null });

          await wireMocks(amendmentId, resolutionId, amendmentType);

          await expect(updateAmendmentStatus(amendmentId, status)).resolves.not.toThrow();

          expect(amendmentLogInsertMock).toHaveBeenCalledTimes(1);
          const payload = amendmentLogInsertMock.mock.calls[0][0] as Record<string, unknown>;
          expect(payload.action).toBe('rejected');
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 16: Amendment history is ordered by timestamp descending
// Feature: sismun-digital-ledger-redesign, Property 16: Amendment history is ordered by timestamp descending
// Validates: Requirements 8.6
// ---------------------------------------------------------------------------

import { sortAmendmentLogDescending } from '@/lib/floor-display'

describe('Property 16: Amendment history is ordered by timestamp descending', () => {
  it('returns entries sorted by timestamp descending for any array of log entries', () => {
    // Feature: sismun-digital-ledger-redesign, Property 16: Amendment history is ordered by timestamp descending
    // **Validates: Requirements 8.6**
    const MIN_DATE = new Date('1970-01-01T00:00:00.000Z')
    const MAX_DATE = new Date('2099-12-31T23:59:59.999Z')

    const amendmentLogEntryArb = fc.record({
      id: fc.uuid(),
      timestamp: fc.date({ min: MIN_DATE, max: MAX_DATE }).map(d => d.toISOString()),
    })

    const amendmentLogArrayArb = fc.array(amendmentLogEntryArb, { minLength: 0, maxLength: 20 })

    fc.assert(
      fc.property(
        amendmentLogArrayArb,
        (entries) => {
          const result = sortAmendmentLogDescending(entries)

          // Result must have same length as input
          expect(result).toHaveLength(entries.length)

          // Adjacent pairs must be in descending order (result[i].timestamp >= result[i+1].timestamp)
          for (let i = 0; i < result.length - 1; i++) {
            const timeA = new Date(result[i].timestamp).getTime()
            const timeB = new Date(result[i + 1].timestamp).getTime()
            expect(timeA >= timeB).toBe(true)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('does not mutate the original array', () => {
    // Validates that sortAmendmentLogDescending is a pure function
    const MIN_DATE = new Date('1970-01-01T00:00:00.000Z')
    const MAX_DATE = new Date('2099-12-31T23:59:59.999Z')

    const amendmentLogEntryArb = fc.record({
      id: fc.uuid(),
      timestamp: fc.date({ min: MIN_DATE, max: MAX_DATE }).map(d => d.toISOString()),
    })

    fc.assert(
      fc.property(
        fc.array(amendmentLogEntryArb, { minLength: 0, maxLength: 20 }),
        (entries) => {
          const originalIds = entries.map(e => e.id)
          sortAmendmentLogDescending(entries)
          const afterIds = entries.map(e => e.id)

          // Original array must be untouched
          expect(afterIds).toEqual(originalIds)
        }
      ),
      { numRuns: 100 }
    )
  })
})
