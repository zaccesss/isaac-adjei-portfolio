// I set Links section metadata wrapping the links directory page.

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Links",
  description: "All my profiles, social links and platforms in one place.",
  alternates: {
    canonical: "https://www.isaacadjei.me/links",
  },
  openGraph: {
    images: ["/api/og?title=Links&description=All%20my%20profiles%2C%20social%20links%20and%20platforms%20in%20one%20place."],
  },
}

export default function LinksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
