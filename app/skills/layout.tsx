import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Skills",
  description: "Technical skills, tools and technologies I work with.",
  alternates: {
    canonical: "https://www.isaacadjei.me/skills",
  },
}

export default function SkillsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
