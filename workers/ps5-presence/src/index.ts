/**
 * PS5 presence worker - runs on Cloudflare Workers, triggered every minute.
 *
 * I exchange the PSN NPSSO cookie for an access token + refresh token on first
 * run, then store the refresh token in KV. On every subsequent run I use the
 * stored refresh token so the NPSSO cookie is only needed once (or when the
 * refresh token eventually expires after ~60 days).
 *
 * I write the result to two Upstash Redis keys:
 *   ps5:status     - live payload with a 120-second TTL
 *   ps5:last-known - last known state, no TTL
 */

interface Env {
  PSN_NPSSO: string
  PSN_ACCOUNT_ID: string // my PSN account id, a wrangler var (not a secret)
  UPSTASH_REDIS_REST_URL: string
  UPSTASH_REDIS_REST_TOKEN: string
  PS5_KV: KVNamespace
  IGDB_CLIENT_ID?: string
  IGDB_CLIENT_SECRET?: string
}

// These are Sony's public Android app credentials extracted from the PSN APK - not user secrets. gitleaks:allow
const PSN_CLIENT_ID = "09515159-7237-4370-9b40-3806e67c0891" // gitleaks:allow
const PSN_CLIENT_SECRET = "ucPjka5tntB2KqsP" // gitleaks:allow
const PSN_REDIRECT_URI = "com.scee.psxandroid.scecompcall://redirect"
const REFRESH_TOKEN_KEY = "psn:refresh_token"

async function upstash(env: Env, command: unknown[]): Promise<void> {
  const res = await fetch(env.UPSTASH_REDIS_REST_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  })
  if (!res.ok) throw new Error(`Upstash error: ${res.status}`)
}

async function exchangeNpsso(npsso: string): Promise<{ access_token: string; refresh_token: string }> {
  // Exchange NPSSO cookie for auth code, then for access + refresh tokens.
  const params = new URLSearchParams({
    access_type: "offline",
    client_id: PSN_CLIENT_ID,
    redirect_uri: PSN_REDIRECT_URI,
    response_type: "code",
    scope: "psn:mobile.v2.core psn:clientapp",
  })

  const cid = crypto.randomUUID()
  const authorizeRes = await fetch(
    `https://ca.account.sony.com/api/authz/v3/oauth/authorize?${params}`,
    {
      headers: {
        Cookie: `npsso=${npsso}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Requested-With": "com.scee.psxandroid",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-site",
      },
      redirect: "manual",
    }
  )

  const location = authorizeRes.headers.get("location") ?? ""
  console.log(`PSN authorize: status=${authorizeRes.status} location=${location || "(empty)"}`)
  const codeMatch = location.match(/[?&]code=([^&]+)/)
  if (!codeMatch) throw new Error(`No auth code in redirect: ${location}`)

  const basicAuth = btoa(`${PSN_CLIENT_ID}:${PSN_CLIENT_SECRET}`)
  const tokenRes = await fetch(
    "https://ca.account.sony.com/api/authz/v3/oauth/token",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "com.sony.snei.np.android.sso.share.oauth.versa.USER_AGENT",
        "X-Psn-Correlation-Id": cid,
      },
      body: new URLSearchParams({
        cid,
        grant_type: "authorization_code",
        code: codeMatch[1],
        redirect_uri: PSN_REDIRECT_URI,
        scope: "psn:mobile.v2.core psn:clientapp",
        token_format: "jwt",
      }),
    }
  )

  if (!tokenRes.ok) {
    const err = await tokenRes.text()
    throw new Error(`Token exchange failed: ${tokenRes.status} ${err}`)
  }

  const data = await tokenRes.json() as { access_token: string; refresh_token: string }
  return { access_token: data.access_token, refresh_token: data.refresh_token }
}

async function exchangeRefreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
  const basicAuth = btoa(`${PSN_CLIENT_ID}:${PSN_CLIENT_SECRET}`)
  const cid = crypto.randomUUID()
  const tokenRes = await fetch(
    "https://ca.account.sony.com/api/authz/v3/oauth/token",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "com.sony.snei.np.android.sso.share.oauth.versa.USER_AGENT",
        "X-Psn-Correlation-Id": cid,
      },
      body: new URLSearchParams({
        cid,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        token_format: "jwt",
        scope: "psn:mobile.v2.core psn:clientapp",
      }),
    }
  )

  if (!tokenRes.ok) throw new Error(`Refresh token exchange failed: ${tokenRes.status}`)

  const data = await tokenRes.json() as { access_token: string; refresh_token: string }
  return { access_token: data.access_token, refresh_token: data.refresh_token }
}

async function getAccessToken(env: Env): Promise<string> {
  const storedRefreshToken = await env.PS5_KV.get(REFRESH_TOKEN_KEY)

  if (storedRefreshToken) {
    try {
      const { access_token, refresh_token } = await exchangeRefreshToken(storedRefreshToken)
      // PSN rotates refresh tokens on each use - persist the new one.
      await env.PS5_KV.put(REFRESH_TOKEN_KEY, refresh_token)
      console.log("Auth: used stored refresh token")
      return access_token
    } catch (e) {
      console.log(`Refresh token failed (${e}), falling back to NPSSO`)
    }
  }

  // First run or refresh token expired - fall back to NPSSO.
  const { access_token, refresh_token } = await exchangeNpsso(env.PSN_NPSSO)
  await env.PS5_KV.put(REFRESH_TOKEN_KEY, refresh_token)
  console.log("Auth: used NPSSO, stored new refresh token")
  return access_token
}

// PSN returns marketing names; IGDB uses official titles - map the differences here.
const IGDB_NAME_MAP: Record<string, string> = {
  "EA SPORTS FC 26": "EA Sports FC 26",
  "EA SPORTS FC 27": "EA Sports FC 27",
  // PSN may return short names for GTA titles; IGDB needs the full official name.
  "GTA V":  "Grand Theft Auto V",
  "GTA VI": "Grand Theft Auto VI",
  // GTA Online is technically part of GTA V on IGDB
  "Grand Theft Auto Online": "Grand Theft Auto V",
  "GTA Online": "Grand Theft Auto V",
}

async function fetchIgdbCover(env: Env, gameName: string): Promise<string | null> {
  // I skip the lookup entirely if the secrets are not configured to avoid noisy errors.
  if (!env.IGDB_CLIENT_ID || !env.IGDB_CLIENT_SECRET) return null
  try {
    // I use the client_credentials flow - no user login needed, tokens last ~60 days.
    const tokenRes = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${env.IGDB_CLIENT_ID}&client_secret=${env.IGDB_CLIENT_SECRET}&grant_type=client_credentials`,
      { method: "POST" }
    )
    if (!tokenRes.ok) {
      console.log(`[igdb] token fetch failed: ${tokenRes.status}`)
      return null
    }
    const { access_token } = await tokenRes.json() as { access_token: string }

    const igdbName = IGDB_NAME_MAP[gameName] ?? gameName
    console.log(`[igdb] searching for '${igdbName}' (PSN name: '${gameName}')`)
    const coversRes = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": env.IGDB_CLIENT_ID,
        "Authorization": `Bearer ${access_token}`,
        // IGDB requires Content-Type text/plain for Apicalypse query bodies.
        "Content-Type": "text/plain",
      },
      body: `search "${igdbName}"; fields name, cover.url; where cover != null; limit 1;`,
    })
    if (!coversRes.ok) {
      console.log(`[igdb] games request failed: ${coversRes.status}`)
      return null
    }
    const results = await coversRes.json() as Array<{ name?: string; cover?: { url?: string } }>
    const url = results[0]?.cover?.url
    if (!url) {
      console.log(`[igdb] no cover found for '${igdbName}' (${results.length} results)`)
      return null
    }
    // IGDB returns protocol-relative thumbnail URLs; upgrade to full HTTPS big cover.
    const coverUrl = "https:" + url.replace("/t_thumb/", "/t_cover_big/")
    console.log(`[igdb] cover for '${results[0]?.name}': ${coverUrl}`)
    return coverUrl
  } catch (e) {
    console.log(`[igdb] unexpected error for '${gameName}': ${e}`)
    return null
  }
}

