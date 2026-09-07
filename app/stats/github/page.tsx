import type { Metadata } from "next"
import GitHubStats from "@/components/shared/GitHubStats"
import GitHubYearlyChart from "@/components/stats/GitHubYearlyChart"
import GitHubActivityChart from "@/components/stats/GitHubActivityChart"
import { StatsPageHeader } from "@/components/stats/StatsPageHeader"
import { AnalyticsPeriodProvider, PeriodSelector } from "@/components/analytics"

export const metadata: Metadata = {
  title: "GitHub Stats",
  description: "My GitHub contribution history, top languages and top repos.",
  alternates: {
    canonical: "https://www.isaacadjei.me/stats/github",
  },
  openGraph: {
    images: ["/api/og?title=GitHub%20Stats&description=My%20GitHub%20contribution%20history%2C%20top%20languages%20and%20top%20repos."],
  },
}

export default function StatsGitHubPage() {
  return (
    <AnalyticsPeriodProvider defaultPeriod="90d">
      <div className="container max-w-3xl py-24 space-y-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <StatsPageHeader
            title="GitHub"
            description="A full year of contribution history, top languages and top repos, straight from my GitHub profile."
          />
          <PeriodSelector />
        </div>
        <GitHubActivityChart />
        <GitHubYearlyChart />
        <GitHubStats />
      </div>
    </AnalyticsPeriodProvider>
  )
}
