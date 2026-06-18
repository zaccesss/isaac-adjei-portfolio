// I render the Articles category listing, delegating to ArticlesContent for the interactive grid.

import type { Metadata } from "next"
import { Suspense } from "react"
import ArticlesContent from "./ArticlesContent"

export const metadata: Metadata = {
  title: "Articles",
  description: "Essays and long-form writing worth reading. Things that made me think or changed my perspective.",
  alternates: { canonical: "https://www.isaacadjei.me/consumed/articles" },
  openGraph: {
    images: ["/api/og?title=Articles%20%7C%20Consumed&description=Essays%20and%20long-form%20writing%20worth%20reading."],
  },
}

export default function ArticlesPage() {
  return (
    <Suspense>
      <ArticlesContent />
    </Suspense>
  )
}
