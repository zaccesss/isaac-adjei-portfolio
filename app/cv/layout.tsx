import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "CV",
  description: "My curriculum vitae - Electronic Engineering and Computer Science student at Aston University.",
  alternates: {
    canonical: "https://www.isaacadjei.me/cv",
  },
}

export default function CVLayout({ children }: { children: React.ReactNode }) {
  return children
}
