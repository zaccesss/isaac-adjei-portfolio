// I load Sentry ONLY on the Node.js runtime, never on the edge runtime, so the SDK is never bundled into
// the edge middleware or edge routes. Vercel enforces an edge-function size cap only at its deploy step
// (not during next build), which is the prime suspect for why local + CI builds passed but the Vercel
// deploy failed. register() loads the server config on Node only and onRequestError dynamically imports
// Sentry on Node only - so there is no static @sentry/nextjs import reachable from the edge bundle.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config")
  }
}

export async function onRequestError(...args: Parameters<typeof import("@sentry/nextjs").captureRequestError>) {
  if (process.env.NEXT_RUNTIME !== "nodejs") return
  const Sentry = await import("@sentry/nextjs")
  Sentry.captureRequestError(...args)
}
