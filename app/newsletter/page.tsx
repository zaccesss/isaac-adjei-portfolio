import type { Metadata } from "next"
import { Separator } from "@/components/ui/separator"
import { Mail } from "lucide-react"
import NewsletterForm from "@/components/shared/NewsletterForm"

export const metadata: Metadata = {
  title: "Newsletter",
  description:
    "Subscribe to my newsletter — engineering, tech, hardware, software and more from Isaac Adjei.",
  alternates: {
    canonical: "https://www.isaacadjei.me/newsletter",
  },
}

export default function NewsletterPage() {
  return (
    <div className="container max-w-2xl py-24 space-y-16">
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Mail className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">Newsletter</h1>
        </div>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Notes from the intersection of hardware and software. Engineering write-ups, project
          breakdowns, tech reflections and things I am learning and building — straight to your
          inbox.
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-center gap-2 text-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
            Engineering and embedded systems deep-dives
          </li>
          <li className="flex items-center gap-2 text-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
            Full-stack software and hardware project breakdowns
          </li>
          <li className="flex items-center gap-2 text-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
            University journal entries and placement reflections
          </li>
          <li className="flex items-center gap-2 text-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
            Tech, tools and ideas worth sharing
          </li>
        </ul>
      </section>

      <Separator />

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Subscribe</h2>
        <p className="text-muted-foreground">
          Join the list. No spam, no fluff. Unsubscribe anytime.
        </p>
        <NewsletterForm />
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Past issues</h2>
        <p className="text-muted-foreground">
          No issues published yet — subscribe to be first when they go out.
        </p>
      </section>
    </div>
  )
}
