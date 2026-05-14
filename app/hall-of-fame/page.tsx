import type { Metadata } from "next"
import { Separator } from "@/components/ui/separator"
import { Trophy } from "lucide-react"

export const metadata: Metadata = {
  title: "Hall of Fame",
  description:
    "Acknowledging security researchers who have responsibly disclosed vulnerabilities on isaacadjei.me.",
  alternates: {
    canonical: "https://www.isaacadjei.me/hall-of-fame",
  },
}

export default function HallOfFamePage() {
  return (
    <div className="container max-w-3xl py-24 space-y-16">
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Trophy className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">Hall of Fame</h1>
        </div>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Thank you to everyone who has responsibly disclosed security vulnerabilities on this site.
          Responsible disclosure helps keep the web safer for everyone.
        </p>
      </section>

      <Separator />

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Acknowledged Researchers</h2>
        <div className="rounded-lg border border-border/60 bg-muted/30 px-6 py-8 text-center">
          <p className="text-muted-foreground">
            No disclosures yet. If you find a vulnerability, please see the{" "}
            <a href="/security-policy" className="text-primary underline underline-offset-4">
              Security Policy
            </a>{" "}
            for how to report it.
          </p>
        </div>
      </section>
    </div>
  )
}
