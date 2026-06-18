import type { TILEntry } from "../index"

const _edge_vs_serverless_cold_start: TILEntry = {
    id: "edge-vs-serverless-cold-start",
    title: "Edge functions eliminate cold starts by running in lightweight V8 isolates, not full VMs",
    date: "2026-07-14",
    category: "Web",
    published: true,
    body: "Traditional serverless functions (AWS Lambda, Vercel serverless) spin up a Node.js process inside a container on first request: this takes 100-500 ms. [Edge functions](https://vercel.com/docs/functions/edge-functions) run in V8 isolates at the CDN PoP closest to the user. Isolates start in under 5 ms because they share the V8 engine that is already running; there is no container to provision. The trade-off: edge functions cannot run Node.js-specific APIs (file system, native modules), have tighter CPU and memory limits and run inside a restricted sandbox.",
    detail: [
      {
        type: "p",
        text: "The limitation that matters most in practice: no Node.js built-ins. You cannot use `fs`, the Node.js `crypto` module or any native addon. You get the standard Web APIs: `fetch`, `Request`, `Response`, `crypto.subtle`. If your existing serverless function uses any Node.js-specific API, a direct port to edge will break silently during build or at runtime.",
      },
      {
        type: "link",
        url: "https://vercel.com/docs/functions/edge-functions",
        label: "Vercel: Edge Functions",
        description: "Covers the Edge Runtime API surface, limitations versus Node.js serverless and when to use each.",
      },
    ],
    tags: ["edge", "serverless", "Next.js", "performance", "web"],
  }

export default _edge_vs_serverless_cold_start
