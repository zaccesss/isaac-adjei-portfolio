"use client"

import { usePathname } from "next/navigation"
import NewsletterForm from "@/components/shared/NewsletterForm"
import { Separator } from "@/components/ui/separator"

export default function FooterNewsletter() {
  const pathname = usePathname()
  if (pathname === "/blog" || pathname === "/newsletter") return null

  return (
    <>
      <Separator className="max-w-xs" />
      <div className="flex flex-col items-center gap-3 w-full max-w-sm">
        <p className="text-sm font-medium">Stay in the loop</p>
        <p className="text-xs text-muted-foreground">
          Notes on tech, engineering, projects and more. Straight to your inbox.
        </p>
        <NewsletterForm variant="compact" />
        <p className="text-[11px] text-muted-foreground/70 text-center">
          Unsubscribe any time with one click.
        </p>
      </div>
    </>
  )
}
