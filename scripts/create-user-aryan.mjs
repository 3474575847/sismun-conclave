import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fzvnhcufauggzjhcjyjj.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ADMIN_EMAIL = 'jindalaryan99@gmail.com';
const ADMIN_PASSWORD = 'password123';
const ADMIN_NAME = 'Aryan Jindal';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  console.log(`Creating user: ${ADMIN_EMAIL}...`);
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
  });

  const userId = userError?.message?.includes('already registered') 
    ? (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === ADMIN_EMAIL).id
    : userData.user.id;

  console.log(`User ID: ${userId}`);

  const { error: profileError } = await supabase
    .from('eb_profiles')
    .upsert({
      id: userId,
      name: ADMIN_NAME,
      role: 'sg',
    });

  if (profileError) throw profileError;
  console.log('✅ Success!');
}

main();
