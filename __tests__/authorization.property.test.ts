// Feature: sismun-digital-ledger-redesign, Property 6: Cross-committee actions are rejected

/**
 * Property-based test for cross-committee authorization enforcement.
 *
 * Validates: Requirements 2.5, 4.7, 6.3
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';

// ---------------------------------------------------------------------------
// Module mocks — must be declared before dynamic imports
// ---------------------------------------------------------------------------

// Mock next/cache to avoid Next.js runtime dependency
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock next/headers (required by supabase-server createClient)
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    getAll: () => [],
    set: vi.fn(),
  })),
}));

// Mock supabase-server
vi.mock('@/lib/supabase-server', () => ({
  createClient: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Shared update mock — reset per test run
// ---------------------------------------------------------------------------
const updateMock = vi.fn();

// ---------------------------------------------------------------------------
// Mock Factory for Resolution cross-committee
// ---------------------------------------------------------------------------

/**
 * Build a Supabase mock where:
 *   - The resolution belongs to `resourceCommitteeSlug`
 *   - The authenticated chair's profile has `committee_slug = chairCommitteeSlug`
 *
 * When these two slugs differ, `assertEBAccess` must throw.
 */
function buildCrossCommitteeResolutionMock(
  resolutionId: string,
  resourceCommitteeSlug: string,
  chairCommitteeSlug: string
) {
  const getUserMock = vi.fn().mockResolvedValue({
    data: { user: { id: 'eb-user-id-123' } },
    error: null,
  });
  const authMock = { getUser: getUserMock };

  // eb_profiles: return the chair's profile with a DIFFERENT committee_slug
  const singleProfileMock = vi.fn().mockResolvedValue({
    data: { committee_slug: chairCommitteeSlug, role: 'chair' },
    error: null,
  });
  const eqProfileMock = vi.fn(() => ({ single: singleProfileMock }));
  const selectProfileMock = vi.fn(() => ({ eq: eqProfileMock }));

  // resolutions SELECT: returns the resource's committee_slug
  const singleResolutionMock = vi.fn().mockResolvedValue({
    data: {
      id: resolutionId,
      committee_slug: resourceCommitteeSlug,
      status: 'pending',
      is_deleted: false,
    },
    error: null,
  });
  const eqSelectMock = vi.fn(() => ({ single: singleResolutionMock }));
  const selectResolutionMock = vi.fn(() => ({ eq: eqSelectMock }));

  // resolutions UPDATE: captured by updateMock
  const eqUpdateMock = vi.fn().mockResolvedValue({ error: null });
  updateMock.mockReturnValue({ eq: eqUpdateMock });

  const fromMock = vi.fn((table: string) => {
    if (table === 'eb_profiles') {
      return { select: selectProfileMock };
    }
    if (table === 'resolutions') {
      return {
        select: selectResolutionMock,
        update: updateMock,
      };
    }
    return {};
  });

  return { auth: authMock, from: fromMock };
}

// ---------------------------------------------------------------------------
// Mock Factory for Amendment cross-committee
// ---------------------------------------------------------------------------

/**
 * Build a Supabase mock where:
 *   - The amendment belongs to `resourceCommitteeSlug`
 *   - The authenticated chair's profile has `committee_slug = chairCommitteeSlug`
 */
function buildCrossCommitteeAmendmentMock(
  amendmentId: string,
  resourceCommitteeSlug: string,
  chairCommitteeSlug: string
) {
  const getUserMock = vi.fn().mockResolvedValue({
    data: { user: { id: 'eb-user-id-123' } },
    error: null,
  });
  const authMock = { getUser: getUserMock };

  // eb_profiles: return the chair's profile with a DIFFERENT committee_slug
  const singleProfileMock = vi.fn().mockResolvedValue({
    data: { committee_slug: chairCommitteeSlug, role: 'chair' },
    error: null,
  });
  const eqProfileMock = vi.fn(() => ({ single: singleProfileMock }));
  const selectProfileMock = vi.fn(() => ({ eq: eqProfileMock }));

  // amendments SELECT: returns the amendment with its committee_slug
  const singleAmendmentMock = vi.fn().mockResolvedValue({
    data: {
      id: amendmentId,
      committee_slug: resourceCommitteeSlug,
      status: 'pending',
      is_deleted: false,
      resolution_id: 'res-id-456',
      amendment_type: 'modify',
    },
    error: null,
  });
  const eqAmendmentSelectMock = vi.fn(() => ({ single: singleAmendmentMock }));
  const selectAmendmentMock = vi.fn(() => ({ eq: eqAmendmentSelectMock }));

  // amendments UPDATE: captured by updateMock
  const eqUpdateMock = vi.fn().mockResolvedValue({ error: null });
  updateMock.mockReturnValue({ eq: eqUpdateMock });

  const fromMock = vi.fn((table: string) => {
    if (table === 'eb_profiles') {
      return { select: selectProfileMock };
    }
    if (table === 'amendments') {
      return {
        select: selectAmendmentMock,
        update: updateMock,
      };
    }
    return {};
  });

  return { auth: authMock, from: fromMock };
}

