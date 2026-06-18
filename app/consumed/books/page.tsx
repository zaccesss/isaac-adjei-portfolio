// I render the Books category listing, delegating to BooksContent for the interactive grid.

import type { Metadata } from "next"
import { Suspense } from "react"
import BooksContent from "./BooksContent"

export const metadata: Metadata = {
  title: "Books",
  description: "Books read or worked through this year across engineering, software, science and life.",
  alternates: { canonical: "https://www.isaacadjei.me/consumed/books" },
  openGraph: {
    images: ["/api/og?title=Books%20%7C%20Consumed&description=Books%20read%20or%20worked%20through%20this%20year%20across%20engineering%2C%20software%20and%20life."],
  },
}

export default function BooksPage() {
  return (
    <Suspense>
      <BooksContent />
    </Suspense>
  )
}
