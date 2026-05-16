-- ============================================================
-- SISMUN MUN Digital Resolution & Amendment Ledger
-- Database Migration — Run this in the Supabase SQL Editor
-- ============================================================

-- --------------------------------------------------------
-- 1. EB Profiles (extends Supabase auth.users)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.eb_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    committee_slug TEXT,  -- NULL = Secretary General (sees all committees)
    role TEXT NOT NULL DEFAULT 'chair' CHECK (role IN ('chair', 'sg')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- --------------------------------------------------------
-- 2. Conference Settings (singleton row — id always = 1)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conference_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    accepting_submissions BOOLEAN DEFAULT true,
    accepting_amendments BOOLEAN DEFAULT true,
    debate_mode BOOLEAN DEFAULT false,
    conference_name TEXT DEFAULT 'SISMUN Conclave 2026',
    conference_date DATE
);

-- Seed the singleton row
INSERT INTO public.conference_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------------
-- 3. Blocs
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blocs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    committee_slug TEXT NOT NULL,
    topic_index INT NOT NULL CHECK (topic_index IN (0, 1)),
    bloc_name TEXT NOT NULL,
    member_countries TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- --------------------------------------------------------
-- 4. Resolutions
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.resolutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bloc_id UUID REFERENCES public.blocs(id) ON DELETE CASCADE,
    committee_slug TEXT NOT NULL,
    topic_index INT NOT NULL,
    -- Status values aligned with the Delegate Submission model:
    --   'pending'  — submitted by delegate, awaiting EB review
    --   'floor'    — approved by EB, visible on the committee floor
    --   'rejected' — rejected by EB (is_deleted also set to true)
    -- Legacy values 'drafting' and 'submitted' from the old EB-drafting flow are removed.
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'floor', 'rejected')),
    -- content_json shape:
    -- {
    --   "preamble": [{ "position": 1.0, "text": "Noting with concern...", "type": "preamble" }],
    --   "operative": [{ "position": 1.0, "text": "Calls upon all...", "type": "operative" }]
    -- }
    -- position is FLOAT for fractional indexing (drag-and-drop reorder)
    content_json JSONB NOT NULL DEFAULT '{"preamble": [], "operative": []}',
    snapshot_json JSONB,  -- frozen copy of content_json at submission time
    submitted_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    is_deleted BOOLEAN DEFAULT false,
    -- Delegate submitter details (inserted by /portal/[slug]/submit)
    submitted_by_name TEXT,
    submitted_by_country TEXT,
    -- Optional note recorded when an EB member rejects a resolution
    rejection_note TEXT
);

-- GIN index for fast JSONB clause searches
CREATE INDEX IF NOT EXISTS idx_resolutions_content
    ON public.resolutions USING gin(content_json);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER resolutions_updated_at
    BEFORE UPDATE ON public.resolutions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- --------------------------------------------------------
-- 5. Amendments
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.amendments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resolution_id UUID REFERENCES public.resolutions(id) ON DELETE CASCADE,
    clause_section TEXT NOT NULL CHECK (clause_section IN ('preamble', 'operative')),
    clause_position FLOAT NOT NULL,   -- position of the target clause
    target_position FLOAT,            -- for 'add': where to insert new clause
    proposer_name TEXT NOT NULL,
    proposer_country TEXT NOT NULL,
    committee_slug TEXT NOT NULL,     -- must match resolution's committee_slug
    type TEXT NOT NULL CHECK (type IN ('add', 'strike', 'modify')),
    suggested_text TEXT,              -- null for 'strike'
    vote_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (vote_status IN ('pending', 'passed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT false
);

-- --------------------------------------------------------
-- 6. Amendment Log (audit trail / version history)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.amendment_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amendment_id UUID REFERENCES public.amendments(id),
    resolution_id UUID REFERENCES public.resolutions(id),
    action TEXT NOT NULL CHECK (action IN ('approved', 'rejected')),
    eb_profile_id UUID REFERENCES public.eb_profiles(id),
    clause_before TEXT,
    clause_after TEXT,
    full_snapshot_json JSONB,  -- complete resolution content after this amendment
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.eb_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conference_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amendments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amendment_log ENABLE ROW LEVEL SECURITY;

-- --- eb_profiles ---
CREATE POLICY "eb_read_own_profile" ON public.eb_profiles
    FOR SELECT TO authenticated
    USING (id = auth.uid());

CREATE POLICY "sg_read_all_profiles" ON public.eb_profiles
    FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.eb_profiles WHERE id = auth.uid() AND role = 'sg')
    );