// ---------------------------------------------------------------------------
// Wire helpers
// ---------------------------------------------------------------------------

async function wireCrossCommitteeResolutionMocks(
  resolutionId: string,
  resourceSlug: string,
  chairSlug: string
) {
  const { createClient } = await import('@/lib/supabase-server');
  const client = buildCrossCommitteeResolutionMock(resolutionId, resourceSlug, chairSlug);
  (createClient as ReturnType<typeof vi.fn>).mockReturnValue(client);
}

async function wireCrossCommitteeAmendmentMocks(
  amendmentId: string,
  resourceSlug: string,
  chairSlug: string
) {
  const { createClient } = await import('@/lib/supabase-server');
  const client = buildCrossCommitteeAmendmentMock(amendmentId, resourceSlug, chairSlug);
  (createClient as ReturnType<typeof vi.fn>).mockReturnValue(client);
}

// ---------------------------------------------------------------------------
// Arbitrary: two non-equal non-empty strings (resource slug vs chair slug)
// ---------------------------------------------------------------------------
const mismatchedSlugsArb = fc
  .tuple(
    fc.string({ minLength: 1 }),
    fc.string({ minLength: 1 })
  )
  .filter(([a, b]) => a !== b);

// ---------------------------------------------------------------------------
// Property 6: Cross-committee actions are rejected
// Validates: Requirements 2.5, 4.7, 6.3
// ---------------------------------------------------------------------------

