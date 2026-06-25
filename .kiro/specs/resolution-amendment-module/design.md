# Design Document: Resolution & Amendment Module

## Overview

A file-centric resolution ledger for SISMUN. The Secretariat uploads DOCX files per committee; delegates read them and submit amendments via a password-gated form; Chairs mark amendment outcomes after physical voting. No delegate accounts, no in-browser voting, no clause extraction.

Stack: Next.js 14 App Router · Supabase (PostgreSQL + Auth + Storage + RLS) · Tailwind · Vercel free tier.

---

## 1. Data Model

### 1.1 `committees` (existing — `data/committees.ts`)

No database table needed. Committees are static data in `data/committees.ts`. The committee password is derived at runtime:

```ts
// lib/committee-password.ts
import { committees } from '@/data/committees'

export function getCommitteePassword(slug: string): string {
  const committee = committees.find(c => c.slug === slug)
  if (!committee) throw new Error('Committee not found')
  const president = committee.studentOfficers.find(o => o.role === 'President')
  if (!president) throw new Error('No president found for committee')
  // e.g. "General Assembly 4: Special Political and Decolonisation CommitteeRaphael Fohine"
  return (committee.name + president.name).toLowerCase().replace(/\s+/g, '')
}
```

Password comparison is case-insensitive and whitespace-stripped on both sides.

### 1.2 `resolutions` table

One row per resolution (a named document for a committee). Multiple resolutions per committee are allowed.

```sql
CREATE TABLE public.resolutions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_slug TEXT NOT NULL,
  title          TEXT NOT NULL,          -- e.g. "Resolution on Food Security"
  topic_index    INT,                    -- optional: which agenda topic this covers
  resolution_code TEXT,                  -- optional: e.g. "GA4/1/2026"
  status         TEXT NOT NULL DEFAULT 'published'
                 CHECK (status IN ('published', 'archived')),
  -- Current live file (denormalized for fast reads)
  current_file_path TEXT,               -- Supabase Storage path
  uploaded_by    UUID REFERENCES public.eb_profiles(id),
  published_at   TIMESTAMPTZ DEFAULT now(),
  archived_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT now(),
  is_deleted     BOOLEAN DEFAULT false
);

CREATE INDEX idx_resolutions_committee_status
  ON public.resolutions(committee_slug, status)
  WHERE is_deleted = false;
```

### 1.3 `resolution_files` table

One row per upload event. Tracks version history for a resolution.

```sql
CREATE TABLE public.resolution_files (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resolution_id  UUID NOT NULL REFERENCES public.resolutions(id) ON DELETE CASCADE,
  committee_slug TEXT NOT NULL,          -- denormalized for queries
  file_path      TEXT NOT NULL,          -- Supabase Storage path
  file_name      TEXT NOT NULL,          -- original filename shown to delegates
  version_number INT NOT NULL DEFAULT 1,
  status         TEXT NOT NULL DEFAULT 'active'
                 CHECK (status IN ('active', 'archived')),
  uploaded_by    UUID REFERENCES public.eb_profiles(id),
  uploaded_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_resolution_files_resolution
  ON public.resolution_files(resolution_id, status);
```

### 1.4 `amendments` table

```sql
CREATE TABLE public.amendments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resolution_id    UUID NOT NULL REFERENCES public.resolutions(id) ON DELETE CASCADE,
  committee_slug   TEXT NOT NULL,        -- denormalized for RLS scoping
  -- Delegate info (unauthenticated)
  delegate_name    TEXT NOT NULL,
  delegate_country TEXT NOT NULL,
  clause_reference TEXT NOT NULL,        -- e.g. "Operative Clause 3" or "PP4"
  proposed_text    TEXT NOT NULL,
  -- Status lifecycle: pending → passed | failed | withdrawn
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'passed', 'failed', 'withdrawn')),
  -- EB review
  reviewed_by      UUID REFERENCES public.eb_profiles(id),
  reviewed_at      TIMESTAMPTZ,
  -- Timestamps
  created_at       TIMESTAMPTZ DEFAULT now(),
  is_deleted       BOOLEAN DEFAULT false
);

CREATE INDEX idx_amendments_resolution
  ON public.amendments(resolution_id, status)
  WHERE is_deleted = false;

CREATE INDEX idx_amendments_committee
  ON public.amendments(committee_slug, status)
  WHERE is_deleted = false;
```

