// Next.js calls register() once on server startup. I load the right Sentry config for the runtime, and
// export onRequestError so Next routes server-side request errors (routes, server components, server
// actions) into Sentry. All of it is inert until SENTRY_DSN is set, since the configs guard on it.
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
