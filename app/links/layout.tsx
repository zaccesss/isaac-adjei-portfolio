import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Links",
  description: "All my profiles, social links and platforms in one place.",
  alternates: {
    canonical: "https://www.isaacadjei.me/links",
  },
}

export default function LinksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
