import { getWakatimeHeatmap, getGitHubContributions } from "@/app/dashboard/actions"
import CodingClient from "./CodingClient"

export const dynamic = "force-dynamic"
export const metadata = { title: "Coding Activity", robots: "noindex, nofollow" }

export default async function CodingPage() {
  const [rows, ghStats] = await Promise.all([
    getWakatimeHeatmap(),
    getGitHubContributions(),
  ])
  return <CodingClient rows={rows} ghDays={ghStats.days} ghTotals={ghStats.totals} />
}
