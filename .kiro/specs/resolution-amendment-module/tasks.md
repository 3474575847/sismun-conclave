# Implementation Plan: Resolution & Amendment Module

## Overview

This plan replaces the existing clause-based resolution system with a file-centric model. Tasks are ordered to avoid breaking the live site: old code is removed only after new code is in place. The database migration is the first step and must be run in Supabase before any application code is deployed.

## Tasks

- [x] 1. Write the new database migration SQL
  - Create `lib/db-migration-v2.sql` with the full new schema
  - Define `resolutions` table: `id`, `committee_slug`, `title`, `topic_index`, `resolution_code`, `status` CHECK `('published','archived')`, `current_file_path`, `uploaded_by`, `published_at`, `archived_at`, `created_at`, `is_deleted`
  - Define `resolution_files` table: `id`, `resolution_id` (FK), `committee_slug`, `file_path`, `file_name`, `version_number`, `status` CHECK `('active','archived')`, `uploaded_by`, `uploaded_at`
  - Define new `amendments` table: `id`, `resolution_id` (FK), `committee_slug`, `delegate_name`, `delegate_country`, `clause_reference`, `proposed_text`, `status` CHECK `('pending','passed','failed','withdrawn')`, `reviewed_by`, `reviewed_at`, `created_at`, `is_deleted`
  - Add `ALTER TABLE conference_settings ADD COLUMN IF NOT EXISTS accepting_amendments BOOLEAN DEFAULT false`
  - Add all indexes: `idx_resolutions_committee_status`, `idx_resolution_files_resolution`, `idx_amendments_resolution`, `idx_amendments_committee`
  - Add all RLS policies as specified in design section 3
  - Add `ALTER TABLE public.resolutions RENAME TO resolutions_legacy` guard (only if old table exists) to preserve existing data
  - _Requirements: 1.1, 6.1, 8.1, 8.2, 8.3, 8.4_

- [x] 2. Create `lib/committee-password.ts` utility
  - Export `getCommitteePassword(slug: string): string`
  - Find committee by slug in `data/committees.ts`
  - Find the officer with `role === 'President'` in `studentOfficers`
  - Return `(committee.name + president.name).toLowerCase().replace(/\s+/g, '')`
  - Throw descriptive errors if committee or president not found
  - _Requirements: 3.3_

- [x] 3. Write new `lib/actions/resolutions.ts`
  - Replace the existing file entirely
  - Keep the `assertEBAccess` helper (reuse pattern from existing code)
  - Add `assertSecretariatAccess(committeeSlug?: string)` — checks `role IN ('secretariat','sg','admin')`
  - Implement `uploadResolution(data)`:
    - Calls `assertSecretariatAccess(committeeSlug)`
    - Uploads file to Supabase Storage at path `resolutions/{slug}/{uuid}/v1_{filename}`
    - Inserts `resolutions` row with `status='published'`, `current_file_path`
    - Inserts `resolution_files` row with `version_number=1`, `status='active'`
    - Calls `revalidatePath('/committees/{slug}')` and `revalidatePath('/portal/eb/resolutions')`
    - Returns `{ resolutionId }`
  - Implement `republishResolution(data)`:
    - Calls `assertSecretariatAccess`
    - Fetches current active `resolution_files` row to get current version number
    - Uploads new file to Storage at `v{n+1}_{filename}`
    - Updates old `resolution_files` row: `status='archived'`
    - Inserts new `resolution_files` row: `status='active'`, incremented version
    - Updates `resolutions.current_file_path` to new path
    - Calls `revalidatePath`
  - Implement `archiveResolution(resolutionId)`:
    - Calls `assertSecretariatAccess`
    - Sets `resolutions.status='archived'`, `archived_at=now()`
    - Calls `revalidatePath`
  - Export `ContentJson` type alias as `{}` (empty — no longer used) for backward compat if needed
  - _Requirements: 1.1, 1.2, 6.1, 6.2, 6.4_

