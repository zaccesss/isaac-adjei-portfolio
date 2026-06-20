// Shared live-status data getters. Both the public /api/* route handlers AND the SSE
// stream import these, so the stream reads each source IN-PROCESS rather than HTTP-calling
// its own /api routes (which booted a second serverless function per item per tick - the
// double-invocation that burned Vercel CPU). One source of truth per item. Everything here
// is Edge-safe (no Node-only APIs) because the SSE stream runs on the Edge runtime - note
// btoa() rather than Buffer for the Spotify Basic auth header.
import { redis } from "@/lib/redis"

// ---------------------------------------------------------------------------
// Spotify
// ---------------------------------------------------------------------------

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
const SPOTIFY_REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN

interface LastPlayed {
  track: string
  artist: string
  albumArt: string | null
  type: "track" | "episode"
}

export interface SpotifyStatus {
  playing: boolean
  paused?: boolean
  type?: "track" | "episode"
  track?: string
  artist?: string
  albumArt?: string | null
  url?: string
  progressMs?: number
  durationMs?: number
  device?: string | null
  // Kept null for now so existing SpotifyBars consumers do not break; the visualiser
  // rebuild (next PR) removes them. Spotify deprecated audio-features/analysis Nov 2024.
  audioFeatures?: null
  beats?: null
  lastPlayed?: LastPlayed | null
}

