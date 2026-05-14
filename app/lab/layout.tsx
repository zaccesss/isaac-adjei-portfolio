import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Lab",
  description: "An interactive terminal for exploring isaacadjei.me.",
  alternates: {
    canonical: "https://www.isaacadjei.me/lab",
  },
}

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
