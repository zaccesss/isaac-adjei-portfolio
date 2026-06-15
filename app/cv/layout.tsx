// I set CV section metadata wrapping the CV picker and cover letter pages.

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "CV",
  description: "My curriculum vitae - Electronic Engineering and Computer Science student at Aston University.",
  robots: { index: false, follow: false },
  alternates: {
    canonical: "https://www.isaacadjei.me/cv",
  },
  openGraph: {
    images: ["/api/og?title=CV&description=My%20curriculum%20vitae%20-%20Electronic%20Engineering%20and%20Computer%20Science%20student%20at%20Aston%20University."],
  },
}

export default function CVLayout({ children }: { children: React.ReactNode }) {
  return children
}
