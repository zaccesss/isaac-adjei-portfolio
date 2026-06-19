import { getBlogReadFunnel, getPostsReadHeatmap } from "@/app/dashboard/actions"
import BlogAnalyticsClient from "./BlogAnalyticsClient"

export const dynamic = "force-dynamic"
export const metadata = { title: "Posts Analytics", robots: "noindex, nofollow" }

export default async function BlogAnalyticsPage() {
  const [rows, heatmap] = await Promise.all([getBlogReadFunnel(), getPostsReadHeatmap()])
  return <BlogAnalyticsClient rows={rows} heatmap={heatmap} />
}
