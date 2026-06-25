// Feature: sismun-digital-ledger-redesign, Property 7: Amendments are only accepted for floor resolutions
// Feature: sismun-digital-ledger-redesign, Property 8: Closed amendments gate blocks all proposals
// Feature: sismun-digital-ledger-redesign, Property 9: Amendment rate limit is enforced

/**
 * Property-based tests for amendment eligibility enforcement.
 *
 * Validates: Requirements 3.1, 3.2, 3.4, 3.5, 7.2
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

// Mock committee-password so any password is valid
vi.mock('@/lib/committee-password', () => ({
  validateCommitteePassword: vi.fn(() => true),
  getCommitteePassword: vi.fn(() => 'test-password'),
}));

// Tracks whether an insert was attempted on the amendments table
const insertMock = vi.fn();

// Mock supabase-server (regular client used for reads)
vi.mock('@/lib/supabase-server', () => ({
  createClient: vi.fn(),
}));

// Mock supabase-admin (service role client used for inserts)
vi.mock('@/lib/supabase-admin', () => ({
  createAdminClient: vi.fn(),
}));

// Mock assertEBAccess — not needed for anon proposeAmendment but imported
vi.mock('@/lib/actions/resolutions', () => ({
  assertEBAccess: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Mock Factories
// ---------------------------------------------------------------------------

/**
 * Build a basic Supabase mock for Properties 7 and 8.
 * Handles conference_settings, resolutions, and amendments tables.
 * The amendments count query returns 0 by default so it never triggers the
 * rate limit — allowing Properties 7 & 8 to focus on their own checks.
 */
function buildSupabaseMock(resolutionStatus: string, acceptingAmendments = true) {
  // conference_settings chain: .select().eq().single()
  const singleSettingsMock = vi.fn().mockResolvedValue({
    data: { accepting_amendments: acceptingAmendments },
    error: null,
  });
  const eqSettingsMock = vi.fn(() => ({ single: singleSettingsMock }));
  const selectSettingsMock = vi.fn(() => ({ eq: eqSettingsMock }));

  // resolutions chain: .select().eq().single()
  const singleResolutionMock = vi.fn().mockResolvedValue({
    data: { status: resolutionStatus, committee_slug: 'ga4', is_deleted: false },
    error: null,
  });
  const eqResolutionMock = vi.fn(() => ({ single: singleResolutionMock }));
  const selectResolutionMock = vi.fn(() => ({ eq: eqResolutionMock }));

  // amendments count chain: .select().eq().eq().eq().eq() — returns count: 0 (below rate limit)
  const eq4Mock = vi.fn().mockResolvedValue({ count: 0, error: null });
  const eq3Mock = vi.fn(() => ({ eq: eq4Mock }));
  const eq2Mock = vi.fn(() => ({ eq: eq3Mock }));
  const eq1Mock = vi.fn(() => ({ eq: eq2Mock }));
  const selectAmendmentsMock = vi.fn(() => ({ eq: eq1Mock }));

  const fromMock = vi.fn((table: string) => {
    if (table === 'conference_settings') {
      return { select: selectSettingsMock };
    }
    if (table === 'resolutions') {
      return { select: selectResolutionMock };
    }
    if (table === 'amendments') {
      return { select: selectAmendmentsMock };
    }
    return {};
  });

  return { from: fromMock };
}

/**
 * Build a Supabase mock that simulates `pendingCount` existing pending amendments
 * for the querying delegate/resolution combination. Used for Property 9.
 *
 * The mock handles three tables used by proposeAmendment:
 *   1. conference_settings — always returns accepting_amendments: true
 *   2. resolutions         — always returns status: 'floor'
 *   3. amendments          — returns `pendingCount` via { count, error: null }
 */
