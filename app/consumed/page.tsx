import type { Metadata } from "next"
import ConsumedContent from "./ConsumedContent"

export const metadata: Metadata = {
  title: "Consumed",
  description: "Videos, podcasts, books and music Isaac Adjei consumed in 2026.",
  alternates: {
    canonical: "https://www.isaacadjei.me/consumed",
  },
}

export default function ConsumedPage() {
  return <ConsumedContent />
}
