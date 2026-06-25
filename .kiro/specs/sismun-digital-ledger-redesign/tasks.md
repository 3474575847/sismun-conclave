# Implementation Plan: SISMUN Digital Ledger Redesign

## Overview

This plan addresses three areas of remaining work in the SISMUN Digital Ledger: (1) fixing the DB schema mismatch so `status` values align with the delegate submission model, (2) wiring the amendment review queue with a complete audit trail, and (3) adding the conference settings gate and UI polish across all portal views. Tasks are ordered so each step builds on the previous, ending with full end-to-end wiring.

## Tasks

- [x] 1. Fix database schema — align status values and update RLS
  - Update `lib/db-migration.sql`: change the `resolutions.status` CHECK constraint from `('drafting', 'submitted', 'floor')` to `('pending', 'floor', 'rejected')`
  - Add `submitted_by_name TEXT` and `submitted_by_country TEXT` columns to `resolutions` if not already present (the submit page inserts them but the migration does not declare them)
  - Update the `public_read_floor` RLS policy on `resolutions` to use `status IN ('floor')` instead of `status IN ('submitted', 'floor')`
  - Update the `public_read_amendments` RLS policy on `amendments` to reference `status = 'floor'` only
  - Add a `rejection_note TEXT` column to `resolutions` (used by `EBReviewPanel.handleAction`)
  - _Requirements: 1.1, 2.2, 2.3, 3.1, 3.2, 5.4_

- [x] 2. Fix `proposeAmendment` server action — enforce floor-only eligibility
  - In `lib/actions/amendments.ts`, change the status check from `['submitted', 'floor'].includes(resolution.status)` to `resolution.status === 'floor'`
  - Update the error message to: `'This resolution is not on the floor and cannot receive amendments'`
  - _Requirements: 3.1, 3.2_

  - [x] 2.1 Write property test for amendment eligibility (Property 7)
    - **Property 7: Amendments are only accepted for floor resolutions**
    - Test file: `__tests__/amendments.property.test.ts`
    - Use `fc.constantFrom('pending', 'rejected')` for non-floor statuses; assert `proposeAmendment` throws and no row is inserted
    - **Validates: Requirements 3.1, 3.2**

  - [x] 2.2 Write property test for closed amendments gate (Property 8)
    - **Property 8: Closed amendments gate blocks all proposals**
    - Same test file; mock `conference_settings.accepting_amendments = false`; assert rejection for any valid amendment input
    - **Validates: Requirements 3.4, 7.2**

  - [x] 2.3 Write property test for amendment rate limit (Property 9)
    - **Property 9: Amendment rate limit is enforced**
    - Use `fc.integer({ min: 5, max: 20 })` for existing pending count; assert the 5-or-more case is rejected
    - **Validates: Requirements 3.5**

- [x] 3. Fix `rejectAmendment` — complete the audit log entry
  - In `lib/actions/amendments.ts`, update `rejectAmendment` to fetch the amendment's full row (including `clause_section`, `clause_position`, `type`) and the parent resolution's current `content_json` before writing the log
  - Insert `full_snapshot_json` (current resolution `content_json`) into the `amendment_log` row on rejection
  - For rejected `modify`/`strike` amendments, also record `clause_before` from the current clause at `clause_position`
  - _Requirements: 4.5, 4.6, 8.1, 8.2_

  - [x] 3.1 Write property test for audit log completeness (Property 12)
    - **Property 12: Every amendment action produces a complete audit log entry**
    - Test file: `__tests__/audit-log.property.test.ts`
    - Use `fc.constantFrom('approved', 'rejected')` and amendment type arbitraries; assert log entry fields per the property definition
    - **Validates: Requirements 4.6, 8.1, 8.2, 8.3, 8.4**

