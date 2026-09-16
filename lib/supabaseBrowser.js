import { createClient } from "@supabase/supabase-js";

// Anon-key client for the browser. Only used for uploading video files directly
// to Supabase Storage (bypassing Vercel's request body size limit) — never for
// reading/writing database tables, which stay behind the trainer's session on
// the server via supabaseAdmin.
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const VIDEO_BUCKET = "lesson-videos";
