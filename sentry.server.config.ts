// Server-side Sentry init. Errors only (no tracing), no PII, and there is no client config file at all,
// so the browser bundle stays untouched and nothing about visitors is collected. Guarded on SENTRY_DSN,
// so it is a no-op until that is set in the environment.
import * as Sentry from "@sentry/nextjs"

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0,
    sendDefaultPii: false,
  })
}