- [x] 4. Extract `approveResolution` and `rejectResolution` server actions
  - In `lib/actions/resolutions.ts`, add `approveResolution(id: string)` that: calls `assertEBAccess`, transitions `status` from `'pending'` to `'floor'`, sets `submitted_at` to current UTC timestamp
  - Add `rejectResolution(id: string, note?: string)` that: calls `assertEBAccess`, sets `is_deleted = true` and optionally `rejection_note`
  - Both functions must call `revalidatePath('/portal/eb')` and `revalidatePath('/portal/floor')`
  - _Requirements: 2.2, 2.3, 2.5_

  - [x] 4.1 Write property test for resolution approval state transition (Property 5)
    - **Property 5: Resolution approval transitions state correctly**
    - Test file: `__tests__/resolution-lifecycle.property.test.ts`
    - Use `fc.uuid()` for resolution IDs; assert `status = 'floor'` and non-null `submitted_at` after approval
    - **Validates: Requirements 2.2**

  - [x] 4.2 Write property test for cross-committee authorization (Property 6)
    - **Property 6: Cross-committee actions are rejected**
    - Test file: `__tests__/authorization.property.test.ts`
    - Use `fc.string()` for mismatched committee slugs; assert error thrown and no DB rows modified for `approveResolution`, `rejectResolution`, `approveAmendment`, `rejectAmendment`
    - **Validates: Requirements 2.5, 4.7, 6.3**

- [x] 5. Wire `EBReviewPanel` to use the new server actions
  - In `components/portal/EBReviewPanel.tsx`, replace the direct `supabase.from('resolutions').update(...)` call in `handleAction` with calls to `approveResolution(id)` and `rejectResolution(id, note)`
  - Replace `alert()` error display with inline error state rendered below the action buttons
  - _Requirements: 2.2, 2.3, 2.5_

- [x] 6. Add `ConferenceSettingsPanel` component and wire it into the EB dashboard
  - Create `components/portal/ConferenceSettingsPanel.tsx` as a client component
  - Render two toggle switches: `accepting_submissions` and `accepting_amendments`; read initial values from a prop passed by the server page
  - On toggle, call a new server action `updateConferenceSettings(field, value)` in `lib/actions/resolutions.ts` that: calls `assertEBAccess` and checks `profile.role === 'sg'`, throws `'Only the SG can modify conference settings'` for non-SG users, updates the singleton row
  - In `app/portal/eb/page.tsx`, fetch `conference_settings` and pass it to `ConferenceSettingsPanel`; render the panel only when `profile.role === 'sg'`
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 6.1 Write property test for non-SG settings modification (Property 15)
    - **Property 15: Non-SG EB members cannot modify Conference_Settings**
    - Test file: `__tests__/authorization.property.test.ts`
    - Use `fc.record({ role: fc.constant('chair') })`; assert `updateConferenceSettings` throws and the row is unchanged
    - **Validates: Requirements 7.4**

- [x] 7. Add `SubmissionClosedBanner` and gate the delegate submission form
  - Create `components/portal/SubmissionClosedBanner.tsx` — a simple banner component that accepts a `message` prop
  - In `app/portal/[slug]/submit/page.tsx`, convert the page to a server component wrapper that fetches `conference_settings` and passes `accepting_submissions` as a prop to a new `SubmissionForm` client component (extract the existing form logic into `components/portal/SubmissionForm.tsx`)
  - When `accepting_submissions = false`, render `SubmissionClosedBanner` above the form and disable the submit button
  - The server action / Supabase insert must also check `accepting_submissions` on every request (already done in `proposeAmendment`; add the same check to the delegate submission insert path)
  - _Requirements: 1.3, 7.1, 7.5_

  - [x] 7.1 Write property test for closed submissions gate (Property 2)
    - **Property 2: Closed submissions gate blocks all inserts**
    - Test file: `__tests__/submission.property.test.ts`
    - Mock `conference_settings.accepting_submissions = false`; use valid submission arbitraries; assert no `blocs` or `resolutions` rows inserted
    - **Validates: Requirements 1.3, 7.1**

