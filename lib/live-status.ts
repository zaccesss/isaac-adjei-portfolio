// Shared live-status data getters. The public /api/* route handlers AND the combined
// /api/live-status snapshot import these, so every source has ONE implementation. Everything
// here is Edge-safe (no Node-only APIs) - note btoa() rather than Buffer for the Spotify Basic
// auth header.
//
// Redis discipline (this is what keeps Upstash well under its monthly command budget):
//   - Spotify uses ZERO Redis on the hot path: the access token is cached in-memory, the
//     now-playing result is NOT cached in Redis (the CDN cache in front of /api/spotify is the
//     dedup layer instead) and spotify:last_played is written only when the track changes.
//   - Device presence is the only thing that genuinely lives in Redis. getLiveSnapshot() reads
//     every presence key in a SINGLE mget, so one origin request costs one Redis command.
//   - Every getter that has its own upstream API (Spotify, GitHub) isolates its Redis read in
//     its own try/catch, so a Redis outage falls through to the live API instead of blanking the
//     card. The device getters legitimately return their offline fallback when Redis is down,
//     because Redis is their only source.
import { redis } from "@/lib/redis"
import { DISCORD_USER_ID } from "@/lib/site-config"

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
  // Kept null so existing SpotifyBars consumers do not break. Spotify deprecated
  // audio-features/analysis Nov 2024.
  audioFeatures?: null
  beats?: null
  lastPlayed?: LastPlayed | null
}

// In-memory token cache (NOT Redis). A warm function instance reuses the token for its ~55-min
// life, so a refresh costs one Spotify call per cold start and zero Redis commands. This is the
// change that stopped the now-playing poll from hammering Upstash.
let spotifyToken: { value: string; expiresAt: number } | null = null
// The last track I persisted to spotify:last_played, kept in-memory so a song left playing does
// not rewrite the same value on every poll - I write only when the track actually changes.
let lastWrittenTrackKey: string | null = null

async function getSpotifyAccessToken(): Promise<string | null> {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) return null
  if (spotifyToken && spotifyToken.expiresAt > Date.now()) return spotifyToken.value

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
  // Refresh a minute early so a near-expiry token is never handed out.
  spotifyToken = { value: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 }
  return data.access_token
}

async function getLastPlayed(): Promise<LastPlayed | null> {
  if (!redis) return null
  // Isolated so a Redis outage just means "no last-played thumbnail", never a thrown error.
  try {
    return await redis.get<LastPlayed>("spotify:last_played")
  } catch {
    return null
  }
}

