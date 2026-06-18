// I render the Music category listing, delegating to MusicContent for the interactive grid.

import type { Metadata } from "next"
import { Suspense } from "react"
import MusicContent from "./MusicContent"

export const metadata: Metadata = {
  title: "Music",
  description: "Artists and genres on heavy rotation this year. What shapes the mood of work sessions, commutes and quiet mornings.",
  alternates: { canonical: "https://www.isaacadjei.me/consumed/music" },
  openGraph: {
    images: ["/api/og?title=Music%20%7C%20Consumed&description=Artists%20and%20genres%20on%20heavy%20rotation%20this%20year."],
  },
}

export default function MusicPage() {
  return (
    <Suspense>
      <MusicContent />
    </Suspense>
  )
}
