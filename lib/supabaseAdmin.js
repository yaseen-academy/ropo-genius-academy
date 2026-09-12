import { createClient } from "@supabase/supabase-js";

// IMPORTANT: only import this file from server-side code (API routes / route handlers).
// The service role key must never reach the browser bundle.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
