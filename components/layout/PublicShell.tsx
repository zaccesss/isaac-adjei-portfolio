"use client"

// I wrap every public page with Header, MobileBanner and Footer. Dashboard routes
// bypass this entirely and render their own sidebar layout instead.

import { usePathname } from "next/navigation"
import Header from "./Header"
import Footer from "./Footer"
import MobileBanner from "./MobileBanner"

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Dashboard routes render their own sidebar layout and the maintenance page renders bare (no header,
  // footer or nav) so a locked-out visitor sees no links out of it.
  if (pathname.startsWith("/dashboard") || pathname === "/maintenance") return <>{children}</>

  return (
    <div className="relative flex min-h-dvh flex-col">
      <Header />
      <MobileBanner />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
