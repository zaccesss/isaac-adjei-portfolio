// I publish my coordinated disclosure and security reporting policy for responsible vulnerability disclosure.

import type { Metadata } from "next"
import { Separator } from "@/components/ui/separator"
import { ShieldCheck, Mail, Clock, Eye } from "lucide-react"

export const metadata: Metadata = {
  title: "Security Policy",
  description: "How to responsibly disclose security vulnerabilities on isaacadjei.me.",
  alternates: {
    canonical: "https://www.isaacadjei.me/security-policy",
  },
  openGraph: {
    images: ["/api/og?title=Security%20Policy&description=How%20to%20responsibly%20disclose%20security%20vulnerabilities%20on%20isaacadjei%2Eme%2E"],
  },
}

export default function SecurityPolicyPage() {
  return (
    <div className="container max-w-3xl py-24 space-y-16">
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">Security Policy</h1>
        </div>
        <p className="text-lg text-muted-foreground leading-relaxed">
          I take the security of this site seriously. If you have discovered a vulnerability, I
          appreciate you letting me know responsibly.
        </p>
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Eye className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Scope</h2>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          This policy covers <span className="font-medium text-foreground">isaacadjei.me</span> and
          all its subdomains. It does not cover third-party services or infrastructure I do not
          control.
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Cross-site scripting (XSS)</li>
          <li>Cross-site request forgery (CSRF)</li>
          <li>Authentication or authorisation bypass</li>
          <li>Sensitive data exposure</li>
          <li>Server-side injection vulnerabilities</li>
        </ul>
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Mail className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">How to Report</h2>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Please send vulnerability reports by email to{" "}
          <a
            href="mailto:contact@isaacadjei.me"
            className="text-primary underline underline-offset-4"
          >
            contact@isaacadjei.me
          </a>{" "}
          with the subject line <span className="font-mono text-sm">Security Disclosure</span>.
          Include a clear description of the issue, steps to reproduce and any supporting evidence
          such as screenshots or proof-of-concept code.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Please do not publicly disclose the issue until I have had a reasonable opportunity to
          investigate and address it.
        </p>
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Clock className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Response Timeline</h2>
        </div>
        <div className="space-y-2 text-muted-foreground">
          <p>I aim to respond to all reports within the following timeframes:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Initial acknowledgement within <span className="font-medium text-foreground">3 business days</span></li>
            <li>Assessment and triage within <span className="font-medium text-foreground">7 business days</span></li>
            <li>Resolution or mitigation plan within <span className="font-medium text-foreground">30 days</span> for valid issues</li>
          </ul>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Good Faith</h2>
        <p className="text-muted-foreground leading-relaxed">
          I will not take legal action against researchers who act in good faith, follow this policy
          and do not access, modify or delete data beyond what is needed to demonstrate the
          vulnerability. Valid reporters will be acknowledged on the{" "}
          <a href="/hall-of-fame" className="text-primary underline underline-offset-4">
            Hall of Fame
          </a>
          .
        </p>
      </section>
    </div>
  )
}