- [x] 8. Add `AmendmentClosedBanner` and gate the amendment proposal form
  - Create `components/portal/AmendmentClosedBanner.tsx` — mirrors `SubmissionClosedBanner`
  - In `app/portal/floor/[res_id]/amend/page.tsx`, fetch `conference_settings` server-side and pass `accepting_amendments` to the form; when false, render `AmendmentClosedBanner` and disable the submit button
  - The `proposeAmendment` server action already checks this gate; no server-side change needed
  - _Requirements: 3.4, 7.2, 7.5_

- [x] 9. Fix `Floor_View` — enforce floor-only access and conditionally show amendment button
  - In `app/portal/floor/[res_id]/page.tsx`, change the Supabase query filter from `.in('status', ['submitted', 'floor'])` to `.eq('status', 'floor')` so pending/rejected resolutions return 404
  - Conditionally render the `+ PROPOSE AMENDMENT` link only when `resolution.status === 'floor'` (already guaranteed by the query, but add an explicit guard for clarity)
  - _Requirements: 3.3, 5.3, 5.4, 5.6_

  - [x] 9.1 Write property test for floor display filtering (Property 13)
    - **Property 13: Floor display shows only approved, non-deleted resolutions**
    - Test file: `__tests__/floor-display.property.test.ts`
    - Use `fc.array` of resolutions with random `status` and `is_deleted` values; assert only `status='floor'` and `is_deleted=false` rows are returned, ordered by `submitted_at` descending
    - **Validates: Requirements 5.1, 5.2**

- [x] 10. Add amendment history tab ordering and `full_snapshot_json` display to `Floor_View`
  - In `app/portal/floor/[res_id]/page.tsx`, confirm the `amendment_log` query uses `.order('timestamp', { ascending: false })` (already present; verify the limit is sufficient or remove it for full history)
  - In `components/portal/AmendmentList.tsx`, update the history tab to display `full_snapshot_json` as a collapsible "View snapshot" section per log entry when the field is non-null
  - _Requirements: 8.5, 8.6_

  - [ ] 10.1 Write property test for history ordering (Property 16)
    - **Property 16: Amendment history is ordered by timestamp descending**
    - Test file: `__tests__/audit-log.property.test.ts`
    - Use `fc.array` of log entries with random timestamps; assert the rendered list is sorted descending
    - **Validates: Requirements 8.6**

- [x] 11. Validate committee routing isolation — 404 for unknown slugs
  - In `app/portal/[slug]/submit/page.tsx` (the new server wrapper from Task 7), add `if (!committee) notFound()` before rendering (the current client component returns a plain message instead of a proper 404)
  - Confirm `app/portal/[slug]/page.tsx` already calls `notFound()` for unknown slugs (it does — verify no regression)
  - In `lib/actions/amendments.ts` `proposeAmendment`, verify that `committee_slug` is copied from the parent resolution row (not from user input) — already implemented; add a comment documenting this as the enforcement of Requirement 6.5
  - _Requirements: 6.1, 6.2, 6.5_

  - [ ] 11.1 Write property test for amendment committee_slug inheritance (Property 14)
    - **Property 14: Amendment committee_slug matches parent resolution**
    - Test file: `__tests__/amendments.property.test.ts`
    - Use `fc.string()` for arbitrary committee slugs on the resolution; assert the inserted amendment row always inherits the resolution's `committee_slug`
    - **Validates: Requirements 6.5**

