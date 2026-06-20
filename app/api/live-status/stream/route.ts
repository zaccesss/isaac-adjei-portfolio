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

      const interval = setInterval(async () => {
        try {
          const update = await fetchAllStatus(origin)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(update)}\n\n`))
        } catch {}
      }, 60000)

      // I clear the interval when the client disconnects to avoid orphaned Edge function instances
      return () => clearInterval(interval)
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
