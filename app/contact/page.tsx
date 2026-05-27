// Contact page - renders the ContactForm and shows my social links below it.

import type { Metadata } from "next"
import ContactForm from "@/components/forms/ContactForm"
import SocialLinks from "@/components/shared/SocialLinks"
import { Mail } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Isaac Adjei.",
  alternates: {
    canonical: "https://www.isaacadjei.me/contact",
  },
  openGraph: {
    images: ["/api/og?title=Contact&description=Get%20in%20touch%20with%20Isaac%20Adjei%2E"],
  },
}

export default function ContactPage() {
  return (
    <div className="container max-w-2xl py-24 space-y-10">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Mail className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">Get in Touch</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Whether it&apos;s an internship, a collaboration, a project idea, a suggestion or just
          a conversation, I am always open to hearing from you. Feedback, ideas and honest opinions
          are just as welcome as opportunities.
        </p>
      </div>
      <ContactForm />
      <div className="pt-4">
        <p className="text-sm text-muted-foreground mb-4">Or find me on:</p>
        <SocialLinks />
      </div>
    </div>
  )
}
