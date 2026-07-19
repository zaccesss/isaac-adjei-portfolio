// A status board for the whole personal OS, fed by the same control-status route as the control
// page. Force-dynamic so the health is live.

import UptimeClient from "./UptimeClient"

export const dynamic = "force-dynamic"
export const metadata = { title: "Uptime", robots: "noindex, nofollow" }

export default function UptimePage() {
  return <UptimeClient />
}
