import { getDashboardSummary } from "./actions"
import DashboardHome from "./DashboardHome"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const summary = await getDashboardSummary()
  return <DashboardHome summary={summary} />
}
