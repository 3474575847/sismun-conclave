-- ============================================================
-- SISMUN Resolution & Amendment Module — Database Migration v2
-- Run this in the Supabase SQL Editor (or via MCP)
-- See SUPABASE_SETUP.md for step-by-step instructions
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- STEP 1: Preserve old data by renaming legacy tables
-- ─────────────────────────────────────────────────────────────
ALTER TABLE IF EXISTS public.resolutions RENAME TO resolutions_legacy;
ALTER TABLE IF EXISTS public.amendments  RENAME TO amendments_legacy;

-- ─────────────────────────────────────────────────────────────
-- STEP 2: New resolutions table
-- One row per named resolution document per committee.
-- A committee may have multiple published resolutions.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.resolutions (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_slug    TEXT        NOT NULL,
  title             TEXT        NOT NULL,
  topic_index       INT,
  resolution_code   TEXT,
  status            TEXT        NOT NULL DEFAULT 'published'
                                CHECK (status IN ('published', 'archived')),
  current_file_path TEXT,
  uploaded_by       UUID        REFERENCES public.eb_profiles(id),
  published_at      TIMESTAMPTZ DEFAULT now(),
  archived_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now(),
  is_deleted        BOOLEAN     DEFAULT false
);

-- ─────────────────────────────────────────────────────────────
-- STEP 3: resolution_files table
-- One row per upload event — tracks version history.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.resolution_files (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  resolution_id  UUID        NOT NULL REFERENCES public.resolutions(id) ON DELETE CASCADE,
  committee_slug TEXT        NOT NULL,
  file_path      TEXT        NOT NULL,
  file_name      TEXT        NOT NULL,
  version_number INT         NOT NULL DEFAULT 1,
  status         TEXT        NOT NULL DEFAULT 'active'
                             CHECK (status IN ('active', 'archived')),
  uploaded_by    UUID        REFERENCES public.eb_profiles(id),
  uploaded_at    TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- STEP 4: New amendments table
-- Simplified: delegate info + clause ref + proposed text + status.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.amendments (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  resolution_id    UUID        NOT NULL REFERENCES public.resolutions(id) ON DELETE CASCADE,
  committee_slug   TEXT        NOT NULL,
  delegate_name    TEXT        NOT NULL,
  delegate_country TEXT        NOT NULL,
  clause_reference TEXT        NOT NULL,
  proposed_text    TEXT        NOT NULL,
  status           TEXT        NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending', 'passed', 'failed', 'withdrawn')),
  reviewed_by      UUID        REFERENCES public.eb_profiles(id),
  reviewed_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT now(),
  is_deleted       BOOLEAN     DEFAULT false
);

-- ─────────────────────────────────────────────────────────────
-- STEP 5: Add accepting_amendments to conference_settings
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.conference_settings
  ADD COLUMN IF NOT EXISTS accepting_amendments BOOLEAN DEFAULT false;

-- ─────────────────────────────────────────────────────────────
-- STEP 6: Update eb_profiles role constraint
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.eb_profiles
  DROP CONSTRAINT IF EXISTS eb_profiles_role_check;

ALTER TABLE public.eb_profiles
  ADD CONSTRAINT eb_profiles_role_check
  CHECK (role IN ('chair', 'sg', 'secretariat', 'admin'));

-- ─────────────────────────────────────────────────────────────
-- STEP 7: Indexes
-- ─────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────
-- STEP 8: Enable RLS
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.resolutions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resolution_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amendments       ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────
-- STEP 9: RLS — resolutions
-- ─────────────────────────────────────────────────────────────

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

-- Secretariat/SG/Admin: full write access
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

-- ─────────────────────────────────────────────────────────────
-- STEP 10: RLS — resolution_files
-- ─────────────────────────────────────────────────────────────

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
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.eb_profiles
      WHERE id = auth.uid()
      AND role IN ('secretariat', 'sg', 'admin')
    )
  );

-- ─────────────────────────────────────────────────────────────
-- STEP 11: RLS — amendments
-- ─────────────────────────────────────────────────────────────

-- Public: read all amendments
CREATE POLICY "public_read_amendments" ON public.amendments
  FOR SELECT TO anon, authenticated
  USING (is_deleted = false);

-- Anon: insert amendments (password validated in server action)
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

-- ─────────────────────────────────────────────────────────────
-- STEP 12: Storage bucket (run via Supabase MCP or Dashboard)
-- ─────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('resolutions', 'resolutions', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public_download_resolutions" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'resolutions');

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

-- ─────────────────────────────────────────────────────────────
-- STEP 13: Seed conference_settings
-- ─────────────────────────────────────────────────────────────
INSERT INTO public.conference_settings (id, accepting_amendments)
VALUES (1, false)
ON CONFLICT (id) DO UPDATE SET
  accepting_amendments = EXCLUDED.accepting_amendments;

-- ============================================================
-- DONE. Verify with:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- ============================================================
