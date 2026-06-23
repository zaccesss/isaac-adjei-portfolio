// Edge-runtime Sentry init (the middleware runs here). Same errors-only, no-PII, DSN-guarded setup.
import * as Sentry from "@sentry/nextjs"

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0,
    sendDefaultPii: false,
  })
}
