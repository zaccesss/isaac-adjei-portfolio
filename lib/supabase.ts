// I create the Supabase client here for server-only use - it never ships to the browser and falls back to placeholder strings at build time.
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL || "https://placeholder.supabase.co"
// I use the anon key here because this module only runs server-side and never gets shipped to the browser
const supabaseKey = process.env.SUPABASE_ANON_KEY || "placeholder"

export const supabase = createClient(supabaseUrl, supabaseKey)
