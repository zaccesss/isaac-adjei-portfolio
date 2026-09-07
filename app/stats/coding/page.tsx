import type { Metadata } from "next"
import WakatimeStats from "@/components/lab/WakatimeStats"
import { StatsPageHeader } from "@/components/stats/StatsPageHeader"

export const metadata: Metadata = {
  title: "Coding Stats",
  description: "My WakaTime coding stats - daily trend, languages, projects, editors and when I actually code.",
  alternates: {
    canonical: "https://www.isaacadjei.me/stats/coding",
  },
  openGraph: {
    images: ["/api/og?title=Coding%20Stats&description=My%20WakaTime%20coding%20stats%20-%20languages%2C%20projects%2C%20editors%20and%20when%20I%20actually%20code."],
  },
}

export default function StatsCodingPage() {
  return (
    <div className="container max-w-3xl py-24 space-y-8">
      <StatsPageHeader
        title="Coding"
        description="Live WakaTime data - how much I code, in what, in which editor and when."
      />
      <WakatimeStats />
    </div>
  )
}
