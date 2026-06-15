// I set Skills section metadata.

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Skills",
  description: "Technical skills, tools and technologies I work with.",
  alternates: {
    canonical: "https://www.isaacadjei.me/skills",
  },
  openGraph: {
    images: ["/api/og?title=Skills&description=Technical%20skills%2C%20tools%20and%20technologies%20I%20work%20with."],
  },
}

export default function SkillsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
