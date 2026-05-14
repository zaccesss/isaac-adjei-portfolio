// Site footer - shown at the bottom of every page.
// I calculate the copyright year dynamically so I never have to update it manually.

import SocialLinks from "@/components/shared/SocialLinks"
import FooterNewsletter from "@/components/layout/FooterNewsletter"

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t py-12">
      <div className="container flex flex-col items-center gap-8 text-center">
        <SocialLinks showLabel className="justify-center" />

        <FooterNewsletter />

        <p className="text-xs text-muted-foreground">&copy; {year} Isaac Adjei</p>
      </div>
    </footer>
  )
}