-- Only SG can insert/update profiles
CREATE POLICY "sg_manage_profiles" ON public.eb_profiles
    FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.eb_profiles WHERE id = auth.uid() AND role = 'sg')
    );

-- --- conference_settings ---
CREATE POLICY "public_read_settings" ON public.conference_settings
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "sg_manage_settings" ON public.conference_settings
    FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.eb_profiles WHERE id = auth.uid() AND role = 'sg')
    );

-- --- blocs ---
CREATE POLICY "public_read_blocs" ON public.blocs
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "eb_manage_own_committee_blocs" ON public.blocs
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.eb_profiles
            WHERE id = auth.uid()
            AND (committee_slug IS NULL OR committee_slug = blocs.committee_slug)
        )
    );

-- --- resolutions ---
-- Anon: only see floor resolutions that aren't soft-deleted
-- 'pending' and 'rejected' resolutions are never visible to unauthenticated users (Req 5.4)
CREATE POLICY "public_read_floor" ON public.resolutions
    FOR SELECT TO anon
    USING (status IN ('floor') AND is_deleted = false);

-- EB: see resolutions within their committee (or all if SG)
CREATE POLICY "eb_read_committee_resolutions" ON public.resolutions
    FOR SELECT TO authenticated
    USING (
        is_deleted = false AND
        EXISTS (
            SELECT 1 FROM public.eb_profiles
            WHERE id = auth.uid()
            AND (committee_slug IS NULL OR committee_slug = resolutions.committee_slug)
        )
    );

CREATE POLICY "eb_manage_committee_resolutions" ON public.resolutions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.eb_profiles
            WHERE id = auth.uid()
            AND (committee_slug IS NULL OR committee_slug = resolutions.committee_slug)
        )
    );

-- --- amendments ---
-- Anon: read non-deleted amendments on floor resolutions only (Req 3.1, 3.2)
CREATE POLICY "public_read_amendments" ON public.amendments
    FOR SELECT TO anon
    USING (
        is_deleted = false AND
        EXISTS (
            SELECT 1 FROM public.resolutions r
            WHERE r.id = amendments.resolution_id
            AND r.status = 'floor'
            AND r.is_deleted = false
        )
    );

-- Anon: propose amendments (INSERT only, vote_status must be 'pending')
CREATE POLICY "public_propose_amendment" ON public.amendments
    FOR INSERT TO anon
    WITH CHECK (vote_status = 'pending' AND is_deleted = false);

-- EB: full control within their committee
CREATE POLICY "eb_manage_amendments" ON public.amendments
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.eb_profiles
            WHERE id = auth.uid()
            AND (committee_slug IS NULL OR committee_slug = amendments.committee_slug)
        )
    );

-- --- amendment_log ---
CREATE POLICY "public_read_log" ON public.amendment_log
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "eb_write_log" ON public.amendment_log
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.eb_profiles WHERE id = auth.uid())
    );

-- ============================================================
-- DONE
-- Run this entire file in the Supabase SQL Editor.
-- Then create your first EB account in Supabase Dashboard > Auth > Users
-- and insert a row into eb_profiles:
-- INSERT INTO eb_profiles (id, name, committee_slug, role)
-- VALUES ('<auth-user-uuid>', 'Secretary General', NULL, 'sg');
-- ============================================================
