"use client"

import { usePathname } from "next/navigation"
import NewsletterForm from "@/components/shared/NewsletterForm"

export default function FooterNewsletter() {
  const pathname = usePathname()
  if (pathname === "/blog" || pathname === "/newsletter") return null

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-sm">
      <p className="text-xs text-muted-foreground">Notes on tech, engineering and projects - straight to your inbox.</p>
      <NewsletterForm variant="compact" />
    </div>
  )
}
