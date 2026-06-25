// Feature: sismun-digital-ledger-redesign, Property 2: Closed submissions gate blocks all inserts

/**
 * Property-based tests for delegate resolution submission.
 *
 * Validates: Requirements 1.3, 7.1
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

// Mock supabase-server (regular client used for conference_settings read)
vi.mock('@/lib/supabase-server', () => ({
  createClient: vi.fn(),
}));

// Mock supabase-admin (service role client used for blocs/resolutions inserts)
vi.mock('@/lib/supabase-admin', () => ({
  createAdminClient: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Insert tracking mocks
// ---------------------------------------------------------------------------

// Separate mocks for blocs and resolutions inserts so we can assert each
const blocsInsertMock = vi.fn();
const resolutionsInsertMock = vi.fn();

// ---------------------------------------------------------------------------
// Mock Factories
// ---------------------------------------------------------------------------

/**
 * Build a supabase-server mock that returns the given `acceptingSubmissions`
 * value from conference_settings. Used by createDelegateSubmission's gate check.
 */
function buildRegularClientMock(acceptingSubmissions: boolean) {
  // chain: .from('conference_settings').select(...).eq(...).single()
  const singleSettingsMock = vi.fn().mockResolvedValue({
    data: { accepting_submissions: acceptingSubmissions },
    error: null,
  });
  const eqSettingsMock = vi.fn(() => ({ single: singleSettingsMock }));
  const selectSettingsMock = vi.fn(() => ({ eq: eqSettingsMock }));

  return {
    from: vi.fn((table: string) => {
      if (table === 'conference_settings') {
        return { select: selectSettingsMock };
      }
      return {};
    }),
  };
}

/**
 * Build a supabase-admin mock that tracks inserts to blocs and resolutions.
 * The blocs insert resolves with a fake bloc id so the resolutions insert can proceed.
 */
function buildAdminClientMock() {
  // blocs insert chain: .from('blocs').insert(...).select('id').single()
  const singleBlocMock = vi.fn().mockResolvedValue({
    data: { id: 'fake-bloc-id-1234' },
    error: null,
  });
  const selectBlocMock = vi.fn(() => ({ single: singleBlocMock }));
  blocsInsertMock.mockReturnValue({ select: selectBlocMock });

  // resolutions insert chain: .from('resolutions').insert(...)
  resolutionsInsertMock.mockResolvedValue({ error: null });

  return {
    from: vi.fn((table: string) => {
      if (table === 'blocs') {
        return { insert: blocsInsertMock };
      }
      if (table === 'resolutions') {
        return { insert: resolutionsInsertMock };
      }
      return {};
    }),
  };
}

// ---------------------------------------------------------------------------
// Wire helpers
// ---------------------------------------------------------------------------

async function wireMocks(acceptingSubmissions: boolean) {
  const { createClient } = await import('@/lib/supabase-server');
  const { createAdminClient } = await import('@/lib/supabase-admin');

  (createClient as ReturnType<typeof vi.fn>).mockReturnValue(
    buildRegularClientMock(acceptingSubmissions)
  );
  (createAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(
    buildAdminClientMock()
  );
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Non-empty, non-whitespace string arbitrary */
const nonEmptyStringArb = fc.string({ minLength: 1, maxLength: 80 }).filter(s => s.trim().length > 0);

/** Array of at least one non-empty string (for clause lists) */
const clauseArrayArb = fc.array(nonEmptyStringArb, { minLength: 1, maxLength: 5 });

/** Valid topicIndex: 0 or 1 */
const topicIndexArb = fc.integer({ min: 0, max: 1 });

/** Full valid submission record arbitrary */
const validSubmissionArb = fc.record({
  submitterName: nonEmptyStringArb,
  submitterCountry: nonEmptyStringArb,
  blocName: nonEmptyStringArb,
  committeeSlug: nonEmptyStringArb,
  topicIndex: topicIndexArb,
  preambleClauses: clauseArrayArb,
  operativeClauses: clauseArrayArb,
});

// ---------------------------------------------------------------------------
// Property 2: Closed submissions gate blocks all inserts
// Validates: Requirements 1.3, 7.1
// ---------------------------------------------------------------------------

describe('Property 2: Closed submissions gate blocks all inserts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects any valid submission when accepting_submissions is false and never inserts blocs or resolutions', async () => {
    // Feature: sismun-digital-ledger-redesign, Property 2: Closed submissions gate blocks all inserts
    // Validates: Requirements 1.3, 7.1
    const { createDelegateSubmission } = await import('@/lib/actions/delegate');

    await fc.assert(
      fc.asyncProperty(
        validSubmissionArb,
        async (submission) => {
          vi.clearAllMocks();

          // Gate is CLOSED — accepting_submissions = false
          await wireMocks(false);

          // Must throw with the closed-gate message
          await expect(createDelegateSubmission(submission)).rejects.toThrow(
            'Resolution submissions are currently closed.'
          );

          // No blocs row should be inserted
          expect(blocsInsertMock).not.toHaveBeenCalled();

          // No resolutions row should be inserted
          expect(resolutionsInsertMock).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 2 (happy path): When gate is open, valid submissions insert both rows
// Validates: Requirements 1.1
// ---------------------------------------------------------------------------

describe('Property 2 (open gate): Valid submissions insert blocs and resolutions rows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('inserts exactly one blocs row and one resolutions row when accepting_submissions is true', async () => {
    // Validates: Requirements 1.1 (inverse of Property 2 gate check)
    const { createDelegateSubmission } = await import('@/lib/actions/delegate');

    await fc.assert(
      fc.asyncProperty(
        validSubmissionArb,
        async (submission) => {
          vi.clearAllMocks();

          // Gate is OPEN — accepting_submissions = true
          await wireMocks(true);

          // Should resolve without throwing
          await expect(createDelegateSubmission(submission)).resolves.not.toThrow();

          // Exactly one blocs insert should have been called
          expect(blocsInsertMock).toHaveBeenCalledTimes(1);

          // Exactly one resolutions insert should have been called
          expect(resolutionsInsertMock).toHaveBeenCalledTimes(1);
        }
      ),
      { numRuns: 100 }
    );
  });
});
