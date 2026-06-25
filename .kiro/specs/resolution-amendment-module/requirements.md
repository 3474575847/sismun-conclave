# Requirements Document

## Introduction

The SISMUN Resolution & Amendment Module Redesign replaces the existing resolution system with a simpler, file-centric model. Instead of delegates drafting resolutions clause-by-clause in the browser, the Secretariat uploads Word/DOCX files for each committee. A committee can have multiple published resolutions simultaneously. Delegates view and download published files, then submit amendments digitally (name, country, clause reference, proposed text). To prevent cross-committee spam, delegates must enter a committee-specific password before submitting amendments — the password is derived from the committee name and chair name and requires no database storage. Everyone can read all amendments publicly. Chairs review amendments in an authenticated dashboard and mark each one passed, failed, or withdrawn after physical voting. When voting concludes, the Secretariat re-uploads an updated DOCX; the previous version is automatically archived and the new file becomes the live resolution.

The platform is built on Next.js 14 App Router, Supabase (PostgreSQL + Auth + Storage + RLS), Tailwind CSS, and deployed on Vercel free tier. There are no delegate accounts, no in-browser voting, and no AI or clause-extraction features.

---

## Glossary

- **Secretariat**: An authenticated user with the `secretariat` role. Responsible for uploading and archiving resolution DOCX files.
- **Chair**: An authenticated EB member scoped to a single committee (`committee_slug` in `eb_profiles`). Reviews and decides on amendments for their committee.
- **SG (Secretary-General)**: An authenticated EB member with `committee_slug = NULL`, granting cross-committee visibility.
- **EB (Executive Board)**: Collective term for Chairs and the SG.
- **Delegate**: An unauthenticated conference participant who views resolutions and submits amendments.
- **Resolution**: A published DOCX file for a committee, stored in Supabase Storage. A committee may have multiple `published` resolutions simultaneously. Each resolution has a `status` of `published` or `archived`.
- **Resolution_Version**: A single upload event. Multiple resolutions per committee may be `published` at the same time; re-uploading a specific resolution archives only that resolution's prior version.
- **Committee_Password**: A hardcoded delegate access code derived as `{committee_name}{chair_name}` (e.g. `UNSCJohnSmith`). Required to submit amendments. Stored nowhere — validated server-side by recomputing the expected value from the committees data source.
- **Amendment**: A delegate-submitted proposed change to the live resolution. Stored in the `amendments` table with a `status` of `pending`, `passed`, `failed`, or `withdrawn`.
- **Committee_Page**: The public-facing page at `/committees/[slug]` showing the live resolution and amendment statuses.
- **Amendment_Form**: The public-facing form at `/committees/[slug]/amend` where delegates submit amendments after entering the Committee_Password.
- **Secretariat_Panel**: The authenticated page at `/portal/eb/resolutions` where the Secretariat uploads DOCX files and manages resolutions.
- **Chair_Dashboard**: The authenticated page at `/portal/eb/amendments` where Chairs review and decide on amendments.
- **Conference_Settings**: The singleton row in `conference_settings` controlling the `accepting_amendments` flag.
- **Committee_Password**: A hardcoded access code computed as `{committee.name}{committee.chair_name}` (case-insensitive). Required to submit amendments. Never stored in the database.

---

## Requirements

### Requirement 1: Secretariat Resolution Upload

**User Story:** As a Secretariat member, I want to upload a DOCX resolution file for a specific committee, so that delegates can view and download the official resolution document.

#### Acceptance Criteria

1. WHEN an authenticated Secretariat member submits the upload form with a valid DOCX file, a committee selection, and a resolution title, THE Secretariat_Panel SHALL upload the file to Supabase Storage and insert a `resolution_versions` row with `status = 'published'`.
2. A committee MAY have multiple `published` resolutions simultaneously. THE system SHALL NOT enforce a one-published-per-committee constraint — each resolution is versioned independently.
3. IF the uploaded file is not a DOCX (i.e., MIME type is not `application/vnd.openxmlformats-officedocument.wordprocessingml.document`), THEN THE Secretariat_Panel SHALL display a validation error and SHALL NOT upload the file or insert any database rows.
4. IF the uploaded file exceeds 10 MB, THEN THE Secretariat_Panel SHALL display a file-size error and SHALL NOT upload the file.
5. WHEN the upload succeeds, THE Secretariat_Panel SHALL display a success confirmation showing the committee name, resolution title, and the timestamp of the new upload.
6. WHEN an unauthenticated user attempts to access the Secretariat_Panel, THE system SHALL redirect the user to `/portal/login`.

