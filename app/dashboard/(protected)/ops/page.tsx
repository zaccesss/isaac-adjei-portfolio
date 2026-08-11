// Ops: run any allow-listed workflow across my six repos, watch each job's health, see a real
// historical trend, and hold the operational switches that used to live in Settings. Absorbed
// both the old /dashboard/control and /dashboard/uptime pages, which now redirect here.
// Force-dynamic so statuses are live.

import OpsClient from "./OpsClient"

export const dynamic = "force-dynamic"
export const metadata = { title: "Ops", robots: "noindex, nofollow" }

export default function OpsPage() {
  return <OpsClient />
}
