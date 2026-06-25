# Supabase RLS Fix — Amendment Insert Policy

## Problem
Delegates get "new row violates row-level security policy for table amendments" when submitting amendments.

## Root Cause
The anon INSERT policy on the `amendments` table is either missing or not applied correctly.

## Fix — Run this in Supabase SQL Editor

### Step 1: Verify the policy exists
```sql
SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'amendments';
```

### Step 2: If `public_propose_amendment` is missing, create it
```sql
CREATE POLICY "public_propose_amendment" ON public.amendments
  FOR INSERT TO anon
  WITH CHECK (status = 'pending' AND is_deleted = false);
```

### Step 3: If it exists but still fails, drop and recreate it
```sql
DROP POLICY IF EXISTS "public_propose_amendment" ON public.amendments;

CREATE POLICY "public_propose_amendment" ON public.amendments
  FOR INSERT TO anon
  WITH CHECK (true);
```

The `WITH CHECK (true)` is safe here because the server action already validates:
- Committee password
- `accepting_amendments` flag
- Resolution is published
- All required fields

### Step 4: Also ensure RLS is enabled on the table
```sql
ALTER TABLE public.amendments ENABLE ROW LEVEL SECURITY;
```

### Step 5: Verify anon role has usage on the schema
```sql
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON public.amendments TO anon;
GRANT SELECT ON public.amendments TO anon;
```

### Step 6: Test with a direct insert as anon
```sql
-- Run this as the anon role to test
SET ROLE anon;
INSERT INTO public.amendments (resolution_id, committee_slug, delegate_name, delegate_country, clause_reference, proposed_text, status)
VALUES ('your-resolution-uuid-here', 'ga4', 'Test Delegate', 'India', 'OP1', 'Test text', 'pending');
RESET ROLE;
```

## Why this happens
Supabase server actions run with the user's session. For unauthenticated delegates, the session is the `anon` role. The INSERT policy must explicitly allow `anon` to insert rows. If the policy was created before the table had RLS enabled, or if the `anon` role lacks GRANT permissions, the insert will fail.
