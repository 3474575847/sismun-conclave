// Feature: sismun-digital-ledger-redesign, Property 13: Floor display shows only approved, non-deleted resolutions

/**
 * Property-based tests for floor display filtering logic.
 *
 * Validates: Requirements 5.1, 5.2
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { filterFloorResolutions } from '@/lib/floor-display'

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

// Constrain dates to JavaScript's safe Date range to avoid Invalid Date errors
const MIN_DATE = new Date('1970-01-01T00:00:00.000Z')
const MAX_DATE = new Date('2099-12-31T23:59:59.999Z')

const isoDateArb = fc.date({ min: MIN_DATE, max: MAX_DATE }).map(d => d.toISOString())

const resolutionArb = fc.record({
  id: fc.uuid(),
  status: fc.constantFrom('pending', 'floor', 'rejected'),
  is_deleted: fc.boolean(),
  submitted_at: fc.option(isoDateArb, { nil: null }),
})

const resolutionArrayArb = fc.array(resolutionArb, { minLength: 0, maxLength: 20 })

// ---------------------------------------------------------------------------
// Property 13: Floor display shows only approved, non-deleted resolutions
// Validates: Requirements 5.1, 5.2
// ---------------------------------------------------------------------------

describe('Property 13: Floor display shows only approved, non-deleted resolutions', () => {

  it('returns only rows where status === "floor" AND is_deleted === false', () => {
    // Feature: sismun-digital-ledger-redesign, Property 13: Floor display shows only approved, non-deleted resolutions
    // Validates: Requirements 5.1, 5.2
    fc.assert(
      fc.property(
        resolutionArrayArb,
        (resolutions) => {
          const result = filterFloorResolutions(resolutions)

          // Every returned row must be status='floor' and is_deleted=false
          for (const row of result) {
            expect(row.status).toBe('floor')
            expect(row.is_deleted).toBe(false)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('result is sorted by submitted_at descending (non-null before null, later dates first)', () => {
    // Feature: sismun-digital-ledger-redesign, Property 13: Floor display shows only approved, non-deleted resolutions
    // Validates: Requirements 5.2
    fc.assert(
      fc.property(
        resolutionArrayArb,
        (resolutions) => {
          const result = filterFloorResolutions(resolutions)

          for (let i = 0; i < result.length - 1; i++) {
            const current = result[i]
            const next = result[i + 1]

            if (current.submitted_at === null && next.submitted_at === null) {
              // Both null — order between them doesn't matter, just continue
              continue
            }

            if (current.submitted_at !== null && next.submitted_at === null) {
              // Non-null before null — correct (nulls last)
              continue
            }

            if (current.submitted_at === null && next.submitted_at !== null) {
              // null before non-null — WRONG (nulls should be last)
              expect.fail(
                `Null submitted_at at index ${i} should not appear before non-null at index ${i + 1}`
              )
            }

            // Both non-null: current must be >= next in numeric time (descending order)
            const timeA = new Date(current.submitted_at!).getTime()
            const timeB = new Date(next.submitted_at!).getTime()
            expect(timeA >= timeB).toBe(true)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('returns an empty array when no resolutions have status="floor" and is_deleted=false', () => {
    // Feature: sismun-digital-ledger-redesign, Property 13: Floor display shows only approved, non-deleted resolutions
    // Validates: Requirements 5.1
    const nonFloorResolutionArb = fc.record({
      id: fc.uuid(),
      // Guarantee there are no floor+non-deleted rows by combining two cases:
      // either status is not 'floor', or is_deleted is true
      status: fc.oneof(
        fc.constantFrom('pending', 'rejected'),
        fc.constant('floor')
      ),
      is_deleted: fc.boolean(),
      submitted_at: fc.option(isoDateArb, { nil: null }),
    }).filter(r => !(r.status === 'floor' && !r.is_deleted))

    fc.assert(
      fc.property(
        fc.array(nonFloorResolutionArb, { minLength: 0, maxLength: 20 }),
        (resolutions) => {
          const result = filterFloorResolutions(resolutions)
          expect(result).toHaveLength(0)
        }
      ),
      { numRuns: 100 }
    )
  })
})
