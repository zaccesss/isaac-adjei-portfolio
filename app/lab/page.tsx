import type { Metadata } from "next"
import { Suspense } from "react"
import LabContent from "./LabContent"

export const metadata: Metadata = {
  title: "Lab",
  description: "An interactive terminal explorer. Run commands to browse posts, TIL entries, publications and live stats. Try typing help.",
  alternates: { canonical: "https://www.isaacadjei.me/lab" },
  openGraph: {
    images: ["/api/og?title=Lab%20%7C%20Isaac%20Adjei&description=An%20interactive%20terminal%20explorer.%20Try%20typing%20help."],
  },
}

export default function LabPage() {
  return (
    <Suspense>
      <LabContent />
    </Suspense>
  )
}