---

### Requirement 2: Public Resolution Viewing and Download

**User Story:** As a Delegate, I want to view and download all published resolutions for my committee, so that I can read the documents and prepare amendments.

#### Acceptance Criteria

1. WHEN a visitor accesses `/committees/[slug]`, THE Committee_Page SHALL display all `published` resolutions for that committee, each showing the resolution title, upload timestamp, and a download link.
2. WHEN a visitor clicks a download link, THE Committee_Page SHALL initiate a download of that resolution's DOCX file directly from Supabase Storage.
3. IF no `published` resolutions exist for the committee, THEN THE Committee_Page SHALL display a message stating no resolutions have been published yet and SHALL NOT show any download links. THE Committee_Page SHALL always render either the resolution list or this message — never a blank state.
4. THE Committee_Page SHALL be accessible to unauthenticated users without requiring login.
5. WHEN a new resolution is published or an existing one is archived, THE Committee_Page SHALL reflect the change on the next page load without requiring a manual cache purge.

---

### Requirement 3: Delegate Amendment Submission

**User Story:** As a Delegate, I want to submit an amendment digitally by providing my name, country, the clause I want to change, and the proposed new text, so that the Chair can review my proposal.

#### Acceptance Criteria

1. WHEN a Delegate submits the Amendment_Form with a valid delegate name, country, clause reference, proposed text, and the correct Committee_Password, THE Amendment_Form SHALL insert a row into `amendments` with `status = 'pending'` linked to the selected resolution.
2. IF the Delegate enters an incorrect Committee_Password, THEN THE Amendment_Form SHALL display a validation error stating the password is incorrect and SHALL NOT insert any rows.
3. THE Committee_Password SHALL be validated server-side by computing the expected value as the concatenation of the committee's `name` field and the committee's `chair_name` field from the committees data source (case-insensitive comparison). The password SHALL NOT be stored in the database.
4. IF the Delegate omits any of the required fields (delegate name, country, clause reference, proposed text, or committee password), THEN THE Amendment_Form SHALL display a field-level validation error and SHALL NOT insert any rows.
5. IF the `accepting_amendments` flag in Conference_Settings is `false`, THEN THE Amendment_Form SHALL display a message stating amendments are currently closed and SHALL NOT insert any rows.
6. THE Amendment_Form SHALL be accessible to unauthenticated users without requiring login.
7. WHEN the submission succeeds, THE Amendment_Form SHALL display a confirmation message and SHALL reset the form fields.
8. IF no `published` resolution exists for the committee, THEN THE Amendment_Form SHALL display an error stating there is no active resolution to amend and SHALL NOT allow submission.

---

### Requirement 4: Public Amendment Status Display

**User Story:** As a Delegate, I want to see the status of all amendments for my committee's resolutions, so that I can follow the outcome of the amendment voting process.

#### Acceptance Criteria

1. WHEN a visitor accesses `/committees/[slug]`, THE Committee_Page SHALL display all amendments for the committee, grouped under their respective resolution, showing each amendment's delegate name, country, clause reference, proposed text, and `status`.
2. THE Committee_Page SHALL display amendment statuses using the following labels: `pending` as "Pending", `passed` as "Passed", `failed` as "Failed", `withdrawn` as "Withdrawn".
3. WHEN an amendment's `status` changes, THE Committee_Page SHALL reflect the updated status on the next page load.
4. THE Committee_Page SHALL display amendments sorted so that `passed` amendments appear first, followed by `pending`, then `failed` and `withdrawn`.
5. IF a resolution has no amendments, THE Committee_Page SHALL display a message under that resolution stating no amendments have been submitted.

---

### Requirement 5: Chair Amendment Review

**User Story:** As a Chair, I want to see all pending amendments for my committee in a dashboard and mark each one as passed, failed, or withdrawn after physical voting, so that the public record reflects the room's decisions.

#### Acceptance Criteria