async function getSpotifyAccessToken(): Promise<string | null> {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) return null

  if (redis) {
    const cached = await redis.get<string>("spotify:access_token")
    if (cached) return cached
  }

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      // btoa (not Buffer) so this also runs under the Edge runtime
      Authorization: `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: SPOTIFY_REFRESH_TOKEN,
    }),
  })
  if (!res.ok) return null

  const data = (await res.json()) as { access_token: string; expires_in: number }
  // Cache for 3300s (55 min) so the token refreshes before Spotify's 60-min expiry
  if (redis) await redis.set("spotify:access_token", data.access_token, { ex: 3300 })
  return data.access_token
}

function getLastPlayed(): Promise<LastPlayed | null> {
  if (!redis) return Promise.resolve(null)
  return redis.get<LastPlayed>("spotify:last_played")
}

// I cache the /me/player result for 3s. This is what makes near-realtime polling cheap:
// however many tabs poll however often, Spotify's API is hit at most ~once every 3s
// globally instead of once per poll per tab. On a cache hit I advance progressMs by the
// elapsed time so the progress bar stays accurate without an API call.
const SPOTIFY_NOW_TTL = 3 // seconds
type CachedNow = SpotifyStatus & { _at: number }

export async function getSpotify(): Promise<SpotifyStatus> {
  try {
    if (redis) {
      const cached = await redis.get<CachedNow>("spotify:now")
      if (cached) {
        const { _at, ...rest } = cached
        if (rest.playing && typeof rest.progressMs === "number" && typeof rest.durationMs === "number") {
          rest.progressMs = Math.min(rest.progressMs + (Date.now() - _at), rest.durationMs)
        }
        return rest
      }
    }

    const token = await getSpotifyAccessToken()
    if (!token) return { playing: false, lastPlayed: await getLastPlayed() }

    // /me/player (not recently-played) so I get live is_playing + progress_ms
    const res = await fetch("https://api.spotify.com/v1/me/player?additional_types=track,episode", {
      headers: { Authorization: `Bearer ${token}` },
    })

    // 204 = no active device; fall back to last_played so the card never blanks
    if (res.status === 204 || res.status === 404 || !res.ok) {
      return { playing: false, lastPlayed: await getLastPlayed() }
    }

    const data = (await res.json()) as {
      is_playing: boolean
      progress_ms?: number
      currently_playing_type?: string
      device?: { name: string; type: string }
      item?: {
        id: string
        name: string
        duration_ms: number
        artists?: { name: string }[]
        album?: { images: { url: string }[] }
        show?: { name: string; images: { url: string }[] }
        images?: { url: string }[]
        external_urls: { spotify: string }
      }
    }

    if (!data.item) return { playing: false, lastPlayed: await getLastPlayed() }

    const isEpisode = data.currently_playing_type === "episode"
    const title = data.item.name
    const subtitle = isEpisode
      ? (data.item.show?.name ?? "Podcast")
      : (data.item.artists?.map((a) => a.name).join(", ") ?? "")
    const images = isEpisode
      ? (data.item.images ?? data.item.show?.images ?? [])
      : (data.item.album?.images ?? [])
    const albumArt = images[1]?.url ?? images[0]?.url ?? null

    const result: SpotifyStatus = {
      playing: data.is_playing,
      paused: !data.is_playing,
      type: isEpisode ? "episode" : "track",
      track: title,
      artist: subtitle,
      albumArt,
      url: data.item.external_urls.spotify,
      progressMs: data.progress_ms ?? 0,
      durationMs: data.item.duration_ms,
      device: data.device?.name ?? null,
      audioFeatures: null,
      beats: null,
      lastPlayed: null,
    }

    if (redis) {
      await redis.set("spotify:last_played", {
        track: title,
        artist: subtitle,
        albumArt,
        type: isEpisode ? "episode" : "track",
      })
      await redis.set<CachedNow>("spotify:now", { ...result, _at: Date.now() }, { ex: SPOTIFY_NOW_TTL })
    }

    return result
  } catch {
    return { playing: false, lastPlayed: await getLastPlayed() }
  }
}

// ---------------------------------------------------------------------------
// Devices (presence written to Redis by per-device daemons / a Cloudflare worker)
// ---------------------------------------------------------------------------

type MacPayload = {
  battery: number
  charging: boolean
  timestamp: string
  device?: string
  country_code?: string
  timezone?: string
  weather_condition?: string
  weather_emoji?: string
  temp_c?: number
  is_day?: number
}

export interface MacbookStatus {
  battery: number | null
  charging: boolean | null
  lastSeen: string | null
  device: string | null
  countryCode: string | null
  timezone: string
  weatherCondition: string | null
  weatherEmoji: string | null
  tempC: number | null
}

const MAC_FALLBACK: MacbookStatus = {
  battery: null, charging: null, lastSeen: null, device: null, countryCode: null,
  timezone: "Europe/London", weatherCondition: null, weatherEmoji: null, tempC: null,
}

export async function getMacbook(): Promise<MacbookStatus> {
  try {
    if (!redis) return MAC_FALLBACK
    const [live, lastKnown] = await Promise.all([
      redis.get<MacPayload>("macbook:status"),
      redis.get<MacPayload>("macbook:last-known"),
    ])
    const source = live ?? lastKnown
    if (!source) return MAC_FALLBACK

    // Prefer WeatherAPI is_day for accurate night detection; fall back to an hour-based
    // estimate so the moon still shows during a daemon restart that predates is_day.
    const tz = source.timezone ?? "Europe/London"
    const hour = new Date(new Date().toLocaleString("en-US", { timeZone: tz })).getHours()
    const isNight = source.is_day !== undefined ? source.is_day === 0 : hour >= 19 || hour < 5
    const dayEmojis = new Set(["☀️", "🌤️"])
    let weatherEmoji = source.weather_emoji ?? null
    if (isNight && weatherEmoji && dayEmojis.has(weatherEmoji)) weatherEmoji = "🌙"

    return {
      battery: source.battery,
      charging: source.charging,
      lastSeen: source.timestamp,
      device: source.device ?? null,
      countryCode: source.country_code ?? null,
      timezone: source.timezone ?? "Europe/London",
      weatherCondition: source.weather_condition ?? null,
      weatherEmoji,
      tempC: source.temp_c ?? null,
    }
  } catch {
    return MAC_FALLBACK
  }
}

type LenovoPayload = { battery: number; charging: boolean; timestamp: string; device?: string }
export interface LenovoStatus { battery: number | null; charging: boolean | null; lastSeen: string | null; device: string | null }
const LENOVO_FALLBACK: LenovoStatus = { battery: null, charging: null, lastSeen: null, device: null }

export async function getLenovo(): Promise<LenovoStatus> {
  try {
    if (!redis) return LENOVO_FALLBACK
    const [live, lastKnown] = await Promise.all([
      redis.get<LenovoPayload>("lenovo:status"),
      redis.get<LenovoPayload>("lenovo:last-known"),
    ])
    const source = live ?? lastKnown
    if (!source) return LENOVO_FALLBACK
    return { battery: source.battery, charging: source.charging, lastSeen: source.timestamp, device: source.device ?? null }
  } catch {
    return LENOVO_FALLBACK
  }
}

type GpcPayload = { timestamp: string; device?: string; cpu_percent: number | null; gpu_percent: number | null; game: string | null }
export interface GpcStatus { online: boolean; lastSeen: string | null; device: string | null; cpu: number | null; gpu: number | null; game: string | null }
const GPC_FALLBACK: GpcStatus = { online: false, lastSeen: null, device: null, cpu: null, gpu: null, game: null }

export async function getGpc(): Promise<GpcStatus> {
  try {
    if (!redis) return GPC_FALLBACK
    const [live, lastKnown] = await Promise.all([
      redis.get<GpcPayload>("gpc:status"),
      redis.get<GpcPayload>("gpc:last-known"),
    ])
    const online = live !== null
    const source = live ?? lastKnown
    if (!source) return GPC_FALLBACK
    return {
      online,
      lastSeen: source.timestamp,
      device: source.device ?? null,
      // Only expose live metrics when online; stale last-known values would mislead
      cpu: online ? source.cpu_percent : null,
      gpu: online ? source.gpu_percent : null,
      game: online ? (source.game ?? null) : null,
    }
  } catch {
    return GPC_FALLBACK
  }
}

type PS5Payload = {
  online: boolean
  busy: boolean
  status: string
  game: string | null
  game_image: string | null
  platform: string
  lastSeen: string
}
export interface PS5Status {
  online: boolean
  busy: boolean
  lastSeen: string | null
  status: string
  game: string | null
  gameImage: string | null
  lastGame: string | null
  lastGameImage: string | null
}
const PS5_FALLBACK: PS5Status = {
  online: false, busy: false, lastSeen: null, status: "Offline",
  game: null, gameImage: null, lastGame: null, lastGameImage: null,
}

export async function getPs5(): Promise<PS5Status> {
  try {
    if (!redis) return PS5_FALLBACK
    const [live, lastKnown, lastGame] = await Promise.all([
      redis.get<PS5Payload>("ps5:status"),
      redis.get<PS5Payload>("ps5:last-known"),
      redis.get<PS5Payload>("ps5:last-game"),
    ])
    const source = live ?? lastKnown
    if (!source) return PS5_FALLBACK
    const online = source.online === true
    return {
      online,
      busy: online && source.busy === true,
      // lastKnown.lastSeen = the last time it was genuinely on (source.lastSeen ticks every cron run)
      lastSeen: lastKnown?.lastSeen ?? null,
      status: online ? source.status : "Offline",
      game: online ? (source.game ?? null) : null,
      gameImage: online ? (source.game_image ?? null) : null,
      lastGame: lastGame?.game ?? null,
      lastGameImage: lastGame?.game_image ?? null,
    }
  } catch {
    return PS5_FALLBACK
  }
}

// ---------------------------------------------------------------------------
// GitHub last push (cached 5 min in Redis)
// ---------------------------------------------------------------------------

export interface GithubActivity { repo: string | null; pushedAt?: string | null; relativeTime: string | null }

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return "yesterday"
  return `${days}d ago`
}

export async function getGithubActivity(): Promise<GithubActivity> {
  try {
    if (redis) {
      const cached = await redis.get<{ repo: string; pushedAt: string }>("github:last_push")
      if (cached) {
        // relativeTime recomputed on cache hit so "2m ago" stays accurate while data is frozen
        return { repo: cached.repo, pushedAt: cached.pushedAt, relativeTime: relativeTime(cached.pushedAt) }
      }
    }

    const pat = process.env.GITHUB_PAT
    const res = await fetch("https://api.github.com/users/zaccesss/events?per_page=30", {
      headers: {
        "User-Agent": "isaac-adjei-portfolio",
        Accept: "application/vnd.github+json",
        ...(pat ? { Authorization: `Bearer ${pat}` } : {}),
      },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return { repo: null, pushedAt: null, relativeTime: null }

    const events = (await res.json()) as { type: string; repo: { name: string }; created_at: string }[]
    const push = events.find((e) => e.type === "PushEvent" && e.repo.name !== "zaccesss/zaccesss")
    if (!push) return { repo: null, pushedAt: null, relativeTime: null }

    const repoShort = push.repo.name.replace("zaccesss/", "")
    if (redis) await redis.set("github:last_push", { repo: repoShort, pushedAt: push.created_at }, { ex: 300 })
    return { repo: repoShort, pushedAt: push.created_at, relativeTime: relativeTime(push.created_at) }
  } catch {
    return { repo: null, pushedAt: null, relativeTime: null }
  }
}

// ---------------------------------------------------------------------------
// Discord presence via Lanyard (external service, already realtime - no caching needed)
// ---------------------------------------------------------------------------

const DISCORD_USER_ID = "1087417301583790212"

export async function getLanyard(): Promise<unknown> {
  return fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`)
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null)
}
