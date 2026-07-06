import { getBlogReadEvents } from "@/app/dashboard/actions"
import BlogAnalyticsClient from "./BlogAnalyticsClient"

export const dynamic = "force-dynamic"
export const metadata = { title: "Posts Analytics", robots: "noindex, nofollow" }

export default async function BlogAnalyticsPage() {
  // Raw dated read events so the client can recompute every chart for the selected period.
  const events = await getBlogReadEvents()
  return <BlogAnalyticsClient events={events} />
}