1. WHEN an authenticated Chair accesses the Chair_Dashboard, THE Chair_Dashboard SHALL display all amendments for the Chair's committee, grouped by `status`, with `pending` amendments shown first.
2. WHEN a Chair clicks "Mark Passed" on a `pending` amendment, THE Chair_Dashboard SHALL update the amendment's `status` to `'passed'` and SHALL display the updated status immediately.
3. WHEN a Chair clicks "Mark Failed" on a `pending` amendment, THE Chair_Dashboard SHALL update the amendment's `status` to `'failed'` and SHALL display the updated status immediately.
4. WHEN a Chair clicks "Mark Withdrawn" on a `pending` amendment, THE Chair_Dashboard SHALL update the amendment's `status` to `'withdrawn'` and SHALL display the updated status immediately.
5. IF a Chair attempts to change the `status` of an amendment belonging to a different committee, THEN THE Chair_Dashboard SHALL return an authorization error and SHALL NOT modify the amendment row.
6. WHEN an unauthenticated user attempts to access the Chair_Dashboard, THE system SHALL redirect the user to `/portal/login`.
7. THE Chair_Dashboard SHALL display the delegate name, country, clause reference, and proposed text for each amendment.

---

### Requirement 6: Resolution Versioning and Archiving

**User Story:** As a Secretariat member, I want to re-upload an updated version of a specific resolution, so that the previous version is archived and the new file becomes the live document.

#### Acceptance Criteria

1. WHEN the Secretariat re-uploads a DOCX for an existing resolution (identified by its ID), THE Secretariat_Panel SHALL set the existing `resolution_versions` row's `status` to `'archived'` and insert a new row with `status = 'published'` for the same resolution ID, atomically within the same database transaction.
2. WHEN a resolution version is archived, THE system SHALL retain the archived DOCX file in Supabase Storage and SHALL NOT delete it.
3. WHEN a visitor accesses the Secretariat_Panel, THE Secretariat_Panel SHALL display the full version history for each resolution, showing the upload timestamp and `status` of each version.
4. THE archived DOCX files SHALL remain accessible via their original Storage paths so that version history links remain valid. THE system SHALL NOT delete any DOCX file from Supabase Storage, regardless of its version status.
5. Amendments linked to an archived resolution version SHALL remain visible in the Chair_Dashboard and on the Committee_Page under the archived resolution's history.

---

### Requirement 7: Conference Settings — Amendment Window Control

**User Story:** As the SG, I want to open and close the amendment submission window, so that delegates can only submit amendments during the designated period.

#### Acceptance Criteria

1. WHEN the SG sets `accepting_amendments = false` in Conference_Settings, THE Amendment_Form SHALL reject all new amendment submissions with a message stating the amendment window is closed.
2. WHEN the SG sets `accepting_amendments = true` in Conference_Settings, THE Amendment_Form SHALL accept new amendment submissions.
3. THE Amendment_Form SHALL read the `accepting_amendments` flag on every request and SHALL NOT cache the value across requests.
4. WHEN an authenticated non-SG EB member attempts to modify Conference_Settings, THE system SHALL return an authorization error and SHALL NOT update the row.
5. THE Conference_Settings table SHALL enforce a singleton constraint so that exactly one row exists at all times.

---

### Requirement 8: Access Control and RLS

**User Story:** As a system administrator, I want all data access to be enforced by Supabase Row Level Security, so that unauthenticated delegates can only read published data and submit amendments, while write operations are restricted to authenticated EB members.

#### Acceptance Criteria

1. THE `resolution_versions` table SHALL allow anonymous (unauthenticated) users to `SELECT` rows with `status = 'published'` only.
2. THE `resolution_versions` table SHALL allow only authenticated users with the `secretariat` or `sg` role to `INSERT` and `UPDATE` rows.
3. THE `amendments` table SHALL allow anonymous users to `INSERT` rows (with a valid committee password verified server-side) and to `SELECT` all rows linked to any `published` or `archived` resolution version for public display.
4. THE `amendments` table SHALL allow only authenticated Chairs to `UPDATE` the `status` field on amendments where `committee_slug` matches the Chair's own `committee_slug`. Anonymous users SHALL NOT be permitted to update any amendment rows regardless of committee.
5. THE Supabase Storage bucket containing DOCX files SHALL allow anonymous users to download files via public URLs.
6. THE Supabase Storage bucket SHALL allow only authenticated users with the `secretariat` or `sg` role to upload files.