describe('Property 6: Cross-committee actions are rejected', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── 6a: approveResolution with mismatched committee ────────────────────────
  it('approveResolution throws and does not call update when chair and resolution committees differ', async () => {
    // Feature: sismun-digital-ledger-redesign, Property 6: Cross-committee actions are rejected
    // Validates: Requirements 2.5, 6.3
    const { approveResolution } = await import('@/lib/actions/resolutions');

    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        mismatchedSlugsArb,
        async (resolutionId, [resourceSlug, chairSlug]) => {
          vi.clearAllMocks();

          await wireCrossCommitteeResolutionMocks(resolutionId, resourceSlug, chairSlug);

          // Must throw an authorization error
          await expect(approveResolution(resolutionId)).rejects.toThrow();

          // Must NOT call update on the resolutions table
          expect(updateMock).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });

  // ── 6b: rejectResolution with mismatched committee ─────────────────────────
  it('rejectResolution throws and does not call update when chair and resolution committees differ', async () => {
    // Feature: sismun-digital-ledger-redesign, Property 6: Cross-committee actions are rejected
    // Validates: Requirements 2.5, 6.3
    const { rejectResolution } = await import('@/lib/actions/resolutions');

    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        mismatchedSlugsArb,
        fc.option(fc.string({ minLength: 1 })),
        async (resolutionId, [resourceSlug, chairSlug], note) => {
          vi.clearAllMocks();

          await wireCrossCommitteeResolutionMocks(resolutionId, resourceSlug, chairSlug);

          // Must throw an authorization error (with or without a rejection note)
          await expect(rejectResolution(resolutionId, note ?? undefined)).rejects.toThrow();

          // Must NOT call update on the resolutions table
          expect(updateMock).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });

  // ── 6c: updateAmendmentStatus (approve) with mismatched committee ──────────
  it('updateAmendmentStatus throws and does not call update when chair and amendment committees differ (passed)', async () => {
    // Feature: sismun-digital-ledger-redesign, Property 6: Cross-committee actions are rejected
    // Validates: Requirements 4.7, 6.3
    const { updateAmendmentStatus } = await import('@/lib/actions/amendments');

    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        mismatchedSlugsArb,
        async (amendmentId, [resourceSlug, chairSlug]) => {
          vi.clearAllMocks();

          await wireCrossCommitteeAmendmentMocks(amendmentId, resourceSlug, chairSlug);

          // Must throw an authorization error
          await expect(updateAmendmentStatus(amendmentId, 'passed')).rejects.toThrow();

          // Must NOT call update on the amendments table
          expect(updateMock).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });

  // ── 6d: updateAmendmentStatus (reject) with mismatched committee ───────────
  it('updateAmendmentStatus throws and does not call update when chair and amendment committees differ (failed)', async () => {
    // Feature: sismun-digital-ledger-redesign, Property 6: Cross-committee actions are rejected
    // Validates: Requirements 4.7, 6.3
    const { updateAmendmentStatus } = await import('@/lib/actions/amendments');

    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        mismatchedSlugsArb,
        async (amendmentId, [resourceSlug, chairSlug]) => {
          vi.clearAllMocks();

          await wireCrossCommitteeAmendmentMocks(amendmentId, resourceSlug, chairSlug);

          // Must throw an authorization error
          await expect(updateAmendmentStatus(amendmentId, 'failed')).rejects.toThrow();

          // Must NOT call update on the amendments table
          expect(updateMock).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: sismun-digital-ledger-redesign, Property 15: Non-SG EB members cannot modify Conference_Settings

// ---------------------------------------------------------------------------
// Mock Factory for Conference Settings non-SG access
// ---------------------------------------------------------------------------

/**
 * Build a Supabase mock where the authenticated user has a non-SG EB role.
 * The conference_settings update mock is captured separately so we can assert
 * it is never called.
 */
function buildNonSGSettingsMock(role: string) {
  const getUserMock = vi.fn().mockResolvedValue({
    data: { user: { id: 'eb-user-id-456' } },
    error: null,
  });
  const authMock = { getUser: getUserMock };

  // eb_profiles: return a profile with the given non-SG role
  const singleProfileMock = vi.fn().mockResolvedValue({
    data: { role },
    error: null,
  });
  const eqProfileMock = vi.fn(() => ({ single: singleProfileMock }));
  const selectProfileMock = vi.fn(() => ({ eq: eqProfileMock }));

  // conference_settings UPDATE: captured by settingsUpdateMock
  const settingsUpdateMock = vi.fn();

  const fromMock = vi.fn((table: string) => {
    if (table === 'eb_profiles') {
      return { select: selectProfileMock };
    }
    if (table === 'conference_settings') {
      return { update: settingsUpdateMock };
    }
    return {};
  });

  return { client: { auth: authMock, from: fromMock }, settingsUpdateMock };
}

async function wireNonSGSettingsMocks(role: string): Promise<ReturnType<typeof vi.fn>> {
  const { createClient } = await import('@/lib/supabase-server');
  const { client, settingsUpdateMock } = buildNonSGSettingsMock(role);
  (createClient as ReturnType<typeof vi.fn>).mockReturnValue(client);
  return settingsUpdateMock;
}

// ---------------------------------------------------------------------------
// Property 15: Non-SG EB members cannot modify Conference_Settings
// Validates: Requirements 7.4
// ---------------------------------------------------------------------------

describe('Property 15: Non-SG EB members cannot modify Conference_Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updateConferenceSettings throws and does not call conference_settings update for non-SG roles', async () => {
    // Feature: sismun-digital-ledger-redesign, Property 15: Non-SG EB members cannot modify Conference_Settings
    // Validates: Requirements 7.4
    const { updateConferenceSettings } = await import('@/lib/actions/resolutions');

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('chair', 'secretariat'),
        fc.constantFrom('accepting_amendments', 'accepting_submissions', 'debate_mode'),
        fc.boolean(),
        async (role, field, value) => {
          vi.clearAllMocks();

          const settingsUpdateMock = await wireNonSGSettingsMocks(role);

          // Must throw an authorization error
          await expect(
            updateConferenceSettings(
              field as 'accepting_amendments' | 'accepting_submissions' | 'debate_mode',
              value
            )
          ).rejects.toThrow('Only the SG or Admin can modify conference settings');

          // Must NOT call update on the conference_settings table
          expect(settingsUpdateMock).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });
});