async function fetchPresence(accessToken: string, env: Env): Promise<{
  online: boolean
  busy: boolean
  status: string
  game: string | null
  game_image: string | null
  platform: string
  lastSeen: string
}> {
  const params = new URLSearchParams({
    type: "primary",
    platforms: "PS4,PS5,MOBILE_APP,PSPC",
    withOwnGameTitleInfo: "true",
  })
  const res = await fetch(
    `https://m.np.playstation.com/api/userProfile/v2/internal/users/${env.PSN_ACCOUNT_ID}/basicPresences?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  if (!res.ok) throw new Error(`Presence fetch failed: ${res.status}`)

  const data = await res.json() as {
    basicPresence?: {
      availability?: string
      gameTitleInfoList?: Array<{ titleName?: string; npTitleId?: string; conceptIconUrl?: string; titleIconUrl?: string }>
    }
  }

  const basic = data.basicPresence ?? {}
  const availability = basic.availability ?? "unavailable"
  // I treat doNotDisturb as online - the PS5 is on and active, it is just a social status.
  // Only "unavailable" (appear offline / truly offline) counts as not online.
  const online = availability === "availableToPlay" || availability === "doNotDisturb"
  const busy = availability === "doNotDisturb"

  const gameInfo = (basic.gameTitleInfoList ?? [{}])[0]
  const game = gameInfo?.titleName ?? gameInfo?.npTitleId ?? null
  // I prefer IGDB cover art (stable box art) over PSN's conceptIconUrl (changes with promotions)
  const psnImage = gameInfo?.conceptIconUrl ?? gameInfo?.titleIconUrl ?? null
  const gameImage = game ? (await fetchIgdbCover(env, game) ?? psnImage) : null

  let status: string
  if (game) status = "Playing"
  else if (busy) status = "Busy"
  else if (online) status = "Online"
  else status = "Offline"

  return {
    online,
    busy,
    status,
    game: game ?? null,
    game_image: gameImage,
    platform: "PS5",
    lastSeen: new Date().toISOString(),
  }
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    const accessToken = await getAccessToken(env)
    const presence = await fetchPresence(accessToken, env)
    const payload = JSON.stringify(presence)

    await upstash(env, ["SET", "ps5:status", payload, "EX", "150"])
    // I only update last-known when the PS5 is actually online so the "last seen" timestamp
    // reflects when it was genuinely active - not just when the cron last ran while offline.
    if (presence.online) {
      await upstash(env, ["SET", "ps5:last-known", payload])
      // I track last-game separately so sitting on the home screen (game: null) does not
      // overwrite the previously played title. last-known handles the lastSeen timestamp;
      // last-game handles the "last played" display.
      if (presence.game) {
        await upstash(env, ["SET", "ps5:last-game", payload])
      }
    }

    console.log(`[${presence.lastSeen.slice(0, 19)}] ${presence.status} - ${presence.game ?? "no game"}`)
  },
}
