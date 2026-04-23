import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: {
    absolute: "Isaac Adjei | EECS",
  },
  description:
    "Electronic Engineering and Computer Science student building full-stack software, embedded systems and IoT products.",
  openGraph: {
    title: "Isaac Adjei | EECS",
    description:
      "Electronic Engineering and Computer Science student building full-stack software, embedded systems and IoT products.",
    url: "https://www.isaacadjei.me/share",
    type: "website",
    images: ["https://www.isaacadjei.me/opengraph-image?v=20260424b"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Isaac Adjei | EECS",
    description:
      "Electronic Engineering and Computer Science student building full-stack software, embedded systems and IoT products.",
    images: ["https://www.isaacadjei.me/twitter-image?v=20260424b"],
  },
}

export default function SharePage() {
  return (
    <main className="container flex min-h-[60vh] items-center justify-center py-16">
      <div className="max-w-xl text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Isaac Adjei | EECS</h1>
        <p className="text-muted-foreground">
          Full-stack software, embedded systems and IoT projects.
        </p>
        <Link href="/" className="text-primary underline underline-offset-4">
          Visit portfolio
        </Link>
      </div>
    </main>
  )
}
