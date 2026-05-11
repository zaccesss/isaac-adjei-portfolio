import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blog",
  description: "Writing on tech, engineering and ideas.",
  alternates: {
    canonical: "https://isaacadjei.me/blog",
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
