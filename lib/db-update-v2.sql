-- ============================================================
-- SISMUN Workflow Update V2
-- Run this in the Supabase SQL Editor to support new features
-- ============================================================

-- 1. Update Resolution statuses and add Sponsor/Signatory fields
ALTER TABLE public.resolutions 
    ADD COLUMN IF NOT EXISTS sponsors TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS signatories TEXT[] NOT NULL DEFAULT '{}';

-- Drop old constraint and add new one including 'archived'
ALTER TABLE public.resolutions DROP CONSTRAINT IF EXISTS resolutions_status_check;
ALTER TABLE public.resolutions ADD CONSTRAINT resolutions_status_check 
    CHECK (status IN ('pending', 'floor', 'rejected', 'archived', 'drafting'));

-- 2. Update Amendments with Review Lifecycle
ALTER TABLE public.amendments 
    ADD COLUMN IF NOT EXISTS review_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (review_status IN ('pending', 'accepted_for_voting', 'rejected', 'withdrawn'));

-- Update vote_status constraint if needed (already exists in v1 but let's be sure)
ALTER TABLE public.amendments DROP CONSTRAINT IF EXISTS amendments_vote_status_check;
ALTER TABLE public.amendments ADD CONSTRAINT amendments_vote_status_check 
    CHECK (vote_status IN ('pending', 'passed', 'failed'));

-- 3. Update RLS policies to allow public viewing of archived resolutions
DROP POLICY IF EXISTS "public_read_floor" ON public.resolutions;
CREATE POLICY "public_read_floor_and_archive" ON public.resolutions
    FOR SELECT TO anon
    USING (status IN ('floor', 'archived') AND is_deleted = false);

-- Update public amendment reading to include accepted_for_voting review status
DROP POLICY IF EXISTS "public_read_amendments" ON public.amendments;
CREATE POLICY "public_read_active_amendments" ON public.amendments
    FOR SELECT TO anon
    USING (
        is_deleted = false AND
        EXISTS (
            SELECT 1 FROM public.resolutions r
            WHERE r.id = amendments.resolution_id
            AND r.status IN ('floor', 'archived')
            AND r.is_deleted = false
        )
    );

-- 4. Update Amendment Log actions
ALTER TABLE public.amendment_log DROP CONSTRAINT IF EXISTS amendment_log_action_check;
ALTER TABLE public.amendment_log ADD CONSTRAINT amendment_log_action_check 
    CHECK (action IN ('approved', 'rejected', 'passed', 'failed', 'withdrawn', 'accepted_for_voting'));
