# Requirements Document

## Introduction

The SISMUN Digital Ledger Redesign consolidates and completes the MUN Resolution Ledger built on Next.js 14, Supabase, and Tailwind. The system has recently migrated from a centralized EB-drafting model to a Delegate Submission model. This spec covers three areas of remaining work:

1. **Amendment Integration** — Enforce that only `floor`-status resolutions can receive amendments, and wire the EB amendment review queue into the existing approval flow.
2. **UI Polish** — Ensure the `pending → floor` status transition is seamless across all portal views, and that committee-specific routing remains strictly isolated.
3. **End-to-End Verification** — Validate the complete flow from public delegate submission through EB approval to live display on the public committee page.

---

## Glossary

- **Delegate**: A conference participant who submits resolutions via the public portal. Not authenticated.
- **Chair**: An authenticated EB member scoped to a single committee (`committee_slug` is set in `eb_profiles`).
- **SG (Secretary General)**: An authenticated EB member with `committee_slug = NULL`, granting visibility across all committees.
- **EB (Executive Board)**: Collective term for Chairs and the SG.
- **Resolution**: A formal document stored in the `resolutions` table with a `status` of `pending`, `floor`, or `rejected`.
- **Bloc**: A group of countries co-sponsoring a resolution, stored in the `blocs` table.
- **Amendment**: A proposed change to a `floor` resolution, stored in the `amendments` table. Types: `add`, `strike`, `modify`.
- **Amendment_Log**: An immutable audit trail of EB decisions on amendments, stored in `amendment_log`.
- **Submission_Portal**: The public-facing page at `/portal/[slug]/submit`.
- **Committee_Floor**: The public-facing page at `/portal/[slug]` showing approved resolutions.
- **EB_Dashboard**: The authenticated page at `/portal/eb` for reviewing pending resolutions.
- **Amendment_Queue**: The authenticated page at `/portal/eb/amendments` for reviewing pending amendments.
- **CommitteeLedger**: The `CommitteeLedger.tsx` component embedded in `/committees/[slug]` showing live floor resolutions.
- **Floor_View**: The page at `/portal/floor/[res_id]` showing a single approved resolution and its amendments.
- **Conference_Settings**: The singleton row in `conference_settings` controlling `accepting_submissions` and `accepting_amendments` flags.

---

## Requirements

### Requirement 1: Delegate Resolution Submission

**User Story:** As a Delegate, I want to submit a draft resolution through the public portal, so that the EB can review and approve it for the committee floor.

#### Acceptance Criteria

1. WHEN a Delegate submits the resolution form at `/portal/[slug]/submit` with valid submitter name, country, bloc name, topic selection, at least one preambulatory clause, and at least one operative clause, THE Submission_Portal SHALL insert a `blocs` row and a `resolutions` row with `status = 'pending'` into Supabase.
2. WHEN a Delegate submits the form, THE Submission_Portal SHALL display a success confirmation screen without requiring authentication.
3. IF the `accepting_submissions` flag in Conference_Settings is `false`, THEN THE Submission_Portal SHALL display an error message stating submissions are currently closed and SHALL NOT insert any rows.
4. IF the Delegate omits the submitter name, country, bloc name, topic, or all clauses of either type, THEN THE Submission_Portal SHALL display a field-level validation error and SHALL NOT submit the form.
5. THE Submission_Portal SHALL be accessible to unauthenticated (anonymous) users via Supabase RLS `anon` role.

---

### Requirement 2: EB Resolution Review

**User Story:** As an EB member, I want to review pending resolution submissions in the EB Dashboard, so that I can approve or reject them before they appear on the committee floor.

#### Acceptance Criteria

