// I serve the dashboard home grid at /dashboard through the (protected) layout so the sidebar is present.
// The outer app/dashboard/page.tsx has been cleared to avoid a route conflict.
import { getDashboardSummary, getRecentActivity } from "../actions"
import DashboardHome from "../DashboardHome"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const summary = await getDashboardSummary()
  const activity = await getRecentActivity(5)
  return <DashboardHome summary={summary} activity={activity} />
}
