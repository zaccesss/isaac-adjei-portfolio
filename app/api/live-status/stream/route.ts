// I stream merged live status to the client via SSE so LiveStatusCards and LiveStatus share
// one persistent connection instead of many polling timers. Every source is read IN-PROCESS
// via lib/live-status - no self-HTTP-call to my own /api routes, which used to boot a second
// (Node/Fluid) function per item per tick and drove the Vercel Active CPU bill. The client
// closes this stream when its tab is hidden (Page Visibility), and cancel() stops every timer
// on disconnect so nothing orphans.
import {
  getSpotify, getMacbook, getLenovo, getGpc, getPs5, getGithubActivity, getLanyard,
  type SpotifyStatus,
} from "@/lib/live-status"

export const runtime = "edge"

async function fetchAllStatus() {
  const [spotify, macbook, lenovo, gpc, ps5, github, lanyard] = await Promise.all([
    getSpotify(), getMacbook(), getLenovo(), getGpc(), getPs5(), getGithubActivity(), getLanyard(),
  ])
  return { spotify, macbook, lenovo, gpc, ps5, github, lanyard }
}

// Identity of what is playing - used to emit a Spotify event only when it actually changes
function spotifyKey(s: SpotifyStatus | null | undefined): string {
  if (!s) return ""
  return `${s.track ?? ""}|${s.artist ?? ""}|${s.playing}|${s.paused ?? false}`
}

export async function GET(request: Request) {
  const encoder = new TextEncoder()

  let fullTimer: ReturnType<typeof setInterval> | undefined
  let spotifyTimer: ReturnType<typeof setTimeout> | undefined
  let closed = false

  const cleanup = () => {
    closed = true
    if (fullTimer) clearInterval(fullTimer)
    if (spotifyTimer) clearTimeout(spotifyTimer)
  }

  const stream = new ReadableStream({
    async start(controller) {
      const safeEnqueue = (chunk: string) => {
        if (closed) return
        try {
          controller.enqueue(encoder.encode(chunk))
        } catch {
          cleanup()
        }
      }

      let lastSpotify = ""
      let lastEmit = Date.now()

      // Initial full snapshot so the client has everything before the first tick fires
      try {
        const snapshot = await fetchAllStatus()
        lastSpotify = spotifyKey(snapshot.spotify)
        safeEnqueue(`data: ${JSON.stringify(snapshot)}\n\n`)
      } catch {}

      // Full refresh every 2 min: device presence + GitHub change slowly, and this re-syncs
      // everything (including Spotify progress after an in-track seek).
      fullTimer = setInterval(async () => {
        if (closed) return
        try {
          const update = await fetchAllStatus()
          lastSpotify = spotifyKey(update.spotify)
          lastEmit = Date.now()
          safeEnqueue(`data: ${JSON.stringify(update)}\n\n`)
        } catch {}
      }, 120000)

      // Adaptive Spotify-only poll: 3s while playing (near-realtime skips), 15s when idle.
      // getSpotify() is Redis-cache-backed (3s TTL) so however many tabs poll, Spotify's API
      // is hit at most ~once every 3s globally. Emit only when the track/playing state changes,
      // or at least every 20s so a within-track seek re-syncs the progress bar.
      const spotifyTick = async () => {
        if (closed) return
        let playing = false
        try {
          const s = await getSpotify()
          playing = !!s?.playing
          const key = spotifyKey(s)
          if (key !== lastSpotify || Date.now() - lastEmit > 20000) {
            lastSpotify = key
            lastEmit = Date.now()
            safeEnqueue(`event: spotify\ndata: ${JSON.stringify(s)}\n\n`)
          }
        } catch {}
        if (!closed) spotifyTimer = setTimeout(spotifyTick, playing ? 3000 : 15000)
      }
      spotifyTimer = setTimeout(spotifyTick, 3000)
    },
    cancel() {
      cleanup()
    },
  })

  // Backup cleanup if the platform aborts the request without invoking cancel()
  request.signal.addEventListener("abort", cleanup)

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
