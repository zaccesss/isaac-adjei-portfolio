// I fetch the read-funnel data server-side so the initial render is complete
// and the client component only needs to handle filtering and sorting.
import { getBlogReadFunnel } from "@/app/dashboard/actions"
import BlogAnalyticsClient from "./BlogAnalyticsClient"

export const dynamic = "force-dynamic"
export const metadata = { title: "Blog Analytics", robots: "noindex, nofollow" }

export default async function BlogAnalyticsPage() {
  // I pass the pre-fetched rows to the client so no client-side fetch is needed.
  const rows = await getBlogReadFunnel()
  return <BlogAnalyticsClient rows={rows} />
}
