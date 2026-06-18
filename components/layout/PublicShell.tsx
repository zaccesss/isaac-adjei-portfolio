"use client"

// I wrap every public page with Header, MobileBanner and Footer. Dashboard routes
// bypass this entirely and render their own sidebar layout instead.

import { usePathname } from "next/navigation"
import Header from "./Header"
import Footer from "./Footer"
import MobileBanner from "./MobileBanner"

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname.startsWith("/dashboard")

  if (isDashboard) return <>{children}</>

  return (
    <div className="relative flex min-h-dvh flex-col">
      <Header />
      <MobileBanner />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
