// I fetch contributions server-side so the initial render is data-complete
// and the client component only needs to handle mutations and local UI state.
import { getOpenSourceContributions } from "@/app/dashboard/actions"
import OpenSourceClient from "./OpenSourceClient"

export const dynamic = "force-dynamic"
export const metadata = { title: "Open Source", robots: "noindex, nofollow" }

export default async function OpenSourcePage() {
  // I pass the fetched rows directly to the client component as initial state.
  const contributions = await getOpenSourceContributions()
  return <OpenSourceClient initial={contributions} />
}
