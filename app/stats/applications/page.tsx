import type { Metadata } from "next"
import { PublicApplicationsMap } from "@/components/stats/PublicApplicationsMap"
import { StatsPageHeader } from "@/components/stats/StatsPageHeader"

export const metadata: Metadata = {
  title: "Application Geography",
  description: "Where my job search has reached, one pin per city - a count only, never a company, status, role or date.",
  alternates: {
    canonical: "https://www.isaacadjei.me/stats/applications",
  },
  openGraph: {
    images: ["/api/og?title=Application%20Geography&description=Where%20my%20job%20search%20has%20reached%2C%20one%20pin%20per%20city."],
  },
}

export default function StatsApplicationsPage() {
  return (
    <div className="container max-w-3xl py-24 space-y-8">
      <StatsPageHeader
        title="Applications"
        description="Every city my job search has reached, sized by how many applications I have sent there. Hover a pin for a count - nothing more specific than that ever leaves the database for this page."
      />
      <PublicApplicationsMap />
    </div>
  )
}