- [x] 4. Write new `lib/actions/amendments.ts`
  - Replace the existing file entirely
  - Implement `proposeAmendment(data)`:
    - Validate all fields non-empty (delegateName, delegateCountry, clauseReference, proposedText, committeePassword)
    - Call `getCommitteePassword(committeeSlug)` and compare to submitted password (both lowercased, whitespace stripped) — throw `'Incorrect committee password'` on mismatch
    - Fetch `conference_settings.accepting_amendments` with no cache — throw `'Amendment window is currently closed'` if false
    - Fetch resolution — verify `status='published'` and `is_deleted=false` — throw if not found or not published
    - Insert `amendments` row with `status='pending'`
    - Call `revalidatePath('/committees/{committeeSlug}')`
  - Implement `updateAmendmentStatus(amendmentId, status)`:
    - Fetch amendment to get `committee_slug`
    - Call `assertEBAccess(committee_slug)` — reuse helper from resolutions.ts
    - Update `amendments` row: `status`, `reviewed_by=uid`, `reviewed_at=now()`
    - Call `revalidatePath('/portal/eb/amendments')` and `revalidatePath('/committees/{slug}')`
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.2, 5.3, 5.4, 5.5_

- [x] 5. Create `components/portal/ResolutionUploadForm.tsx`
  - Client component (`'use client'`)
  - Props: `committees: Committee[]`, `onSuccess?: () => void`
  - Form fields: committee select (dropdown), resolution title (text input), resolution code (optional text), file input (accept `.docx` only)
  - Client-side validation: MIME type check (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`), file size ≤ 10MB
  - On submit: calls `uploadResolution` server action
  - Shows inline error state and success confirmation (committee name + timestamp)
  - Match existing dark glass-morphism aesthetic (bg-white/[0.03], border-white/10, font-mono, amber accents)
  - _Requirements: 1.1, 1.3, 1.4, 1.5_

- [x] 6. Create `components/portal/ResolutionVersionHistory.tsx`
  - Client component
  - Props: `resolutionId: string`, `title: string`, `files: ResolutionFile[]`
  - Renders an accordion/collapsible showing all `resolution_files` rows for a resolution
  - Each row: version number, filename, upload timestamp, status badge (active/archived), download link
  - Shows a "Re-upload" button that opens a file input inline — calls `republishResolution`
  - _Requirements: 6.3, 6.4, 6.5_

- [x] 7. Create `/portal/eb/resolutions/page.tsx` (Secretariat panel)
  - Server component, protected by portal layout auth guard
  - Fetches all resolutions for the authenticated user's committee (or all if SG), including `resolution_files`
  - Renders `ResolutionUploadForm` at the top
  - Below: list of existing resolutions, each with `ResolutionVersionHistory` accordion
  - Shows "Archive Resolution" button per resolution (calls `archiveResolution`)
  - _Requirements: 1.1, 1.5, 1.6, 6.3, 6.4_

- [x] 8. Create `components/portal/AmendmentSubmitForm.tsx`
  - Client component (`'use client'`)
  - Props: `resolutions: { id: string; title: string }[]`, `committeeSlug: string`
  - Form fields: resolution selector (dropdown), delegate name, delegate country, clause reference (text), proposed text (textarea), committee password (password input with hint "Enter your committee access code")
  - On submit: calls `proposeAmendment` server action
  - Shows field-level validation errors, password error, closed-window message, success confirmation + form reset
  - If `resolutions` array is empty: shows "No active resolutions to amend" and disables form
  - _Requirements: 3.1, 3.2, 3.4, 3.5, 3.6, 3.7, 3.8_

- [x] 9. Create `components/portal/AmendmentStatusList.tsx`
  - Pure display component (no client state needed — can be server-rendered)
  - Props: `amendments: Amendment[]`
  - Sorts: passed first, then pending, then failed/withdrawn
  - Each amendment card: delegate name + country, clause reference, proposed text, status badge
  - Status badge colors: pending=amber, passed=emerald, failed=red, withdrawn=white/muted
  - If empty: shows "No amendments submitted yet"
  - _Requirements: 4.1, 4.2, 4.4, 4.5_

- [x] 10. Rewrite `app/committees/[slug]/page.tsx`
  - Server component with `export const dynamic = 'force-dynamic'`
  - Fetch all `published` resolutions for the committee with nested amendments in one query (see design section 6.1)
  - Render existing committee header (name, description, topics, student officers) — preserve all existing UI
  - Add a "Resolutions" section below the existing content:
    - If no resolutions: show "No resolutions published yet" message
    - For each resolution: render a card with title, resolution code, download button, `AmendmentStatusList`
    - Below the resolution list: "Submit an Amendment" link to `/committees/{slug}/amend`
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 11. Create `app/committees/[slug]/amend/page.tsx`
  - Server component wrapper: fetches published resolutions for the committee, passes to `AmendmentSubmitForm`
  - Calls `notFound()` if committee slug is invalid
  - Renders `AmendmentSubmitForm` with the list of published resolutions
  - _Requirements: 3.1, 3.6, 3.8_

- [x] 12. Create `components/portal/ChairAmendmentQueue.tsx`
  - Client component (`'use client'`)
  - Props: `amendments: Amendment[]`, `resolutions: { id: string; title: string }[]`
  - Groups amendments by resolution, pending first within each group
  - Each amendment card: delegate name, country, clause reference, proposed text
  - Three action buttons per pending amendment: **Passed** / **Failed** / **Withdrawn**
  - Buttons call `updateAmendmentStatus` server action
  - Resolved amendments show status badge only (buttons disabled/hidden)
  - Inline error state on action failure
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.7_

- [x] 13. Rewrite `app/portal/eb/amendments/page.tsx`
  - Server component, protected by portal layout
  - Fetches all amendments for the Chair's committee (or all if SG), joined with resolution titles
  - Passes to `ChairAmendmentQueue`
  - _Requirements: 5.1, 5.6_

- [x] 14. Add amendment window toggle to EB dashboard
  - In `app/portal/eb/page.tsx`, add `accepting_amendments` toggle to the existing `ConferenceSettingsPanel`
  - The `updateConferenceSettings` server action in `lib/actions/resolutions.ts` already handles this field — verify it works with the new column name
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 15. Clean up old code
  - Delete `lib/actions/delegate.ts`
  - Delete `app/portal/floor/` directory (entire tree)
  - Delete `app/portal/[slug]/` directory (entire tree — committee floor moved to `/committees/[slug]`)
  - Delete `components/portal/SubmissionForm.tsx`
  - Delete `components/portal/SubmissionClosedBanner.tsx`
  - Delete `components/portal/AmendmentClosedBanner.tsx`
  - Delete `components/portal/AmendmentForm.tsx` (old clause-based form)
  - Delete `components/portal/ResolutionViewer.tsx`
  - Delete `components/portal/ResolutionEditor.tsx`
  - Delete `components/portal/CreateResolutionButton.tsx`
  - Delete `components/portal/PendingResolutionCard.tsx`
  - Delete `components/portal/ResolutionGrid.tsx`
  - Delete `components/committees/CommitteeLedger.tsx` (replaced by inline rendering in committee page)
  - Update `middleware.ts` if it references any deleted routes
  - _Requirements: (cleanup — no direct requirement, enables clean build)_

- [ ] 16. Final verification — build check and end-to-end smoke test
  - Run `npm run build` and fix any TypeScript errors
  - Verify: Secretariat can upload a DOCX at `/portal/eb/resolutions`
  - Verify: Resolution appears on `/committees/[slug]` with download link
  - Verify: Delegate can submit amendment at `/committees/[slug]/amend` with correct password
  - Verify: Wrong password is rejected
  - Verify: Chair can mark amendment passed/failed/withdrawn at `/portal/eb/amendments`
  - Verify: Status update is reflected on `/committees/[slug]`
  - _Requirements: all_

## Notes

- **Run the migration first**: Execute `lib/db-migration-v2.sql` in the Supabase SQL Editor before deploying any code changes. The old `resolutions` table will be renamed to `resolutions_legacy` — do not drop it until you confirm no data needs to be preserved.
- **Storage bucket**: Create a bucket named `resolutions` in Supabase Storage with public read access before running Task 3.
- **Task 15 (cleanup) should be last**: Keep old files until the new pages are confirmed working to avoid a broken intermediate state.
- **`updateConferenceSettings` in Task 14**: The existing server action already handles arbitrary field updates — just verify the `accepting_amendments` column exists after the migration.