function buildRateLimitMock(pendingCount: number) {
  // conference_settings chain: .select().eq().single()
  const singleSettingsMock = vi.fn().mockResolvedValue({
    data: { accepting_amendments: true },
    error: null,
  });
  const eqSettingsMock = vi.fn(() => ({ single: singleSettingsMock }));
  const selectSettingsMock = vi.fn(() => ({ eq: eqSettingsMock }));

  // resolutions chain: .select().eq().single()
  const singleResolutionMock = vi.fn().mockResolvedValue({
    data: { status: 'floor', committee_slug: 'ga4', is_deleted: false },
    error: null,
  });
  const eqResolutionMock = vi.fn(() => ({ single: singleResolutionMock }));
  const selectResolutionMock = vi.fn(() => ({ eq: eqResolutionMock }));

  // amendments count chain: .select().eq().eq().eq().eq()
  // Each .eq() returns another chainable object; the final .eq() resolves the count query.
  const countResult = { count: pendingCount, error: null };
  const eq4Mock = vi.fn().mockResolvedValue(countResult);         // .eq('is_deleted', false)
  const eq3Mock = vi.fn(() => ({ eq: eq4Mock }));                 // .eq('status', 'pending')
  const eq2Mock = vi.fn(() => ({ eq: eq3Mock }));                 // .eq('delegate_country', ...)
  const eq1Mock = vi.fn(() => ({ eq: eq2Mock }));                 // .eq('resolution_id', ...)
  const selectAmendmentsMock = vi.fn(() => ({ eq: eq1Mock }));    // .select('id', { count: 'exact', head: true })

  const fromMock = vi.fn((table: string) => {
    if (table === 'conference_settings') return { select: selectSettingsMock };
    if (table === 'resolutions')         return { select: selectResolutionMock };
    if (table === 'amendments')          return { select: selectAmendmentsMock };
    return {};
  });

  return { from: fromMock };
}

// ---------------------------------------------------------------------------
// Wire Helpers
// ---------------------------------------------------------------------------

/**
 * Wire the mocked modules for a given resolution status (Properties 7 & 8).
 * Must be called before each test iteration.
 */
