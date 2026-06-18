import type { Metadata } from "next"
import { Suspense } from "react"
import LinksContent from "./LinksContent"

export const metadata: Metadata = {
  title: "Links",
  description: "All my social profiles, coding platforms, creative channels and professional links in one place.",
  alternates: { canonical: "https://www.isaacadjei.me/links" },
  openGraph: {
    images: ["/api/og?title=Links%20%7C%20Isaac%20Adjei&description=All%20my%20social%20profiles%2C%20coding%20platforms%20and%20professional%20links%20in%20one%20place."],
  },
}

export default function LinksPage() {
  return (
    <Suspense>
      <LinksContent />
    </Suspense>
  )
}
