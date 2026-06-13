import { Suspense } from "react"
import type { Metadata } from "next"
import ConsumedContent from "./ConsumedContent"

export const metadata: Metadata = {
  title: "Consumed",
  description: "Videos, podcasts, books and music Isaac Adjei consumed in 2026.",
  alternates: {
    canonical: "https://www.isaacadjei.me/consumed",
  },
  openGraph: {
    images: ["/api/og?title=Consumed%202026&description=Videos%2C%20podcasts%2C%20books%20and%20music%20Isaac%20Adjei%20consumed%20in%202026%2E"],
  },
}

export default function ConsumedPage() {
  return (
    <Suspense>
      <ConsumedContent />
    </Suspense>
  )
}
