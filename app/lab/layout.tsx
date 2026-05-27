import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Lab",
  description: "An interactive terminal for exploring isaacadjei.me.",
  alternates: {
    canonical: "https://www.isaacadjei.me/lab",
  },
  openGraph: {
    images: ["/api/og?title=Lab&description=An%20interactive%20terminal%20for%20exploring%20isaacadjei.me."],
  },
}

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