- [x] 12. Add delegate submission server-side validation and `createDelegateSubmission` action
  - Create `lib/actions/delegate.ts` with a `createDelegateSubmission` server action that: validates all required fields (name, country, bloc name, topic index, at least one non-empty preamble clause, at least one non-empty operative clause), checks `accepting_submissions`, inserts `blocs` then `resolutions` rows in a single logical operation
  - Update `components/portal/SubmissionForm.tsx` (from Task 7) to call this server action instead of using the browser Supabase client directly
  - This ensures the server-side gate is always enforced even if the client-side check is bypassed
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ] 12.1 Write property test for valid submission creates pending rows (Property 1)
    - **Property 1: Valid submission creates pending rows**
    - Test file: `__tests__/submission.property.test.ts`
    - Use `fc.record({ name: fc.string({ minLength: 1 }), country: fc.string({ minLength: 1 }), ... })` with valid arbitraries; assert exactly one `blocs` row and one `resolutions` row with `status='pending'` are inserted
    - **Validates: Requirements 1.1**

  - [ ] 12.2 Write property test for invalid submissions rejected (Property 3)
    - **Property 3: Invalid submissions are rejected without DB writes**
    - Same test file; use `fc.record` with one or more required fields set to empty string; assert error thrown and no rows inserted
    - **Validates: Requirements 1.4**

- [x] 13. Add EB data scoping tests and verify SG vs Chair query isolation
  - Confirm `app/portal/eb/page.tsx` and `app/portal/eb/amendments/page.tsx` both apply the `committee_slug` filter for Chairs and omit it for SG (already implemented; add explicit test coverage)
  - _Requirements: 2.1, 4.1, 6.3, 6.4_

  - [ ] 13.1 Write property test for EB data scoped to committee (Property 4)
    - **Property 4: EB resolution data is scoped to committee**
    - Test file: `__tests__/eb-scoping.property.test.ts`
    - Use `fc.record({ role: fc.constantFrom('chair', 'sg'), committee_slug: fc.option(fc.string()) })`; assert Chair sees only own committee, SG sees all
    - **Validates: Requirements 2.1, 6.3, 6.4**

- [x] 14. Wire amendment application integrity — verify `approveAmendment` content mutations
  - In `lib/actions/amendments.ts`, add a guard in `approveAmendment`: if `amendment.type === 'modify'` or `'strike'` and no clause is found at `clause_position`, throw `'Target clause not found at position ${amendment.clause_position}'`
  - Ensure the `add` path sorts the resulting array by `position` ascending after insertion (already done; add a comment)
  - _Requirements: 4.2, 4.3, 4.4_

  - [ ] 14.1 Write property test for amendment application integrity (Property 10)
    - **Property 10: Amendment application preserves content integrity**
    - Test file: `__tests__/amendment-application.property.test.ts`
    - Use `fc.array(clauseArbitrary)` and `fc.constantFrom('add', 'strike', 'modify')`; apply a sequence of amendments and assert the resulting `content_json` reflects all changes correctly
    - **Validates: Requirements 4.2, 4.3, 4.4**

  - [ ] 14.2 Write property test for rejected amendments do not modify content (Property 11)
    - **Property 11: Rejected amendments do not modify content**
    - Same test file; assert `content_json` is byte-for-byte identical before and after rejection, and `vote_status = 'failed'`
    - **Validates: Requirements 4.5**

- [x] 15. Checkpoint — Ensure all tests pass and end-to-end flow is wired
  - Ensure all tests pass, ask the user if questions arise.
  - Verify the complete flow manually: delegate submits → EB approves → resolution appears on floor → delegate proposes amendment → EB approves amendment → `content_json` updated → audit log entry created with `full_snapshot_json`
  - Confirm `CommitteeLedger` on `/committees/[slug]` shows the same floor resolutions as `/portal/[slug]`
  - _Requirements: 5.1, 5.2, 5.3, 5.5, 5.6_

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests use [fast-check](https://fast-check.dev/) with `numRuns: 100` minimum; tag each test with `// Feature: sismun-digital-ledger-redesign, Property N: ...`
- The DB migration changes (Task 1) must be run in the Supabase SQL Editor before any application code changes are deployed
- Tasks 2–5 fix existing bugs; Tasks 6–11 add missing features; Tasks 12–14 add server-side validation and test coverage
- `EBReviewPanel` currently uses the browser Supabase client for approve/reject — Task 5 moves this to server actions for consistent authorization enforcement