1. WHEN an authenticated EB member accesses `/portal/eb`, THE EB_Dashboard SHALL display all resolutions with `status = 'pending'` and `is_deleted = false` scoped to the member's committee (or all committees if the member is an SG).
2. WHEN a Chair approves a resolution, THE EB_Dashboard SHALL update the resolution's `status` to `'floor'` and set `submitted_at` to the current UTC timestamp.
3. WHEN a Chair rejects a resolution, THE EB_Dashboard SHALL set `is_deleted = true` on the resolution row, removing it from all public views.
4. WHEN an unauthenticated user attempts to access `/portal/eb`, THE EB_Dashboard SHALL redirect the user to `/portal/login`.
5. WHEN a Chair attempts to approve or reject a resolution belonging to a different committee, THE EB_Dashboard SHALL return an authorization error and SHALL NOT modify the resolution.
6. WHILE the EB_Dashboard is displaying pending resolutions, THE EB_Dashboard SHALL show a live count badge of pending submissions per committee tab.

---

### Requirement 3: Amendment Eligibility Enforcement

**User Story:** As a system administrator, I want amendments to be restricted to approved resolutions only, so that delegates cannot propose changes to resolutions still under EB review.

#### Acceptance Criteria

1. WHEN a Delegate submits an amendment proposal for a resolution with `status = 'floor'`, THE Amendment system SHALL accept the proposal and insert a row into `amendments` with `vote_status = 'pending'`.
2. IF a Delegate attempts to propose an amendment for a resolution with `status = 'pending'` or `status = 'rejected'`, THEN THE Amendment system SHALL return an error stating the resolution is not on the floor and SHALL NOT insert the amendment row.
3. THE Floor_View SHALL display the "Propose Amendment" button only for resolutions with `status = 'floor'`.
4. IF the `accepting_amendments` flag in Conference_Settings is `false`, THEN THE Amendment system SHALL reject all amendment proposals with an error message stating amendments are currently closed.
5. IF a Delegate has 5 or more pending amendments on the same resolution from the same country, THEN THE Amendment system SHALL reject the new proposal with a rate-limit error.

---

### Requirement 4: EB Amendment Review

**User Story:** As an EB member, I want to review and act on pending amendment proposals in the Amendment Queue, so that approved amendments are applied to the live resolution text.

#### Acceptance Criteria

1. WHEN an authenticated EB member accesses `/portal/eb/amendments`, THE Amendment_Queue SHALL display all amendments with `vote_status = 'pending'` and `is_deleted = false` scoped to the member's committee (or all committees if the member is an SG).
2. WHEN a Chair approves an amendment of type `modify`, THE Amendment system SHALL replace the target clause text in `resolutions.content_json` at the matching `clause_position` and set the amendment's `vote_status` to `'passed'`.
3. WHEN a Chair approves an amendment of type `strike`, THE Amendment system SHALL remove the target clause from `resolutions.content_json` and set the amendment's `vote_status` to `'passed'`.
4. WHEN a Chair approves an amendment of type `add`, THE Amendment system SHALL insert the new clause at `target_position` in `resolutions.content_json`, sorted by position, and set the amendment's `vote_status` to `'passed'`.
5. WHEN a Chair rejects an amendment, THE Amendment system SHALL set the amendment's `vote_status` to `'failed'` and SHALL NOT modify `resolutions.content_json`.
6. WHEN any amendment is approved or rejected, THE Amendment system SHALL insert a row into `amendment_log` recording the `action`, `eb_profile_id`, `clause_before`, `clause_after`, and a full `snapshot_json` of the resolution content at that moment.
7. WHEN a Chair attempts to act on an amendment belonging to a different committee, THE Amendment system SHALL return an authorization error and SHALL NOT modify any rows.

---

### Requirement 5: Public Floor Display

**User Story:** As a conference attendee, I want to view approved resolutions on the committee floor page and the main committee page, so that I can follow the live state of debate.

#### Acceptance Criteria