export async function getSpotify(): Promise<SpotifyStatus> {
  const token = await getSpotifyAccessToken()
  if (!token) return { playing: false, lastPlayed: await getLastPlayed() }

  let res: Response
  try {
    // /me/player (not recently-played) so I get live is_playing + progress_ms
    res = await fetch("https://api.spotify.com/v1/me/player?additional_types=track,episode", {
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch {
    // Spotify itself unreachable - fall back to the last known track.
    return { playing: false, lastPlayed: await getLastPlayed() }
  }

  // 204 = no active device; fall back to last_played so the card never blanks
  if (res.status === 204 || res.status === 404 || !res.ok) {
    return { playing: false, lastPlayed: await getLastPlayed() }
  }

  let data: {
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
  try {
    data = await res.json()
  } catch {
    return { playing: false, lastPlayed: await getLastPlayed() }
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

  // Persist last_played only when the track actually changes. Wrapped so a Redis outage can
  // never blank the live card - Spotify has already answered above.
  const trackKey = `${title}|${subtitle}`
  if (redis && trackKey !== lastWrittenTrackKey) {
    lastWrittenTrackKey = trackKey
    try {
      await redis.set("spotify:last_played", {
        track: title,
        artist: subtitle,
        albumArt,
        type: isEpisode ? "episode" : "track",
      })
    } catch {}
  }

  return result
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

// Pure: turn the raw Redis payloads into the public shape. Shared by getMacbook() (its own
// route) and getLiveSnapshot() (the combined mget), so the logic lives in one place.
function parseMacbook(live: MacPayload | null, lastKnown: MacPayload | null): MacbookStatus {
  const source = live ?? lastKnown
  if (!source) return MAC_FALLBACK

  // Prefer WeatherAPI is_day for accurate night detection; fall back to an hour-based estimate
  // so the moon still shows during a daemon restart that predates is_day.
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
}

export async function getMacbook(): Promise<MacbookStatus> {
  if (!redis) return MAC_FALLBACK
  try {
    const [live, lastKnown] = await Promise.all([
      redis.get<MacPayload>("macbook:status"),
      redis.get<MacPayload>("macbook:last-known"),
    ])
    return parseMacbook(live, lastKnown)
  } catch {
    return MAC_FALLBACK
  }
}

type LenovoPayload = { battery: number; charging: boolean; timestamp: string; device?: string }
export interface LenovoStatus { battery: number | null; charging: boolean | null; lastSeen: string | null; device: string | null }
const LENOVO_FALLBACK: LenovoStatus = { battery: null, charging: null, lastSeen: null, device: null }

function parseLenovo(live: LenovoPayload | null, lastKnown: LenovoPayload | null): LenovoStatus {
  const source = live ?? lastKnown
  if (!source) return LENOVO_FALLBACK
  return { battery: source.battery, charging: source.charging, lastSeen: source.timestamp, device: source.device ?? null }
}

export async function getLenovo(): Promise<LenovoStatus> {
  if (!redis) return LENOVO_FALLBACK
  try {
    const [live, lastKnown] = await Promise.all([
      redis.get<LenovoPayload>("lenovo:status"),
      redis.get<LenovoPayload>("lenovo:last-known"),
    ])
    return parseLenovo(live, lastKnown)
  } catch {
    return LENOVO_FALLBACK
  }
}

type GpcPayload = { timestamp: string; device?: string; cpu_percent: number | null; gpu_percent: number | null; game: string | null; game_image?: string | null }
export interface GpcStatus {
  online: boolean
  lastSeen: string | null
  device: string | null
  cpu: number | null
  gpu: number | null
  game: string | null
  gameImage: string | null
  // Last game actually played, shown only when the PC is offline (mirrors the PS5 card). Kept in
  // its own gpc:last-game key - not read off gpc:last-known - so it survives the PC being shut down
  // from the desktop (where the final write would carry game = null).
  lastGame: string | null
  lastGameImage: string | null
}
const GPC_FALLBACK: GpcStatus = {
  online: false, lastSeen: null, device: null, cpu: null, gpu: null,
  game: null, gameImage: null, lastGame: null, lastGameImage: null,
}

function parseGpc(live: GpcPayload | null, lastKnown: GpcPayload | null, lastGame: GpcPayload | null): GpcStatus {
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
    gameImage: online ? (source.game_image ?? null) : null,
    lastGame: lastGame?.game ?? null,
    lastGameImage: lastGame?.game_image ?? null,
  }
}

export async function getGpc(): Promise<GpcStatus> {
  if (!redis) return GPC_FALLBACK
  try {
    const [live, lastKnown, lastGame] = await Promise.all([
      redis.get<GpcPayload>("gpc:status"),
      redis.get<GpcPayload>("gpc:last-known"),
      redis.get<GpcPayload>("gpc:last-game"),
    ])
    return parseGpc(live, lastKnown, lastGame)
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

function parsePs5(live: PS5Payload | null, lastKnown: PS5Payload | null, lastGame: PS5Payload | null): PS5Status {
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
}

export async function getPs5(): Promise<PS5Status> {
  if (!redis) return PS5_FALLBACK
  try {
    const [live, lastKnown, lastGame] = await Promise.all([
      redis.get<PS5Payload>("ps5:status"),
      redis.get<PS5Payload>("ps5:last-known"),
      redis.get<PS5Payload>("ps5:last-game"),
    ])
    return parsePs5(live, lastKnown, lastGame)
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

function parseGithub(cached: { repo: string; pushedAt: string } | null): GithubActivity | null {
  if (!cached) return null
  // relativeTime recomputed on every read so "2m ago" stays accurate while data is frozen
  return { repo: cached.repo, pushedAt: cached.pushedAt, relativeTime: relativeTime(cached.pushedAt) }
}

// Fetch from the GitHub API and refresh the cache. Separated from the cached read so the
// snapshot can self-heal a missing key without a second Redis round-trip.
async function fetchGithubAndCache(): Promise<GithubActivity> {
  try {
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
    if (redis) {
      try { await redis.set("github:last_push", { repo: repoShort, pushedAt: push.created_at }, { ex: 300 }) } catch {}
    }
    return { repo: repoShort, pushedAt: push.created_at, relativeTime: relativeTime(push.created_at) }
  } catch {
    return { repo: null, pushedAt: null, relativeTime: null }
  }
}

export async function getGithubActivity(): Promise<GithubActivity> {
  // Redis read isolated from the API fetch: a Redis outage falls through to GitHub's own API
  // rather than blanking the card.
  if (redis) {
    try {
      const cached = await redis.get<{ repo: string; pushedAt: string }>("github:last_push")
      const parsed = parseGithub(cached)
      if (parsed) return parsed
    } catch {}
  }
  return fetchGithubAndCache()
}

// ---------------------------------------------------------------------------
// Discord presence via Lanyard (external service, already realtime - no caching needed)
// ---------------------------------------------------------------------------


// Only the fields the Discord card actually renders. Lanyard's raw payload also carries the full
// Discord user object, KV store, platform flags and Spotify track IDs - none of which the client
// needs, so I project down to this shape before it leaves the server.
interface LanyardActivity {
  type: number
  name: string
  details?: string
  state?: string
  timestamps?: { start?: number; end?: number }
  assets?: { large_image?: string; large_text?: string; small_image?: string; small_text?: string }
  application_id?: string
}

export interface LanyardPublic {
  data: {
    discord_status: string
    activities: LanyardActivity[]
  }
}

export async function getLanyard(): Promise<LanyardPublic | null> {
  const raw = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`)
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null)

  const data = (raw as { data?: { discord_status?: string; activities?: LanyardActivity[] } } | null)?.data
  if (!data) return null

  // I rebuild each activity field by field so nothing extra rides along.
  const activities: LanyardActivity[] = (data.activities ?? []).map((a) => ({
    type: a.type,
    name: a.name,
    details: a.details,
    state: a.state,
    timestamps: a.timestamps && { start: a.timestamps.start, end: a.timestamps.end },
    assets: a.assets && {
      large_image: a.assets.large_image,
      large_text: a.assets.large_text,
      small_image: a.assets.small_image,
      small_text: a.assets.small_text,
    },
    application_id: a.application_id,
  }))

  return { data: { discord_status: data.discord_status ?? "offline", activities } }
}

// ---------------------------------------------------------------------------
// Combined snapshot - everything except Spotify (which has its own faster-refreshing route).
// All four device presences + GitHub are read in a SINGLE Redis mget, so one origin request
// (i.e. one CDN cache miss) costs one Redis command regardless of how many cards are shown.
// The CDN cache in front of /api/live-status then bounds how often this runs, no matter how
// many tabs are open - that decoupling is what makes this safe at any number of viewers.
// ---------------------------------------------------------------------------

export interface LiveSnapshot {
  macbook: MacbookStatus
  lenovo: LenovoStatus
  gpc: GpcStatus
  ps5: PS5Status
  github: GithubActivity
  lanyard: LanyardPublic | null
}

export async function getLiveSnapshot(): Promise<LiveSnapshot> {
  let macS: MacPayload | null = null, macL: MacPayload | null = null
  let lenS: LenovoPayload | null = null, lenL: LenovoPayload | null = null
  let gpcS: GpcPayload | null = null, gpcL: GpcPayload | null = null, gpcG: GpcPayload | null = null
  let ps5S: PS5Payload | null = null, ps5L: PS5Payload | null = null, ps5G: PS5Payload | null = null
  let ghCached: { repo: string; pushedAt: string } | null = null

  if (redis) {
    try {
      const v = await redis.mget<
        [MacPayload, MacPayload, LenovoPayload, LenovoPayload, GpcPayload, GpcPayload, GpcPayload, PS5Payload, PS5Payload, PS5Payload, { repo: string; pushedAt: string }]
      >(
        "macbook:status", "macbook:last-known",
        "lenovo:status", "lenovo:last-known",
        "gpc:status", "gpc:last-known", "gpc:last-game",
        "ps5:status", "ps5:last-known", "ps5:last-game",
        "github:last_push",
      )
      ;[macS, macL, lenS, lenL, gpcS, gpcL, gpcG, ps5S, ps5L, ps5G, ghCached] = v
    } catch {
      // Redis unreachable: devices fall back to offline, GitHub self-heals via its API below.
    }
  }

  // GitHub: use the mget'd value if present, else self-heal from the API (rare - the key is
  // cached 5 min and refreshed by /api/github-activity pollers). Run in parallel with Lanyard.
  const ghParsed = parseGithub(ghCached)
  const [github, lanyard] = await Promise.all([
    ghParsed ? Promise.resolve(ghParsed) : fetchGithubAndCache(),
    getLanyard(),
  ])

  return {
    macbook: parseMacbook(macS, macL),
    lenovo: parseLenovo(lenS, lenL),
    gpc: parseGpc(gpcS, gpcL, gpcG),
    ps5: parsePs5(ps5S, ps5L, ps5G),
    github,
    lanyard,
  }
}
