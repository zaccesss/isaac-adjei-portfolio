// I integrate Strava so my health analytics page can chart my runs and rides. The flow is the standard
// OAuth code grant: /api/strava/auth sends me to Strava, /api/strava/callback exchanges the code for
// tokens, and the tokens live in the service-role `config` table (never in the repo, never exposed to the
// client). syncStravaActivities pulls my recent activities into strava_activities, refreshing the access
// token first if it is close to expiry. Everything guards on STRAVA_CLIENT_ID/SECRET so a missing key
// degrades to a clean "not configured" state instead of throwing.
import { supabase } from "@/lib/supabase"

const TOKEN_KEY = "strava_tokens"
const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET

export function stravaConfigured(): boolean {
  return Boolean(STRAVA_CLIENT_ID && STRAVA_CLIENT_SECRET)
}

type StravaTokens = {
  access_token: string
  refresh_token: string
  expires_at: number // unix seconds
  athlete_id?: number
}

type StravaTokenResponse = {
  access_token: string
  refresh_token: string
  expires_at: number
  athlete?: { id: number }
}

type StravaApiActivity = {
  id: number
  name?: string
  type?: string
  sport_type?: string
  distance?: number
  moving_time?: number
  elapsed_time?: number
  total_elevation_gain?: number
  average_speed?: number
  max_speed?: number
  average_heartrate?: number
  max_heartrate?: number
  start_date?: string
}

async function readTokens(): Promise<StravaTokens | null> {
  const { data } = await supabase.from("config").select("value").eq("key", TOKEN_KEY).single()
  return (data?.value as StravaTokens) ?? null
}

async function writeTokens(tokens: StravaTokens): Promise<void> {
  await supabase
    .from("config")
    .upsert({ key: TOKEN_KEY, value: tokens, updated_at: new Date().toISOString() }, { onConflict: "key" })
}

export async function stravaConnected(): Promise<boolean> {
  if (!stravaConfigured()) return false
  return (await readTokens()) !== null
}

export async function disconnectStrava(): Promise<void> {
  await supabase.from("config").delete().eq("key", TOKEN_KEY)
}

// Exchange the one-time OAuth code for tokens after I authorise on Strava.
export async function exchangeStravaCode(code: string): Promise<boolean> {
  if (!stravaConfigured()) return false
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  })
  if (!res.ok) return false
  const data = (await res.json()) as StravaTokenResponse
  await writeTokens({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
    athlete_id: data.athlete?.id,
  })
  return true
}

// Return a valid access token, refreshing it first if it expires within five minutes.
async function getAccessToken(): Promise<string | null> {
  if (!stravaConfigured()) return null
  const tokens = await readTokens()
  if (!tokens) return null
  if (tokens.expires_at - 300 > Math.floor(Date.now() / 1000)) return tokens.access_token
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: tokens.refresh_token,
    }),
  })
  if (!res.ok) return null
  const data = (await res.json()) as StravaTokenResponse
  await writeTokens({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
    athlete_id: tokens.athlete_id,
  })
  return data.access_token
}

// Pull my recent activities into strava_activities, upserting by strava_id so re-syncs never duplicate.
// Returns how many activities were written, or -1 if Strava could not be reached.
export async function syncStravaActivities(pages = 3): Promise<number> {
  const token = await getAccessToken()
  if (!token) return -1
  let synced = 0
  for (let page = 1; page <= pages; page++) {
    const res = await fetch(`https://www.strava.com/api/v3/athlete/activities?per_page=100&page=${page}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) break
    const activities = (await res.json()) as StravaApiActivity[]
    if (!Array.isArray(activities) || activities.length === 0) break
    const rows = activities.map((a) => ({
      strava_id: a.id,
      name: a.name ?? null,
      sport_type: a.sport_type ?? a.type ?? null,
      distance_m: a.distance ?? null,
      moving_time_s: a.moving_time ?? null,
      elapsed_time_s: a.elapsed_time ?? null,
      total_elevation_gain_m: a.total_elevation_gain ?? null,
      average_speed_ms: a.average_speed ?? null,
      max_speed_ms: a.max_speed ?? null,
      average_heartrate: a.average_heartrate ?? null,
      max_heartrate: a.max_heartrate ?? null,
      start_date: a.start_date ?? null,
    }))
    await supabase.from("strava_activities").upsert(rows, { onConflict: "strava_id" })
    synced += rows.length
    if (activities.length < 100) break
  }
  return synced
}

export type StravaActivity = {
  id: string
  strava_id: number
  name: string | null
  sport_type: string | null
  distance_m: number | null
  moving_time_s: number | null
  elapsed_time_s: number | null
  total_elevation_gain_m: number | null
  average_speed_ms: number | null
  max_speed_ms: number | null
  average_heartrate: number | null
  max_heartrate: number | null
  calories: number | null
  start_date: string | null
  created_at: string
}
