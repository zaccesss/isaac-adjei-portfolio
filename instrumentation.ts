// Next calls register() once on server startup; I load the right Sentry config per runtime. onRequestError
// routes server-side request errors (routes, server components, server actions) into Sentry. Inert until
// SENTRY_DSN is set, since both configs guard on it.
import * as Sentry from "@sentry/nextjs"

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config")
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config")
  }
}

export const onRequestError = Sentry.captureRequestError
