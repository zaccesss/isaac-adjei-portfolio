// I create the Supabase client here for server-only use - it never ships to the browser and falls back to placeholder strings at build time.
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL || "https://placeholder.supabase.co"
// This module only runs server-side (server components and server actions) and never ships to the
// browser, so I prefer the service-role key when it is set. The service-role key bypasses RLS, which
// is what lets the database's "allow all" anon policies be dropped later to lock the anon key out of
// every table without breaking a single server read or write. I fall back to the anon key when
// SUPABASE_SERVICE_ROLE_KEY is not yet configured, so this is a no-op until that key is added to the
// deployment.
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "placeholder"

export const supabase = createClient(supabaseUrl, supabaseKey)
