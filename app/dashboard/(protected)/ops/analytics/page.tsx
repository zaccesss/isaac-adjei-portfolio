// The fuller Ops analytics page: a status-page-style uptime grid, run duration trends, a per-repo
// breakdown, a treemap of run volume and a Sankey of job outcomes - everything /dashboard/ops's own
// mini Overview section doesn't have room for. Same control_job_runs/control_check_snapshots data,
// just more of it.

import OpsAnalyticsClient from "./OpsAnalyticsClient"

export const dynamic = "force-dynamic"
export const metadata = { title: "Ops Analytics", robots: "noindex, nofollow" }

export default function OpsAnalyticsPage() {
  return <OpsAnalyticsClient />
}
