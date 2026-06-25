/**
 * One-time setup script to create the SG (Secretary General) EB account.
 * Run with: node scripts/create-admin.mjs
 *
 * This uses the Supabase Admin REST API with the service_role key.
 * Get your service_role key from: Supabase Dashboard → Project Settings → API → service_role
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fzvnhcufauggzjhcjyjj.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ─── Credentials you want to create ────────────────────────────────────────
const ADMIN_EMAIL = 'sg@sismun.org';
const ADMIN_PASSWORD = 'SISMUN2026!';
const ADMIN_NAME = 'Secretary General';
// ────────────────────────────────────────────────────────────────────────────

if (!SERVICE_ROLE_KEY) {
  console.error('\n❌  Missing SUPABASE_SERVICE_ROLE_KEY environment variable.');
  console.error('   Get it from: Supabase Dashboard → Project Settings → API → service_role secret');
  console.error('   Then run:  SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/create-admin.mjs\n');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log('\n🔧  SISMUN EB Admin Setup\n');

  // 1. Create auth user
  console.log(`Creating auth user: ${ADMIN_EMAIL} ...`);
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true, // skip email confirmation
  });

  if (userError) {
    if (userError.message.includes('already registered')) {
      console.log('⚠️  User already exists in auth, fetching their UUID...');
      // Try to list users and find by email
      const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) throw listError;
      const existing = listData.users.find(u => u.email === ADMIN_EMAIL);
      if (!existing) throw new Error('Could not find existing user');
      await insertProfile(existing.id);
      return;
    }
    throw userError;
  }

  console.log(`✅  Auth user created: ${userData.user.id}`);
  await insertProfile(userData.user.id);
}

async function insertProfile(userId) {
  console.log(`Inserting into eb_profiles (role=sg) ...`);
  const { error: profileError } = await supabase
    .from('eb_profiles')
    .upsert({
      id: userId,
      name: ADMIN_NAME,
      committee_slug: null, // null = SG, sees all committees
      role: 'sg',
    });

  if (profileError) throw profileError;

  console.log('\n✅  EB Admin account created successfully!\n');
  console.log('──────────────────────────────────────────');
  console.log(`  URL:      http://localhost:3000/portal/login`);
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log('──────────────────────────────────────────\n');
}

main().catch(err => {
  console.error('\n❌  Error:', err.message);
  process.exit(1);
});