async function wireSupabaseMocks(resolutionStatus: string, acceptingAmendments = true) {
  const { createClient } = await import('@/lib/supabase-server');
  const { createAdminClient } = await import('@/lib/supabase-admin');

  const regularClient = buildSupabaseMock(resolutionStatus, acceptingAmendments);
  (createClient as ReturnType<typeof vi.fn>).mockReturnValue(regularClient);

  const adminClient = {
    from: vi.fn(() => ({
      insert: insertMock,
    })),
  };
  (createAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(adminClient);
}

/**
 * Wire the mocked modules for rate-limit testing (Property 9).
 * The regular client returns `pendingCount` for the amendments count query.
 */
async function wireRateLimitMocks(pendingCount: number) {
  const { createClient } = await import('@/lib/supabase-server');
  const { createAdminClient } = await import('@/lib/supabase-admin');

  (createClient as ReturnType<typeof vi.fn>).mockReturnValue(buildRateLimitMock(pendingCount));

  const adminClient = {
    from: vi.fn(() => ({ insert: insertMock })),
  };
  (createAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(adminClient);
}

// ---------------------------------------------------------------------------
// Property 7: Amendments are only accepted for floor resolutions
// Validates: Requirements 3.1, 3.2
// ---------------------------------------------------------------------------

describe('Property 7: Amendments are only accepted for floor resolutions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    insertMock.mockResolvedValue({ error: null });
  });

  it('rejects amendment proposals for resolutions with non-floor status and does not insert', async () => {
    const { proposeAmendment } = await import('@/lib/actions/amendments');

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('pending' as const, 'rejected' as const),
        async (nonFloorStatus) => {
          vi.clearAllMocks();
          insertMock.mockResolvedValue({ error: null });

          await wireSupabaseMocks(nonFloorStatus);

          const validInput = {
            resolutionId: '00000000-0000-0000-0000-000000000001',
            committeeSlug: 'ga4',
            delegateName: 'Test Delegate',
            delegateCountry: 'Test Country',
            amendmentType: 'modify' as const,
            clauseReference: 'OP1',
            proposedText: 'Proposed text for the clause.',
            committeePassword: 'test-password',
          };

          // The action must throw when the resolution is not on the floor
          await expect(proposeAmendment(validInput)).rejects.toThrow();

          // No row should be inserted into amendments
          expect(insertMock).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('accepts amendment proposals for resolutions with floor status', async () => {
    const { proposeAmendment } = await import('@/lib/actions/amendments');

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('floor' as const),
        async (_floorStatus) => {
          vi.clearAllMocks();
          insertMock.mockResolvedValue({ error: null });

          await wireSupabaseMocks('floor');

          const validInput = {
            resolutionId: '00000000-0000-0000-0000-000000000001',
            committeeSlug: 'ga4',
            delegateName: 'Test Delegate',
            delegateCountry: 'Test Country',
            amendmentType: 'modify' as const,
            clauseReference: 'OP1',
            proposedText: 'Proposed text for the clause.',
            committeePassword: 'test-password',
          };

          // Should not throw for floor resolutions
          await expect(proposeAmendment(validInput)).resolves.not.toThrow();

          // An insert should have been attempted
          expect(insertMock).toHaveBeenCalledTimes(1);
        }
      ),
      { numRuns: 10 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 8: Closed amendments gate blocks all proposals
// Validates: Requirements 3.4, 7.2
// ---------------------------------------------------------------------------

describe('Property 8: Closed amendments gate blocks all proposals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    insertMock.mockResolvedValue({ error: null });
  });

  it('rejects any valid amendment proposal when accepting_amendments is false and never inserts', async () => {
    const { proposeAmendment } = await import('@/lib/actions/amendments');

    // Arbitraries for valid amendment inputs
    const delegateNameArb = fc.string({ minLength: 1, maxLength: 80 }).filter(s => s.trim().length > 0);
    const delegateCountryArb = fc.string({ minLength: 1, maxLength: 80 }).filter(s => s.trim().length > 0);
    const amendmentTypeArb = fc.constantFrom('modify' as const, 'strike' as const, 'add' as const);
    const clauseReferenceArb = fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0);
    const proposedTextArb = fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0);

    await fc.assert(
      fc.asyncProperty(
        delegateNameArb,
        delegateCountryArb,
        amendmentTypeArb,
        clauseReferenceArb,
        proposedTextArb,
        async (delegateName, delegateCountry, amendmentType, clauseReference, proposedText) => {
          vi.clearAllMocks();
          insertMock.mockResolvedValue({ error: null });

          // Gate is CLOSED — resolution is on the floor but amendments are off
          await wireSupabaseMocks('floor', false);

          const input = {
            resolutionId: '00000000-0000-0000-0000-000000000001',
            committeeSlug: 'ga4',
            delegateName,
            delegateCountry,
            amendmentType,
            clauseReference,
            proposedText,
            committeePassword: 'test-password',
          };

          // Must throw when the amendments gate is closed
          await expect(proposeAmendment(input)).rejects.toThrow(
            'Amendment submissions are currently closed.'
          );

          // No amendment row should ever be inserted
          expect(insertMock).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 9: Amendment rate limit is enforced
// Feature: sismun-digital-ledger-redesign, Property 9: Amendment rate limit is enforced
// Validates: Requirements 3.5
// ---------------------------------------------------------------------------

describe('Property 9: Amendment rate limit is enforced', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    insertMock.mockResolvedValue({ error: null });
  });

  it('rejects proposal when delegate already has 5 or more pending amendments and does not insert', async () => {
    // Feature: sismun-digital-ledger-redesign, Property 9: Amendment rate limit is enforced
    // Validates: Requirements 3.5
    const { proposeAmendment } = await import('@/lib/actions/amendments');

    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 5, max: 20 }),   // existing pending amendment count >= 5
        async (pendingCount) => {
          vi.clearAllMocks();
          insertMock.mockResolvedValue({ error: null });

          await wireRateLimitMocks(pendingCount);

          const input = {
            resolutionId: '00000000-0000-0000-0000-000000000001',
            committeeSlug: 'ga4',
            delegateName: 'Test Delegate',
            delegateCountry: 'Test Country',
            amendmentType: 'modify' as const,
            clauseReference: 'OP1',
            proposedText: 'Some proposed text.',
            committeePassword: 'test-password',
          };

          // Must be rejected with a rate-limit error when count >= 5
          await expect(proposeAmendment(input)).rejects.toThrow(
            'Rate limit reached'
          );

          // No amendment row should have been inserted
          expect(insertMock).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('accepts proposal when delegate has fewer than 5 pending amendments', async () => {
    // Validates: Requirements 3.5 (the happy-path inverse of the rate-limit rule)
    const { proposeAmendment } = await import('@/lib/actions/amendments');

    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 4 }),   // existing pending amendment count < 5
        async (pendingCount) => {
          vi.clearAllMocks();
          insertMock.mockResolvedValue({ error: null });

          await wireRateLimitMocks(pendingCount);

          const input = {
            resolutionId: '00000000-0000-0000-0000-000000000001',
            committeeSlug: 'ga4',
            delegateName: 'Test Delegate',
            delegateCountry: 'Test Country',
            amendmentType: 'modify' as const,
            clauseReference: 'OP1',
            proposedText: 'Some proposed text.',
            committeePassword: 'test-password',
          };

          // Should succeed — count is below the limit
          await expect(proposeAmendment(input)).resolves.not.toThrow();

          // An insert should have been attempted
          expect(insertMock).toHaveBeenCalledTimes(1);
        }
      ),
      { numRuns: 100 }
    );
  });
});
