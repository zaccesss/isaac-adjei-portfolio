// I stream merged live status to the client via SSE so LiveStatusCards and LiveStatus
// replace all individual polling intervals with one persistent connection.
export const runtime = "edge"

const DISCORD_USER_ID = "1087417301583790212"

async function fetchAllStatus(origin: string) {
  // I run all fetches in parallel so the initial snapshot arrives in one round trip
  const [spotify, macbook, lenovo, gpc, ps5, github, lanyard] = await Promise.all([
    fetch(`${origin}/api/spotify`).then(r => r.ok ? r.json() : null).catch(() => null),
    fetch(`${origin}/api/macbook`).then(r => r.ok ? r.json() : null).catch(() => null),
    fetch(`${origin}/api/lenovo`).then(r => r.ok ? r.json() : null).catch(() => null),
    fetch(`${origin}/api/gpc`).then(r => r.ok ? r.json() : null).catch(() => null),
    fetch(`${origin}/api/ps5`).then(r => r.ok ? r.json() : null).catch(() => null),
    fetch(`${origin}/api/github-activity`).then(r => r.ok ? r.json() : null).catch(() => null),
    fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`).then(r => r.ok ? r.json() : null).catch(() => null),
  ])
  return { spotify, macbook, lenovo, gpc, ps5, github, lanyard }
}

export async function GET(request: Request) {
  const origin = new URL(request.url).origin
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      // I send the initial snapshot immediately so the client has data before the first interval fires
      try {
        const snapshot = await fetchAllStatus(origin)
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(snapshot)}\n\n`))
      } catch {}

      // Full status refresh every 2 minutes. Each tick self-fetches 7 endpoints, so the
      // interval is deliberately slow - device presence does not need second-by-second freshness.
      const interval = setInterval(async () => {
        try {
          const update = await fetchAllStatus(origin)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(update)}\n\n`))
        } catch {}
      }, 120000)

      // Spotify-only poll every 30s. This was 5s, which (combined with the persistent
      // connection across multiple open tabs) self-called /api/spotify ~720 times/hour
      // per tab and blew the Vercel Fluid Active CPU budget. 30s keeps song changes timely
      // without the cost.
      const spotifyInterval = setInterval(async () => {
        try {
          const spotify = await fetch(`${origin}/api/spotify`).then(r => r.ok ? r.json() : null).catch(() => null)
          if (spotify) controller.enqueue(encoder.encode(`event: spotify\ndata: ${JSON.stringify(spotify)}\n\n`))
        } catch {}
      }, 30000)

      // I clear the intervals when the client disconnects to avoid orphaned Edge function instances
      return () => { clearInterval(interval); clearInterval(spotifyInterval) }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  })
}
