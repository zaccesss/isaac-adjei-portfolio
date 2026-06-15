import { createClient } from "@supabase/supabase-js"

// I only ever call this client from API routes and server utilities - it is never imported by client components
// I use placeholder strings so the module initialises without crashing at build time
// when env vars are absent locally. Real values live on Vercel only.
const supabaseUrl = process.env.SUPABASE_URL || "https://placeholder.supabase.co"
// I use the anon key here because this module only runs server-side and never gets shipped to the browser
const supabaseKey = process.env.SUPABASE_ANON_KEY || "placeholder"

export const supabase = createClient(supabaseUrl, supabaseKey)