### 1.5 `eb_profiles` table (existing — unchanged)

```sql
-- Already exists. Relevant fields:
-- id UUID, name TEXT, committee_slug TEXT (NULL = SG), role TEXT ('chair'|'sg'|'secretariat'|'admin')
```

### 1.6 `conference_settings` table (existing — add column)

```sql
-- Add if not present:
ALTER TABLE public.conference_settings
  ADD COLUMN IF NOT EXISTS accepting_amendments BOOLEAN DEFAULT false;
```

---

## 2. Supabase Storage

**Bucket name:** `resolutions` (public bucket — no signed URLs needed, DOCX files are not sensitive)

**Path convention:**
```
resolutions/{committee_slug}/{resolution_id}/v{version_number}_{original_filename}.docx
```

Example:
```
resolutions/ga4/abc-123-def/v1_GA4_Resolution_FoodSecurity.docx
resolutions/ga4/abc-123-def/v2_GA4_Resolution_FoodSecurity_Amended.docx
```

**Bucket policy:** Public read (anyone can download). Upload restricted to authenticated `secretariat`/`sg` roles via RLS on the server action (Supabase Storage doesn't support RLS directly — enforce in the server action with `assertSecretariatAccess()`).

---

## 3. RLS Policies

```sql
-- Enable RLS
ALTER TABLE public.resolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resolution_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amendments ENABLE ROW LEVEL SECURITY;

-- ── resolutions ──────────────────────────────────────────────────────────────

-- Public: read published resolutions only
CREATE POLICY "public_read_published_resolutions" ON public.resolutions
  FOR SELECT TO anon, authenticated
  USING (status = 'published' AND is_deleted = false);

-- EB: read all (including archived) for their committee
CREATE POLICY "eb_read_committee_resolutions" ON public.resolutions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.eb_profiles
      WHERE id = auth.uid()
      AND (committee_slug IS NULL OR committee_slug = resolutions.committee_slug)
    )
  );

-- Secretariat/SG: full write access
CREATE POLICY "secretariat_manage_resolutions" ON public.resolutions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.eb_profiles
      WHERE id = auth.uid()
      AND role IN ('secretariat', 'sg', 'admin')
      AND (committee_slug IS NULL OR committee_slug = resolutions.committee_slug)
    )
  );

-- ── resolution_files ─────────────────────────────────────────────────────────

CREATE POLICY "public_read_resolution_files" ON public.resolution_files
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "secretariat_manage_files" ON public.resolution_files
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.eb_profiles
      WHERE id = auth.uid()
      AND role IN ('secretariat', 'sg', 'admin')
    )
  );

-- ── amendments ───────────────────────────────────────────────────────────────

-- Public: read all amendments (everyone can see them)
CREATE POLICY "public_read_amendments" ON public.amendments
  FOR SELECT TO anon, authenticated
  USING (is_deleted = false);

-- Public: insert amendments (password validated in server action, not RLS)
CREATE POLICY "public_propose_amendment" ON public.amendments
  FOR INSERT TO anon
  WITH CHECK (status = 'pending' AND is_deleted = false);

-- Chair: update status for their committee only
CREATE POLICY "chair_update_amendments" ON public.amendments
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.eb_profiles
      WHERE id = auth.uid()
      AND (committee_slug IS NULL OR committee_slug = amendments.committee_slug)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.eb_profiles
      WHERE id = auth.uid()
      AND (committee_slug IS NULL OR committee_slug = amendments.committee_slug)
    )
  );
```

---

## 4. Server Actions

### 4.1 `lib/actions/resolutions.ts`

```ts
// Upload a new resolution (creates resolutions row + resolution_files row)
export async function uploadResolution(data: {
  committeeSlug: string
  title: string
  topicIndex?: number
  resolutionCode?: string
  file: File
}): Promise<{ resolutionId: string }>

// Re-upload an updated version of an existing resolution
// Archives the current resolution_files row, inserts a new one
// Updates resolutions.current_file_path
export async function republishResolution(data: {
  resolutionId: string
  file: File
}): Promise<void>

// Archive a resolution entirely (removes from public view)
export async function archiveResolution(resolutionId: string): Promise<void>
```

### 4.2 `lib/actions/amendments.ts`

```ts
// Delegate submits an amendment (unauthenticated)
// Validates: committee password, accepting_amendments flag, resolution is published
export async function proposeAmendment(data: {
  resolutionId: string
  committeeSlug: string
  delegateName: string
  delegateCountry: string
  clauseReference: string
  proposedText: string
  committeePassword: string  // validated server-side, never stored
}): Promise<void>

// Chair updates amendment outcome after physical vote
export async function updateAmendmentStatus(
  amendmentId: string,
  status: 'passed' | 'failed' | 'withdrawn'
): Promise<void>
```

### 4.3 Password validation (inside `proposeAmendment`)

```ts
import { getCommitteePassword } from '@/lib/committee-password'

const expected = getCommitteePassword(data.committeeSlug)
const submitted = data.committeePassword.toLowerCase().replace(/\s+/g, '')
if (submitted !== expected) {
  throw new Error('Incorrect committee password.')
}
```

---

## 5. Page Structure

```
app/
├── committees/
│   └── [slug]/
│       └── page.tsx          ← PUBLIC: all published resolutions + amendments per resolution
│
├── portal/
│   ├── layout.tsx            ← auth guard (redirect to /portal/login if not authenticated)
│   └── eb/
│       ├── page.tsx          ← EB dashboard (existing — keep as-is)
│       ├── resolutions/
│       │   └── page.tsx      ← SECRETARIAT: upload panel + version history
│       └── amendments/
│           └── page.tsx      ← CHAIR: amendment review queue

components/
├── portal/
│   ├── ResolutionUploadForm.tsx    ← file input + committee select + title + submit
│   ├── ResolutionCard.tsx          ← shows title, download link, amendment count
│   ├── AmendmentSubmitForm.tsx     ← delegate form: name, country, clause ref, text, password
│   ├── AmendmentStatusList.tsx     ← public list of amendments with status badges
│   └── ChairAmendmentQueue.tsx     ← EB view: pending amendments with pass/fail/withdraw buttons

lib/
├── actions/
│   ├── resolutions.ts
│   └── amendments.ts
├── committee-password.ts
├── supabase-server.ts        ← existing
└── supabase-browser.ts       ← existing
```

---

## 6. Key Page Designs

### 6.1 `/committees/[slug]` (public)

Server component. Fetches all `published` resolutions for the committee with their amendments in one query:

```ts
const { data: resolutions } = await supabase
  .from('resolutions')
  .select(`
    id, title, resolution_code, current_file_path, published_at,
    amendments(id, delegate_name, delegate_country, clause_reference, proposed_text, status, created_at)
  `)
  .eq('committee_slug', slug)
  .eq('status', 'published')
  .eq('is_deleted', false)
  .order('published_at', { ascending: false })
```

Renders:
- Each resolution as a card with title, download button, resolution code
- Below each resolution: amendment list sorted passed → pending → failed/withdrawn
- "Submit Amendment" button linking to the amendment form for that resolution

### 6.2 `/committees/[slug]/amend` (public, password-gated server-side)

Client component (`AmendmentSubmitForm`). Fields:
1. Resolution selector (dropdown of published resolutions for this committee)
2. Delegate name
3. Delegate country
4. Clause reference (free text, e.g. "Operative Clause 3")
5. Proposed text (textarea)
6. Committee password (password input — hint shown: "Enter your committee access code")

On submit → calls `proposeAmendment` server action → password validated server-side.

### 6.3 `/portal/eb/resolutions` (Secretariat only)

Shows all resolutions for the Secretariat's committee (or all if SG). Two sections:
- **Upload new resolution**: form with committee select, title, optional resolution code, file input
- **Existing resolutions**: list with re-upload button (triggers `republishResolution`) and version history accordion

### 6.4 `/portal/eb/amendments` (Chair/SG)

Shows all amendments for the Chair's committee grouped by resolution. Each amendment card shows delegate info, clause reference, proposed text, and three action buttons: **Passed** / **Failed** / **Withdrawn** (disabled if already resolved).

---

## 7. File Upload Flow

```
Secretariat selects DOCX file in browser
  → client validates: MIME type + size ≤ 10MB
  → calls uploadResolution() server action
    → assertSecretariatAccess(committeeSlug)
    → upload file to Supabase Storage:
       path = resolutions/{slug}/{resolutionId}/v{n}_{filename}.docx
    → INSERT INTO resolutions (title, committee_slug, current_file_path, status='published')
    → INSERT INTO resolution_files (resolution_id, file_path, version_number=1, status='active')
    → revalidatePath('/committees/{slug}')
    → revalidatePath('/portal/eb/resolutions')

Re-upload (republishResolution):
  → upload new file to Storage (new path with incremented version)
  → UPDATE resolution_files SET status='archived' WHERE resolution_id=X AND status='active'
  → INSERT INTO resolution_files (new active row)
  → UPDATE resolutions SET current_file_path=new_path
  → revalidatePath(...)
```

---

## 8. Amendment Submission Flow

```
Delegate fills form → submits
  → proposeAmendment() server action
    → validate all fields non-empty
    → validate committee password (getCommitteePassword(slug) === submitted)
    → fetch conference_settings.accepting_amendments (no cache)
    → if false → throw 'Amendment window is currently closed'
    → fetch resolution → verify status='published'
    → INSERT INTO amendments (status='pending')
    → revalidatePath('/committees/{slug}')
```

---

## 9. Amendment Review Flow

```
Chair clicks "Passed" / "Failed" / "Withdrawn"
  → updateAmendmentStatus() server action
    → assertEBAccess(amendment.committee_slug)
    → UPDATE amendments SET status=X, reviewed_by=uid, reviewed_at=now()
    → revalidatePath('/portal/eb/amendments')
    → revalidatePath('/committees/{slug}')
```

---

## 10. Database Migration

The full migration adds the new tables on top of the existing schema. Key points:
- `resolutions` and `resolution_files` are new tables
- `amendments` table is rebuilt (replaces the old clause-based amendments table)
- `conference_settings` gets `accepting_amendments` column added
- Old `resolutions` table (the clause-based one) is renamed to `resolutions_legacy` before dropping, to preserve any existing data

---

## 11. Conflicts with Existing Code

The existing codebase has a different resolution model (clause-based `content_json`, `blocs`, `pending/floor/rejected` statuses). The new module replaces this entirely. Affected files:

| File | Action |
|------|--------|
| `lib/actions/resolutions.ts` | Replace with new file-based actions |
| `lib/actions/amendments.ts` | Replace with new simplified actions |
| `lib/actions/delegate.ts` | Delete (no longer needed) |
| `components/portal/EBReviewPanel.tsx` | Replace with `ChairAmendmentQueue.tsx` |
| `components/portal/AmendmentList.tsx` | Replace with `AmendmentStatusList.tsx` |
| `components/portal/ResolutionViewer.tsx` | Replace with `ResolutionCard.tsx` |
| `components/portal/SubmissionForm.tsx` | Delete |
| `app/portal/floor/` | Delete entire directory |
| `app/portal/[slug]/` | Delete (committee floor moves to `/committees/[slug]`) |
| `app/committees/[slug]/page.tsx` | Rewrite to show resolutions + amendments |
| `lib/db-migration.sql` | Rewrite for new schema |
