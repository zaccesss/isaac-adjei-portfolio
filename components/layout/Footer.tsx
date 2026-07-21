// Site footer - shown at the bottom of every page.
// I calculate the copyright year dynamically so I never have to update it manually.
// The "More" column surfaces pages that aren't in the main nav so visitors can find them.

import Link from "next/link"
import SocialLinks from "@/components/shared/SocialLinks"

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t py-12">
      <div className="container flex flex-col items-center gap-6 text-center">
        <SocialLinks showLabel footerOnly className="justify-center" />

        <div className="flex items-center flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <Link href="/now" className="hover:text-foreground transition-colors">Now</Link>
          <span aria-hidden="true">·</span>
          <Link href="/lab" className="hover:text-foreground transition-colors">Lab</Link>
          <span aria-hidden="true">·</span>
          <Link href="/notes" className="hover:text-foreground transition-colors">Notes</Link>
          <span aria-hidden="true">·</span>
          <Link href="/consumed" className="hover:text-foreground transition-colors">Consumed</Link>
          <span aria-hidden="true">·</span>
          <Link href="/respub" className="hover:text-foreground transition-colors">Research</Link>
          <span aria-hidden="true">·</span>
          <Link href="/tags" className="hover:text-foreground transition-colors">Tags</Link>
          <span aria-hidden="true">·</span>
          <Link href="/search" className="hover:text-foreground transition-colors">Search</Link>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/security-policy" className="hover:text-foreground transition-colors">
              Security Policy
            </Link>
            <span aria-hidden="true">·</span>
            <a
              href="https://status.isaacadjei.me"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Status
            </a>
          </div>
          <span className="text-xs text-muted-foreground">&copy; {year} Isaac Adjei</span>
        </div>
      </div>
    </footer>
  )
}
