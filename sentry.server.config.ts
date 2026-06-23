// Server-side error monitoring. Guarded on SENTRY_DSN so it is a complete no-op until the DSN is set in
// the environment (Vercel). I deliberately run errors-only: no performance tracing (tracesSampleRate 0)
// and no PII (sendDefaultPii false), and there is no client config at all, so the public bundle is
// untouched and nothing about visitors is collected - just my own server, route and cron exceptions.
import * as Sentry from "@sentry/nextjs"

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0,
    sendDefaultPii: false,
  })
}
