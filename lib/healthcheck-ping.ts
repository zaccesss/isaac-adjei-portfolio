// I ping Healthchecks.io after each Vercel cron runs so a silently-dead cron raises an alert.
// Guarded on HEALTHCHECK_PING_KEY: with no key set this is a no-op, so the crons run unchanged
// without it. Pings are best-effort and time-boxed - a Healthchecks outage must never fail or
// delay the cron it is monitoring.

const PING_BASE = "https://hc-ping.com"

type PingStatus = "success" | "fail" | "start"

export async function pingHealthcheck(slug: string, status: PingStatus = "success"): Promise<void> {
  const key = process.env.HEALTHCHECK_PING_KEY
  if (!key) return

  // Slug-based pinging: hc-ping.com/<ping-key>/<slug> (success), .../fail and .../start for the rest.
  // The check auto-creates on its first ping, so I do not have to register each one by hand.
  const suffix = status === "success" ? "" : `/${status}`
  const url = `${PING_BASE}/${key}/${slug}${suffix}`

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)
    await fetch(url, { method: "POST", signal: controller.signal })
    clearTimeout(timeout)
  } catch {
    // Best-effort only: never let a monitoring ping break the cron it is monitoring.
  }
}
