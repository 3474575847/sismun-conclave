import { createClient } from '@supabase/supabase-js'

/**
 * Admin client using the service role key.
 * Bypasses RLS — only use server-side after performing your own authorization checks.
 * Never expose this client or the service role key to the browser.
 */
export function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}
