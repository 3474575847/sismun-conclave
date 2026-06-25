-- ============================================================
-- SISMUN Performance Optimization Script
-- Run this in the Supabase SQL Editor to fix slow loading
-- ============================================================

-- 1. Create SECURITY DEFINER functions to avoid RLS recursion
-- These functions run with the privileges of the creator (postgres)
-- allowing them to bypass RLS when checking roles.

CREATE OR REPLACE FUNCTION public.is_sg()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.eb_profiles
        WHERE id = auth.uid() AND role = 'sg'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_my_committee()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT committee_slug FROM public.eb_profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Add Indexes for faster querying
CREATE INDEX IF NOT EXISTS idx_resolutions_committee_status 
ON public.resolutions (committee_slug, status, is_deleted);

CREATE INDEX IF NOT EXISTS idx_amendments_resolution_id 
ON public.amendments (resolution_id);

CREATE INDEX IF NOT EXISTS idx_blocs_committee_topic 
ON public.blocs (committee_slug, topic_index);

-- 3. Update Resolutions RLS Policies to use optimized functions
DROP POLICY IF EXISTS "eb_read_committee_resolutions" ON public.resolutions;
CREATE POLICY "eb_read_committee_resolutions" ON public.resolutions
    FOR SELECT TO authenticated
    USING (
        is_deleted = false AND
        (public.is_sg() OR public.get_my_committee() = resolutions.committee_slug)
    );

DROP POLICY IF EXISTS "eb_manage_committee_resolutions" ON public.resolutions;
CREATE POLICY "eb_manage_committee_resolutions" ON public.resolutions
    FOR ALL TO authenticated
    USING (
        public.is_sg() OR public.get_my_committee() = resolutions.committee_slug
    );

-- 4. Update Amendments RLS Policies
DROP POLICY IF EXISTS "eb_manage_amendments" ON public.amendments;
CREATE POLICY "eb_manage_amendments" ON public.amendments
    FOR ALL TO authenticated
    USING (
        public.is_sg() OR public.get_my_committee() = amendments.committee_slug
    );

-- 5. Update Blocs RLS Policies
DROP POLICY IF EXISTS "eb_manage_own_committee_blocs" ON public.blocs;
CREATE POLICY "eb_manage_own_committee_blocs" ON public.blocs
    FOR ALL TO authenticated
    USING (
        public.is_sg() OR public.get_my_committee() = blocs.committee_slug
    );

-- ============================================================
-- Optimization Complete
-- ============================================================
