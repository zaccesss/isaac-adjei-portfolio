/**
 * PS5 presence worker - runs on Cloudflare Workers, triggered every minute.
 *
 * I exchange the PSN NPSSO cookie for an access token, fetch presence for
 * my account, then write the result to two Upstash Redis keys:
 *   ps5:status     - live payload with a 120-second TTL
 *   ps5:last-known - last known state, no TTL
 */

interface Env {
  PSN_NPSSO: string
  UPSTASH_REDIS_REST_URL: string
  UPSTASH_REDIS_REST_TOKEN: string
}

const PSN_CLIENT_ID = "09515159-7237-4370-9b4e-4f1afab1cbf2"
const PSN_CLIENT_SECRET = "ucPjkaTxEJi0uHEd"
const PSN_REDIRECT_URI = "com.scee.psxandroid.sso://redirect"
const PSN_ACCOUNT_ID = "322685844450023200"

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

async function getAccessToken(npsso: string): Promise<string> {
  // I exchange the NPSSO cookie for an OAuth auth code, then for an access token.
  const params = new URLSearchParams({
    access_type: "offline",
    client_id: PSN_CLIENT_ID,
    redirect_uri: PSN_REDIRECT_URI,
    response_type: "code",
    scope: "psn:mobile.v2.core psn:clientapp",
  })

  const authorizeRes = await fetch(
    `https://ca.account.sony.com/api/authz/v3/oauth/authorize?${params}`,
    {
      headers: { Cookie: `npsso=${npsso}` },
      redirect: "manual",
    }
  )

  const location = authorizeRes.headers.get("location") ?? ""
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
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: codeMatch[1],
        redirect_uri: PSN_REDIRECT_URI,
        token_format: "jwt",
      }),
    }
  )

  if (!tokenRes.ok) {
    const err = await tokenRes.text()
    throw new Error(`Token exchange failed: ${tokenRes.status} ${err}`)
  }

  const data = await tokenRes.json() as { access_token: string }
  return data.access_token
}

async function fetchPresence(accessToken: string): Promise<{
  online: boolean
  status: string
  game: string | null
  platform: string
  lastSeen: string
}> {
  const res = await fetch(
    `https://m.np.playstation.com/api/userProfile/v1/internal/users/${PSN_ACCOUNT_ID}/basicPresences?presenceType=PRIMARY`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  if (!res.ok) throw new Error(`Presence fetch failed: ${res.status}`)

  const data = await res.json() as {
    basicPresence?: {
      availability?: string
      gameTitleInfoList?: Array<{ titleName?: string; npTitleId?: string }>
    }
  }

  const basic = data.basicPresence ?? {}
  const availability = basic.availability ?? "unavailable"
  const online = availability === "availableToPlay"
  const busy = availability === "doNotDisturb"

  const gameInfo = (basic.gameTitleInfoList ?? [{}])[0]
  const game = gameInfo?.titleName ?? gameInfo?.npTitleId ?? null

  let status: string
  if (game) status = "Playing"
  else if (busy) status = "Busy"
  else if (online) status = "Online"
  else status = "Offline"

  return {
    online,
    status,
    game: game ?? null,
    platform: "PS5",
    lastSeen: new Date().toISOString(),
  }
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    const accessToken = await getAccessToken(env.PSN_NPSSO)
    const presence = await fetchPresence(accessToken)
    const payload = JSON.stringify(presence)

    // I write the live key with a 120-second TTL so the frontend
    // knows the worker is running and data is fresh.
    await upstash(env, ["SET", "ps5:status", payload, "EX", "120"])
    // I always update last-known so the frontend has a fallback
    // even when ps5:status has expired.
    await upstash(env, ["SET", "ps5:last-known", payload])

    console.log(`[${presence.lastSeen.slice(0, 19)}] ${presence.status} - ${presence.game ?? "no game"}`)
  },
}
