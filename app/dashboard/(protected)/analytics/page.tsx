import { getAllAnalyticsOverview } from "../../actions"
import AllAnalyticsClient from "./AllAnalyticsClient"

export const metadata = { title: "All Analytics" }

export const dynamic = "force-dynamic"

export default async function AllAnalyticsPage() {
  const data = await getAllAnalyticsOverview()
  return <AllAnalyticsClient data={data} />
}
