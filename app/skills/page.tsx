import type { Metadata } from "next"
import { Suspense } from "react"
import SkillsContent from "./SkillsContent"

export const metadata: Metadata = {
  title: "Skills",
  description: "Languages, frameworks, tools, hardware platforms and professional skills I have picked up through projects, coursework and work experience.",
  alternates: { canonical: "https://www.isaacadjei.me/skills" },
  openGraph: {
    images: ["/api/og?title=Skills%20%7C%20Isaac%20Adjei&description=Languages%2C%20frameworks%2C%20tools%20and%20hardware%20platforms%20in%20my%20stack."],
  },
}

export default function SkillsPage() {
  return (
    <Suspense>
      <SkillsContent />
    </Suspense>
  )
}
