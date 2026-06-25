-- ============================================================
-- SISMUN Resolution Ledger — Workflow Update
-- ============================================================

-- 1. Update Resolutions Status and add Sponsors/Signatories
ALTER TABLE public.resolutions 
ADD COLUMN IF NOT EXISTS sponsors TEXT[] NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS signatories TEXT[] NOT NULL DEFAULT '{}';

-- Update status check to include 'archived'
ALTER TABLE public.resolutions DROP CONSTRAINT IF EXISTS resolutions_status_check;
ALTER TABLE public.resolutions ADD CONSTRAINT resolutions_status_check 
CHECK (status IN ('pending', 'floor', 'rejected', 'archived'));

-- 2. Update Amendments with Review Status
-- Add review_status column
ALTER TABLE public.amendments 
ADD COLUMN IF NOT EXISTS review_status TEXT NOT NULL DEFAULT 'pending'
CHECK (review_status IN ('pending', 'accepted_for_voting', 'rejected', 'withdrawn'));

-- Update vote_status check to be consistent
ALTER TABLE public.amendments DROP CONSTRAINT IF EXISTS amendments_vote_status_check;
ALTER TABLE public.amendments ADD CONSTRAINT amendments_vote_status_check 
CHECK (vote_status IN ('pending', 'passed', 'failed'));

-- 3. Update Amendment Log Action check
ALTER TABLE public.amendment_log DROP CONSTRAINT IF EXISTS amendment_log_action_check;
ALTER TABLE public.amendment_log ADD CONSTRAINT amendment_log_action_check 
CHECK (action IN ('approved', 'rejected', 'accepted_for_voting', 'passed', 'failed', 'withdrawn'));

-- 4. RLS Update for new statuses
-- Ensure anon can see archived resolutions too
DROP POLICY IF EXISTS "public_read_floor" ON public.resolutions;
CREATE POLICY "public_read_floor_and_archived" ON public.resolutions
    FOR SELECT TO anon
    USING (status IN ('floor', 'archived') AND is_deleted = false);