1. WHEN a visitor accesses `/portal/[slug]`, THE Committee_Floor SHALL display all resolutions with `status = 'floor'` and `is_deleted = false` for the given committee slug, ordered by `submitted_at` descending.
2. WHEN a visitor accesses `/committees/[slug]`, THE CommitteeLedger SHALL display all resolutions with `status = 'floor'` and `is_deleted = false` for the given committee slug.
3. WHEN a visitor accesses `/portal/floor/[res_id]` for a resolution with `status = 'floor'`, THE Floor_View SHALL display the full resolution content including all preamble and operative clauses, the bloc name, member countries, and the committee topic.
4. IF a visitor accesses `/portal/floor/[res_id]` for a resolution with `status = 'pending'` or `status = 'rejected'`, THEN THE Floor_View SHALL return a 404 Not Found response.
5. THE Committee_Floor SHALL display a "Submit Resolution" link pointing to `/portal/[slug]/submit` for the current committee slug.
6. WHEN a resolution has no approved amendments, THE Floor_View SHALL display the original `content_json` clauses. WHEN a resolution has approved amendments, THE Floor_View SHALL display the current `content_json` reflecting all applied amendments.

---

### Requirement 6: Committee Routing Isolation

**User Story:** As a system administrator, I want each committee's portal routes to be strictly isolated, so that delegates and EB members cannot access or modify data belonging to other committees.

#### Acceptance Criteria

1. THE Submission_Portal SHALL only accept submissions where `committee_slug` matches a valid slug defined in the `committees` data source.
2. IF a visitor accesses `/portal/[slug]` or `/portal/[slug]/submit` with a slug that does not exist in the `committees` data source, THEN THE system SHALL return a 404 Not Found response.
3. WHILE a Chair is authenticated, THE EB_Dashboard SHALL only display resolutions and amendments where `committee_slug` matches the Chair's `committee_slug` in `eb_profiles`.
4. WHILE an SG is authenticated, THE EB_Dashboard SHALL display resolutions and amendments across all committee slugs.
5. THE Amendment system SHALL enforce that the `committee_slug` on an amendment row matches the `committee_slug` of its parent resolution at insert time.

---

### Requirement 7: Conference Settings Control

**User Story:** As the SG, I want to control whether submissions and amendments are open or closed, so that I can manage the conference schedule.

#### Acceptance Criteria

1. WHEN the SG sets `accepting_submissions = false` in Conference_Settings, THE Submission_Portal SHALL reject all new resolution submissions with a clear error message.
2. WHEN the SG sets `accepting_amendments = false` in Conference_Settings, THE Amendment system SHALL reject all new amendment proposals with a clear error message.
3. THE Conference_Settings table SHALL enforce a singleton constraint (only one row with `id = 1`).
4. WHEN an authenticated non-SG EB member attempts to modify Conference_Settings, THE system SHALL return an authorization error and SHALL NOT update the row.
5. THE Submission_Portal and Amendment system SHALL read Conference_Settings on every request and SHALL NOT cache the open/closed state across requests.

---

### Requirement 8: Amendment Audit Trail

**User Story:** As the SG, I want a complete audit trail of all amendment decisions, so that I can review the history of changes to any resolution.

#### Acceptance Criteria

1. THE Amendment_Log SHALL record every `approved` and `rejected` action with the `amendment_id`, `resolution_id`, `eb_profile_id`, and `timestamp`.
2. WHEN an amendment of type `modify` or `strike` is approved, THE Amendment_Log SHALL record the `clause_before` text.
3. WHEN an amendment of type `modify` or `add` is approved, THE Amendment_Log SHALL record the `clause_after` text.
4. WHEN any amendment is approved, THE Amendment_Log SHALL record a `full_snapshot_json` of the complete resolution `content_json` at the moment of approval.
5. THE Amendment_Log SHALL be readable by all authenticated and anonymous users via RLS policy.
6. THE Floor_View SHALL display the amendment history tab showing all `amendment_log` entries for the resolution, ordered by `timestamp` descending.
