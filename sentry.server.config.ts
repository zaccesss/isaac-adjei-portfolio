// Server-side (Node.js) Sentry init. Errors only (no tracing), no PII, guarded on SENTRY_DSN.
import * as Sentry from "@sentry/nextjs"

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0,
    sendDefaultPii: false,
  })
}
