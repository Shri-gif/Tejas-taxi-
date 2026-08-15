// Tejas Taxi Supabase configuration
// Publishable key is safe for browser use when RLS policies are configured correctly.
const SUPABASE_URL = "https://yqjvtdzhpjirjiefdfqd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_jHTyROZzm-nRazUuXolIpw_0Q3yjp9p";

window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);