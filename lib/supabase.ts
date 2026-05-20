import { createClient } from "@supabase/supabase-js"

// I use placeholder strings so the module initialises without crashing at build time
// when env vars are absent locally. Real values live on Vercel only.
const supabaseUrl = process.env.SUPABASE_URL ?? "https://placeholder.supabase.co"
const supabaseKey = process.env.SUPABASE_ANON_KEY ?? "placeholder"

export const supabase = createClient(supabaseUrl, supabaseKey)
