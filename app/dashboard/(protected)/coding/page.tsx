import { getWakatimeHeatmap } from "@/app/dashboard/actions"
import CodingClient from "./CodingClient"

export const dynamic = "force-dynamic"
export const metadata = { title: "Coding Activity", robots: "noindex, nofollow" }

export default async function CodingPage() {
  // I fetch a full year of daily rows server-side so the client renders immediately.
  const rows = await getWakatimeHeatmap()
  return <CodingClient rows={rows} />
}
