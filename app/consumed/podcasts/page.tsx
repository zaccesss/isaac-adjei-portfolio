// I render the Podcasts category listing, delegating to PodcastsContent for the interactive grid.

import type { Metadata } from "next"
import { Suspense } from "react"
import PodcastsContent from "./PodcastsContent"

export const metadata: Metadata = {
  title: "Audio",
  description: "Podcast episodes and shows listened to this year. Play them directly here where possible.",
  alternates: { canonical: "https://www.isaacadjei.me/consumed/podcasts" },
  openGraph: {
    images: ["/api/og?title=Audio%20%7C%20Consumed&description=Podcast%20episodes%20and%20shows%20listened%20to%20this%20year."],
  },
}

export default function PodcastsPage() {
  return (
    <Suspense>
      <PodcastsContent />
    </Suspense>
  )
}
