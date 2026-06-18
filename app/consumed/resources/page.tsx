// I render the Resources category listing, delegating to ResourcesContent for the interactive grid.

import type { Metadata } from "next"
import { Suspense } from "react"
import ResourcesContent from "./ResourcesContent"

export const metadata: Metadata = {
  title: "Resources",
  description: "Websites, tools, documentation and learning platforms worth returning to when studying, building or debugging.",
  alternates: { canonical: "https://www.isaacadjei.me/consumed/resources" },
  openGraph: {
    images: ["/api/og?title=Resources%20%7C%20Consumed&description=Websites%2C%20tools%20and%20learning%20platforms%20worth%20returning%20to."],
  },
}

export default function ResourcesPage() {
  return (
    <Suspense>
      <ResourcesContent />
    </Suspense>
  )
}
