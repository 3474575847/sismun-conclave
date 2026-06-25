// Feature: sismun-digital-ledger-redesign, Property 5: Resolution approval transitions state correctly

/**
 * Property-based test for resolution approval state transition.
 *
 * Validates: Requirements 2.2
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

// Track the payload passed to .update() for assertions
const updateMock = vi.fn();

// Mock supabase-server
vi.mock('@/lib/supabase-server', () => ({
  createClient: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Mock Factory
// ---------------------------------------------------------------------------

/**
 * Build a Supabase mock for approveResolution.
 *
 * The mock handles two calls against the 'resolutions' table:
 *   1. .select('committee_slug').eq('id', id).single() → returns { committee_slug: 'ga4' }
 *   2. .update(payload).eq('id', id) → captured by updateMock
 *
 * And two calls against 'eb_profiles' (from assertEBAccess):
 *   .select('committee_slug, role').eq('id', userId).single() → valid EB profile
 */
function buildApproveResolutionMock(resolutionId: string) {
  // auth.getUser chain
  const getUserMock = vi.fn().mockResolvedValue({
    data: { user: { id: 'eb-user-id-123' } },
    error: null,
  });
  const authMock = { getUser: getUserMock };

  // eb_profiles chain: .select().eq().single()
  const singleProfileMock = vi.fn().mockResolvedValue({
    data: { committee_slug: 'ga4', role: 'chair' },
    error: null,
  });
  const eqProfileMock = vi.fn(() => ({ single: singleProfileMock }));
  const selectProfileMock = vi.fn(() => ({ eq: eqProfileMock }));

  // resolutions SELECT chain: .select('committee_slug').eq('id', id).single()
  const singleResolutionMock = vi.fn().mockResolvedValue({
    data: { id: resolutionId, status: 'pending', committee_slug: 'ga4', is_deleted: false },
    error: null,
  });
  const eqSelectMock = vi.fn(() => ({ single: singleResolutionMock }));
  const selectResolutionMock = vi.fn(() => ({ eq: eqSelectMock }));

  // resolutions UPDATE chain: .update(payload).eq('id', id)
  // updateMock captures the payload so we can assert on it
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
// Wire Helper
// ---------------------------------------------------------------------------

async function wireApproveResolutionMocks(resolutionId: string) {
  const { createClient } = await import('@/lib/supabase-server');
  const client = buildApproveResolutionMock(resolutionId);
  (createClient as ReturnType<typeof vi.fn>).mockReturnValue(client);
}

// ---------------------------------------------------------------------------
// Property 5: Resolution approval transitions state correctly
// Validates: Requirements 2.2
// ---------------------------------------------------------------------------

describe('Property 5: Resolution approval transitions state correctly', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets status to "floor" and provides a non-null submitted_at after approval for any resolution ID', async () => {
    // Feature: sismun-digital-ledger-redesign, Property 5: Resolution approval transitions state correctly
    // Validates: Requirements 2.2
    const { approveResolution } = await import('@/lib/actions/resolutions');

    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        async (resolutionId) => {
          vi.clearAllMocks();

          await wireApproveResolutionMocks(resolutionId);

          // Should not throw
          await expect(approveResolution(resolutionId)).resolves.not.toThrow();

          // Assert that update was called with the correct state transition payload
          expect(updateMock).toHaveBeenCalledTimes(1);

          const updatePayload = updateMock.mock.calls[0][0] as Record<string, unknown>;

          // Status must be 'floor'
          expect(updatePayload.status).toBe('floor');

          // submitted_at must be a non-null ISO 8601 string
          expect(updatePayload.submitted_at).not.toBeNull();
          expect(typeof updatePayload.submitted_at).toBe('string');

          // Verify it is a valid ISO date string
          const parsed = new Date(updatePayload.submitted_at as string);
          expect(Number.isNaN(parsed.getTime())).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
