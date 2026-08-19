import type { Metadata } from "next"
import GamingPanel from "@/components/lab/GamingPanel"
import { StatsPageHeader } from "@/components/stats/StatsPageHeader"

export const metadata: Metadata = {
  title: "Gaming Status",
  description: "Live PS5 and gaming PC status - what I am playing right now, or last played.",
  alternates: {
    canonical: "https://www.isaacadjei.me/stats/gaming",
  },
  openGraph: {
    images: ["/api/og?title=Gaming%20Status&description=Live%20PS5%20and%20gaming%20PC%20status."],
  },
}

export default function StatsGamingPage() {
  return (
    <div className="container max-w-3xl py-24 space-y-8">
      <StatsPageHeader
        title="Gaming"
        description="Live status for my PS5 and gaming PC, polling every 30 seconds."
      />
      <GamingPanel />
    </div>
  )
}
