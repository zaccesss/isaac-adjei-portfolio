// Site footer - shown at the bottom of every page.
// I calculate the copyright year dynamically so I never have to update it manually.
// The "More" column surfaces pages that aren't in the main nav so visitors can find them.

import Link from "next/link"
import SocialLinks from "@/components/shared/SocialLinks"
import FooterNewsletter from "@/components/layout/FooterNewsletter"

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t py-12">
      <div className="container flex flex-col items-center gap-10 text-center">
        <SocialLinks showLabel className="justify-center" />

        <FooterNewsletter />

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>&copy; {year} Isaac Adjei</span>
          <span aria-hidden="true">·</span>
          <Link
            href="/all-pages"
            className="hover:text-foreground transition-colors"
          >
            All Pages
          </Link>
          <span aria-hidden="true">·</span>
          <Link
            href="/privacy"
            className="hover:text-foreground transition-colors"
          >
            Privacy Policy
          </Link>
          <span aria-hidden="true">·</span>
          <Link
            href="/security-policy"
            className="hover:text-foreground transition-colors"
          >
            Security Policy
          </Link>
        </div>
      </div>
    </footer>
  )
}
