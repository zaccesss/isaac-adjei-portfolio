// I publish where to get help across my projects and this website, so a question always has a clear
// route: discussions, an issue, my support email or my contact page.

import type { Metadata } from "next"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  LifeBuoy,
  MessagesSquare,
  Bug,
  Mail,
  Info,
  ShieldAlert,
  BookOpen,
  Github,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Support",
  description: "Where to get help on my projects and this website: discussions, an issue, my support email or my contact page.",
  alternates: {
    canonical: "https://www.isaacadjei.me/support",
  },
  openGraph: {
    images: ["/api/og?title=Support&description=Where%20to%20get%20help%20on%20my%20projects%20and%20this%20website%2E"],
  },
}

export default function SupportPage() {
  return (
    <div className="container max-w-3xl py-24 space-y-16">
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <LifeBuoy className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">Support</h1>
        </div>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Need help or have a question? Whether it is one of my software or hardware projects, a
          course, or something on this website, here is how to reach me.
        </p>
        <p className="text-sm text-muted-foreground">
          <a
            href="https://github.com/zaccesss/.github/blob/main/SUPPORT.md"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
          >
            <Github className="h-4 w-4" />
            Also on GitHub: zaccesss/.github SUPPORT
          </a>
        </p>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Ways to get help</h2>
        <div className="space-y-5 text-muted-foreground leading-relaxed">
          <div className="flex gap-3">
            <MessagesSquare className="h-5 w-5 text-primary shrink-0 mt-1" />
            <p>
              <span className="font-medium text-foreground">Questions and ideas.</span> Use the
              repository&apos;s Discussions if it has them. It keeps the conversation in the open, where
              others with the same question can find it.
            </p>
          </div>
          <div className="flex gap-3">
            <Bug className="h-5 w-5 text-primary shrink-0 mt-1" />
            <p>
              <span className="font-medium text-foreground">Something broken?</span> Open an issue on
              the repository with the details: what you did, what you expected and what happened. The{" "}
              <Link
                href="/contribute"
                className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
              >
                contributing guide
              </Link>{" "}
              explains what to include, including hardware setups.
            </p>
          </div>
          <div className="flex gap-3">
            <BookOpen className="h-5 w-5 text-primary shrink-0 mt-1" />
            <p>
              <span className="font-medium text-foreground">More about me and my work.</span> Browse my{" "}
              <Link
                href="/projects"
                className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
              >
                projects
              </Link>{" "}
              or my repositories on{" "}
              <a
                href="https://github.com/zaccesss"
                target="_blank"
                rel="noreferrer"
                className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
              >
                GitHub
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Mail className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Reach me directly</h2>
        </div>
        <Alert className="border-primary/30 [&>svg]:text-primary">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-muted-foreground">
            For help, email me at{" "}
            <a
              href="mailto:support@isaacadjei.me"
              className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              support@isaacadjei.me
            </a>
            .
          </AlertDescription>
        </Alert>
        <p className="text-muted-foreground leading-relaxed">
          For anything else, use{" "}
          <a
            href="mailto:contact@isaacadjei.me"
            className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
          >
            contact@isaacadjei.me
          </a>{" "}
          or my{" "}
          <Link
            href="/contact"
            className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
          >
            contact page
          </Link>
          .
        </p>
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Security</h2>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          For a security issue, follow my{" "}
          <Link
            href="/security-policy"
            className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
          >
            security policy
          </Link>{" "}
          rather than posting publicly.
        </p>
      </section>
    </div>
  )
}
