import type { BlogPost } from "../index"

const _real_time_web_data: BlogPost = {
    slug: "real-time-web-data",
    title: "Real-Time Data on the Web: WebSockets, SSE and Long Polling Compared",
    date: "2026-07-20",
    type: "blog",
    cover_image: "/images/blog/covers/real-time-web-data.webp",
    description:
      "When to use WebSockets, Server-Sent Events or long polling for real-time data in a web application. A practical comparison covering latency, connection overhead, firewall behaviour and implementation complexity.",
    tags: ["WebSockets", "JavaScript", "Next.js", "Full-Stack", "API"],
    published: true,
    content: [
      {
        type: "p",
        text: "Real-time data on the web means updates appear in the browser within milliseconds of happening on the server, without the user having to refresh the page. Think of a live sports score, a chat message or a sensor reading updating in front of you. Making this work requires the server to push data to the browser proactively, rather than waiting for the browser to ask for it.",
      },
      {
        type: "p",
        text: "Every real-time feature on the web reduces to the same question: how does new data get from the server to the browser without the browser asking for it? There are three standard answers: long polling, Server-Sent Events and WebSockets. They each make different trade-offs and the right choice depends on your specific constraints.",
      },
      {
        type: "h2",
        text: "Long Polling",
      },
      {
        type: "p",
        text: "Long polling works over standard HTTP. The browser sends a request, the server holds it open until it has new data, then responds. The browser immediately sends another request. It looks like a real-time connection but it is really a sequence of requests with minimal delay between them.",
      },
      {
        type: "p",
        text: "The advantage is simplicity: it works everywhere HTTP works, requires no special server support and passes through every proxy and firewall without issue. The disadvantage is overhead: each response requires a new request, which means repeated HTTP handshakes and headers. For high-frequency updates (more than a few per second) this overhead becomes significant.",
      },
      {
        type: "h2",
        text: "Server-Sent Events",
      },
      {
        type: "p",
        text: "Server-Sent Events (SSE) is a one-directional streaming protocol over HTTP. The server sends a stream of text/event-stream data; the browser reads it via the EventSource API. The connection stays open. New data is pushed to the browser without a new request.",
      },
      {
        type: "p",
        text: "SSE is the right choice when data flows server-to-client only: live logs, notification feeds, stock prices, sensor telemetry dashboards. The protocol is simple, reconnects automatically on disconnect and works through most proxies. The limitation is directionality: if you need the client to also send data over the same connection, SSE is the wrong tool.",
      },
      {
        type: "code",
        lang: "typescript",
        text: `// Next.js App Router route handler for SSE
export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const send = (data: object) => {
        controller.enqueue(\`data: \${JSON.stringify(data)}\\n\\n\`)
      }
      const interval = setInterval(() => {
        send({ time: Date.now(), value: Math.random() })
      }, 1000)
      return () => clearInterval(interval)
    },
  })
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}`,
      },
      {
        type: "h2",
        text: "WebSockets",
      },
      {
        type: "p",
        text: "WebSockets provide a full-duplex persistent connection between browser and server. Either side can send data at any time. The initial HTTP handshake upgrades the connection to the WebSocket protocol; after that, frames are sent with minimal overhead. This makes WebSockets the right choice for chat applications, collaborative editing, multiplayer games and any feature where the browser also needs to send frequent messages.",
      },
      {
        type: "p",
        text: "The trade-off is complexity. WebSocket connections must be managed on the server side: connection pools, heartbeats, reconnection logic, horizontal scaling across multiple servers. In a serverless environment like Vercel, persistent WebSocket connections require a separate service such as Ably or Pusher because serverless functions terminate after each response.",
      },
      {
        type: "h2",
        text: "What I Use on This Portfolio",
      },
      {
        type: "p",
        text: "The live status cards on the homepage (Spotify, PS5, Discord) use periodic polling rather than WebSockets or SSE. The status changes slowly enough (every few seconds) that the overhead of a persistent connection is not justified. Each card fetches from a Next.js API route that reads from [Upstash](https://upstash.com) Redis, which is kept fresh by a [Cloudflare Worker](https://workers.cloudflare.com) polling the relevant APIs. The result is eventual consistency with a lag of a few seconds, which is acceptable for presence data.",
      },
      {
        type: "p",
        text: "For truly real-time sensor dashboards like the [Phaemos](/projects/phaemos) frontend, SSE makes more sense. The sensor node posts telemetry to the [FastAPI](https://fastapi.tiangolo.com) backend every 5 seconds; the Next.js dashboard could subscribe to an SSE stream from the backend rather than polling an API route every 5 seconds. The trade-off is that SSE requires a persistent server connection, which is straightforward on a dedicated server but requires additional routing on serverless infrastructure.",
      },
      {
        type: "h2",
        text: "SSE Reconnection and Event IDs",
      },
      {
        type: "p",
        text: "One underused feature of SSE is built-in reconnection. If the connection drops, the browser automatically reconnects after a configurable retry interval. If the server sends an `id:` field with each event, the browser sends a `Last-Event-ID` header on reconnect. A well-implemented SSE server can use this to resume from where the client left off - useful for log streaming where you do not want to re-send the entire history.",
      },
      {
        type: "code",
        lang: "typescript",
        text: `// SSE with event IDs and retry interval - client automatically reconnects
export async function GET() {
  let eventId = 0
  const stream = new ReadableStream({
    start(controller) {
      const send = (data: object) => {
        controller.enqueue(\`id: \${eventId++}\\nretry: 3000\\ndata: \${JSON.stringify(data)}\\n\\n\`)
      }
      const interval = setInterval(() => send({ time: Date.now() }), 1000)
      return () => clearInterval(interval)
    },
  })
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  })
}

// Client-side - browser handles reconnection automatically
const source = new EventSource("/api/stream")
source.onmessage = (e) => console.log(JSON.parse(e.data))
source.onerror = () => console.log("reconnecting...")`,
      },
      {
        type: "h2",
        text: "WebSocket Heartbeats and Connection Management",
      },
      {
        type: "p",
        text: "WebSocket connections can silently die. A load balancer or NAT gateway may drop an idle connection without sending a close frame. The browser and server both believe the connection is alive; neither side gets an error until they try to send something. The standard mitigation is a ping-pong heartbeat: the server sends a ping frame every 30 seconds, and the client responds with a pong. If three consecutive pings go unanswered, the server closes the connection and the client reconnects.",
      },
      {
        type: "p",
        text: "Browser WebSocket does not expose the ping/pong API directly - you implement application-level heartbeats with a JSON message. For a managed WebSocket service like Ably or Pusher, heartbeats are handled for you. For a self-managed server using the `ws` library in Node.js, `ws` handles the protocol-level ping/pong automatically if you call `ws.ping()` on the server side.",
      },
      {
        type: "h2",
        text: "Practical Latency Comparison",
      },
      {
        type: "ul",
        items: [
          "Long polling: 50-150ms latency at low load (dominated by HTTP round-trip and server hold time); degrades quickly under load as server connection pools fill",
          "SSE: 5-30ms latency from server push to browser receipt; the persistent TCP connection removes the handshake overhead of polling",
          "WebSockets: 1-10ms message delivery latency once the connection is established; suboptimal for infrequent messages due to the connection management overhead",
          "Serverless note: SSE works on [Vercel](https://vercel.com) and [Cloudflare Workers](https://workers.cloudflare.com) with streaming responses; WebSockets require Durable Objects (Cloudflare) or a dedicated service",
        ],
      },
      {
        type: "video",
        youtubeId: "1BfCnjr_Vjg",
        title: "WebSockets in 100 Seconds & Beyond with Socket.io - Fireship",
        description: "A fast, accurate overview of the WebSocket protocol: what it is, how the handshake works and when to use it over HTTP alternatives.",
      },
      {
        type: "h2",
        text: "Summary: When to Use Which",
      },
      {
        type: "ul",
        items: [
          "Long polling: simple server, low update frequency, data flows both ways, need to work through restrictive proxies",
          "SSE: server-to-client only, moderate update frequency, want browser reconnection for free, serverless compatible with streaming support",
          "WebSockets: bidirectional real-time communication, high-frequency updates, chat or collaborative features, dedicated server or managed service",
        ],
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "ol-links",
        items: [
          { text: "MDN: Server-Sent Events - EventSource API reference", url: "https://developer.mozilla.org/en-US/docs/Web/API/EventSource" },
          { text: "MDN: WebSocket API - including the Sec-WebSocket-Protocol handshake", url: "https://developer.mozilla.org/en-US/docs/Web/API/WebSocket" },
          { text: "RFC 6455 - The WebSocket Protocol (IETF)", url: "https://datatracker.ietf.org/doc/html/rfc6455" },
          { text: "High Performance Browser Networking - Grigorik - chapter 16 (SSE) and chapter 17 (WebSocket)", url: "https://hpbn.co/server-sent-events-sse/" },
          { text: "AI SDK streaming documentation - how to stream custom data alongside a model response", url: "https://ai-sdk.dev/docs/ai-sdk-ui/streaming-data" },
          { text: "MDN: Server-Sent Events - Using server-sent events", url: "https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events" },
          { text: "Wikipedia: WebSocket - protocol overview and use cases", url: "https://en.wikipedia.org/wiki/WebSocket" },
        ],
      },
    ],
  }

export default _real_time_web_data
