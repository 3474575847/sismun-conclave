# Supabase Setup Instructions
# Run these via the Supabase MCP or SQL Editor

## STEP 1: Rename old resolutions table (preserves existing data)

```sql
ALTER TABLE IF EXISTS public.resolutions RENAME TO resolutions_legacy;
ALTER TABLE IF EXISTS public.amendments RENAME TO amendments_legacy;
```

## STEP 2: Create new tables

```sql
-- ─────────────────────────────────────────────────────────────────────────────
-- resolutions: one row per named resolution document
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.resolutions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_slug    TEXT NOT NULL,
  title             TEXT NOT NULL,
  topic_index       INT,
  resolution_code   TEXT,
  status            TEXT NOT NULL DEFAULT 'published'
                    CHECK (status IN ('published', 'archived')),
  current_file_path TEXT,
  uploaded_by       UUID REFERENCES public.eb_profiles(id),
  published_at      TIMESTAMPTZ DEFAULT now(),
  archived_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now(),
  is_deleted        BOOLEAN DEFAULT false
);

-- ─────────────────────────────────────────────────────────────────────────────
-- resolution_files: one row per upload event (version history)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.resolution_files (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resolution_id  UUID NOT NULL REFERENCES public.resolutions(id) ON DELETE CASCADE,
  committee_slug TEXT NOT NULL,
  file_path      TEXT NOT NULL,
  file_name      TEXT NOT NULL,
  version_number INT NOT NULL DEFAULT 1,
  status         TEXT NOT NULL DEFAULT 'active'
                 CHECK (status IN ('active', 'archived')),
  uploaded_by    UUID REFERENCES public.eb_profiles(id),
  uploaded_at    TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- amendments: delegate-submitted proposed changes
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.amendments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resolution_id    UUID NOT NULL REFERENCES public.resolutions(id) ON DELETE CASCADE,
  committee_slug   TEXT NOT NULL,
  delegate_name    TEXT NOT NULL,
  delegate_country TEXT NOT NULL,
  clause_reference TEXT NOT NULL,
  proposed_text    TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'passed', 'failed', 'withdrawn')),
  reviewed_by      UUID REFERENCES public.eb_profiles(id),
  reviewed_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT now(),
  is_deleted       BOOLEAN DEFAULT false
);
```

## STEP 3: Add accepting_amendments to conference_settings

```sql
ALTER TABLE public.conference_settings
  ADD COLUMN IF NOT EXISTS accepting_amendments BOOLEAN DEFAULT false;
```

## STEP 4: Create indexes

```sql
CREATE INDEX idx_resolutions_committee_status
  ON public.resolutions(committee_slug, status)
  WHERE is_deleted = false;

CREATE INDEX idx_resolution_files_resolution
  ON public.resolution_files(resolution_id, status);

CREATE INDEX idx_amendments_resolution
  ON public.amendments(resolution_id, status)
  WHERE is_deleted = false;

CREATE INDEX idx_amendments_committee
  ON public.amendments(committee_slug, status)
  WHERE is_deleted = false;
```

## STEP 5: Enable RLS

```sql
ALTER TABLE public.resolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resolution_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amendments ENABLE ROW LEVEL SECURITY;
```

## STEP 6: RLS Policies — resolutions

```sql
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

-- Secretariat/SG/Admin: full write access for their committee
CREATE POLICY "secretariat_manage_resolutions" ON public.resolutions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.eb_profiles
      WHERE id = auth.uid()
      AND role IN ('secretariat', 'sg', 'admin')
      AND (committee_slug IS NULL OR committee_slug = resolutions.committee_slug)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.eb_profiles
      WHERE id = auth.uid()
      AND role IN ('secretariat', 'sg', 'admin')
      AND (committee_slug IS NULL OR committee_slug = resolutions.committee_slug)
    )
  );
```

## STEP 7: RLS Policies — resolution_files

```sql
-- Public: read all resolution files
CREATE POLICY "public_read_resolution_files" ON public.resolution_files
  FOR SELECT TO anon, authenticated USING (true);

-- Secretariat/SG/Admin: full write access
CREATE POLICY "secretariat_manage_files" ON public.resolution_files
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.eb_profiles
      WHERE id = auth.uid()
      AND role IN ('secretariat', 'sg', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.eb_profiles
      WHERE id = auth.uid()
      AND role IN ('secretariat', 'sg', 'admin')
    )
  );
```

## STEP 8: RLS Policies — amendments

```sql
-- Public: read all amendments (everyone can see them)
CREATE POLICY "public_read_amendments" ON public.amendments
  FOR SELECT TO anon, authenticated
  USING (is_deleted = false);

-- Public (anon): insert amendments — password validated in server action
CREATE POLICY "public_propose_amendment" ON public.amendments
  FOR INSERT TO anon
  WITH CHECK (status = 'pending' AND is_deleted = false);

-- Chair/SG: update amendment status for their committee
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

## STEP 9: Create Storage bucket

Run this via the Supabase MCP or Dashboard > Storage:

```sql
-- Via SQL (Supabase storage schema):
INSERT INTO storage.buckets (id, name, public)
VALUES ('resolutions', 'resolutions', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public downloads
CREATE POLICY "public_download_resolutions" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'resolutions');

-- Allow authenticated secretariat/sg/admin to upload
CREATE POLICY "secretariat_upload_resolutions" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'resolutions' AND
    EXISTS (
      SELECT 1 FROM public.eb_profiles
      WHERE id = auth.uid()
      AND role IN ('secretariat', 'sg', 'admin')
    )
  );

-- Allow authenticated secretariat/sg/admin to update/delete
CREATE POLICY "secretariat_manage_storage" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'resolutions' AND
    EXISTS (
      SELECT 1 FROM public.eb_profiles
      WHERE id = auth.uid()
      AND role IN ('secretariat', 'sg', 'admin')
    )
  );
```

## STEP 10: Update eb_profiles role check (if needed)

If your existing `eb_profiles` table only has `role IN ('chair', 'sg')`, add the new roles:

```sql
-- Drop old constraint and add new one with secretariat + admin
ALTER TABLE public.eb_profiles
  DROP CONSTRAINT IF EXISTS eb_profiles_role_check;

ALTER TABLE public.eb_profiles
  ADD CONSTRAINT eb_profiles_role_check
  CHECK (role IN ('chair', 'sg', 'secretariat', 'admin'));
```

## STEP 11: Seed conference_settings if not already seeded

```sql
INSERT INTO public.conference_settings (id, accepting_amendments)
VALUES (1, false)
ON CONFLICT (id) DO UPDATE SET
  accepting_amendments = EXCLUDED.accepting_amendments;
```

---

## Summary of what this does

| Action | Effect |
|--------|--------|
| Rename old tables | Preserves existing data as `resolutions_legacy` and `amendments_legacy` |
| New `resolutions` table | One row per named resolution document per committee |
| New `resolution_files` table | Version history — one row per upload event |
| New `amendments` table | Simplified: name, country, clause ref, proposed text, status |
| `accepting_amendments` column | SG toggle to open/close amendment window |
| Storage bucket `resolutions` | Public read, secretariat-only write |
| RLS policies | Anon can read + insert amendments; only EB can write resolutions |
