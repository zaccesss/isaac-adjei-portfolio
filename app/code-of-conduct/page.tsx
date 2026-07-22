// I publish my code of conduct, the standard I hold for taking part anywhere I build, across every
// project, software or hardware, public or private, and on this website. It is the Contributor
// Covenant 2.1, adopted in full, with a short personal note on how to reach me.

import type { Metadata } from "next"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  Info,
  Heart,
  ScrollText,
  Gavel,
  Globe,
  Mail,
  ListChecks,
  BookMarked,
  Github,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Code of Conduct",
  description:
    "The code of conduct for all my projects, software or hardware, public or private: the Contributor Covenant 2.1, adopted in full.",
  alternates: {
    canonical: "https://www.isaacadjei.me/code-of-conduct",
  },
  openGraph: {
    images: ["/api/og?title=Code%20of%20Conduct&description=The%20standard%20I%20hold%20for%20taking%20part%20anywhere%20I%20build%2E"],
  },
}

export default function CodeOfConductPage() {
  return (
    <div className="container max-w-3xl py-24 space-y-16">
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">Code of Conduct</h1>
        </div>
        <p className="text-sm text-muted-foreground font-mono">Last updated: July 2026</p>
        <p className="text-lg text-muted-foreground leading-relaxed">
          This is the code of conduct for all my projects, software or hardware, public or private,
          and for this website. I keep the full version here in one place so every repository can point
          to it.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          I want anywhere I build to be somewhere people can take part without being harassed or
          belittled, whether they are opening an issue, leaving a comment, sending a change or helping
          with a hardware build.
        </p>
        <Alert className="border-primary/30 [&>svg]:text-primary">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-muted-foreground">
            To report a concern, reach me privately at{" "}
            <a
              href="mailto:contact@isaacadjei.me"
              className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              contact@isaacadjei.me
            </a>{" "}
            or through my{" "}
            <Link
              href="/contact"
              className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              contact page
            </Link>
            . I will handle it discreetly.
          </AlertDescription>
        </Alert>
        <p className="text-muted-foreground leading-relaxed">
          The rest is the Contributor Covenant, the widely used community standard, which I adopt in
          full.
        </p>
        <p className="text-sm text-muted-foreground">
          <a
            href="https://github.com/zaccesss/code-of-conduct"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
          >
            <Github className="h-4 w-4" />
            Also on GitHub: zaccesss/code-of-conduct
          </a>
        </p>
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Heart className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Our Pledge</h2>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          We as members, contributors, and leaders pledge to make participation in our community a
          harassment-free experience for everyone, regardless of age, body size, visible or invisible
          disability, ethnicity, sex characteristics, gender identity and expression, level of
          experience, education, socio-economic status, nationality, personal appearance, race,
          religion, or sexual identity and orientation.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          We pledge to act and interact in ways that contribute to an open, welcoming, diverse,
          inclusive, and healthy community.
        </p>
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <ScrollText className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Our Standards</h2>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Examples of behavior that contributes to a positive environment for our community include:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Demonstrating empathy and kindness toward other people</li>
          <li>Being respectful of differing opinions, viewpoints, and experiences</li>
          <li>Giving and gracefully accepting constructive feedback</li>
          <li>Accepting responsibility and apologizing to those affected by our mistakes, and learning from the experience</li>
          <li>Focusing on what is best not just for us as individuals, but for the overall community</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed">
          Examples of unacceptable behavior include:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>The use of sexualized language or imagery, and sexual attention or advances of any kind</li>
          <li>Trolling, insulting or derogatory comments, and personal or political attacks</li>
          <li>Public or private harassment</li>
          <li>Publishing others&apos; private information, such as a physical or email address, without their explicit permission</li>
          <li>Other conduct which could reasonably be considered inappropriate in a professional setting</li>
        </ul>
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Gavel className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Enforcement Responsibilities</h2>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Community leaders are responsible for clarifying and enforcing our standards of acceptable
          behavior and will take appropriate and fair corrective action in response to any behavior
          that they deem inappropriate, threatening, offensive, or harmful.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Community leaders have the right and responsibility to remove, edit, or reject comments,
          commits, code, wiki edits, issues, and other contributions that are not aligned to this Code
          of Conduct, and will communicate reasons for moderation decisions when appropriate.
        </p>
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Globe className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Scope</h2>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          This Code of Conduct applies within all community spaces, and also applies when an individual
          is officially representing the community in public spaces. Examples of representing our
          community include using an official e-mail address, posting via an official social media
          account, or acting as an appointed representative at an online or offline event.
        </p>
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Mail className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Enforcement</h2>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Instances of abusive, harassing, or otherwise unacceptable behavior may be reported to the
          community leaders responsible for enforcement at{" "}
          <a
            href="mailto:contact@isaacadjei.me"
            className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
          >
            contact@isaacadjei.me
          </a>
          . All complaints will be reviewed and investigated promptly and fairly.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          All community leaders are obligated to respect the privacy and security of the reporter of
          any incident.
        </p>
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <ListChecks className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Enforcement Guidelines</h2>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Community leaders will follow these Community Impact Guidelines in determining the
          consequences for any action they deem in violation of this Code of Conduct:
        </p>

        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">1. Correction</h3>
            <p className="text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Community Impact:</span> Use of
              inappropriate language or other behavior deemed unprofessional or unwelcome in the
              community.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Consequence:</span> A private, written
              warning from community leaders, providing clarity around the nature of the violation and
              an explanation of why the behavior was inappropriate. A public apology may be requested.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">2. Warning</h3>
            <p className="text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Community Impact:</span> A violation through
              a single incident or series of actions.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Consequence:</span> A warning with
              consequences for continued behavior. No interaction with the people involved, including
              unsolicited interaction with those enforcing the Code of Conduct, for a specified period
              of time. This includes avoiding interactions in community spaces as well as external
              channels like social media. Violating these terms may lead to a temporary or permanent
              ban.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">3. Temporary Ban</h3>
            <p className="text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Community Impact:</span> A serious violation
              of community standards, including sustained inappropriate behavior.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Consequence:</span> A temporary ban from any
              sort of interaction or public communication with the community for a specified period of
              time. No public or private interaction with the people involved, including unsolicited
              interaction with those enforcing the Code of Conduct, is allowed during this period.
              Violating these terms may lead to a permanent ban.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">4. Permanent Ban</h3>
            <p className="text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Community Impact:</span> Demonstrating a
              pattern of violation of community standards, including sustained inappropriate behavior,
              harassment of an individual, or aggression toward or disparagement of classes of
              individuals.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Consequence:</span> A permanent ban from any
              sort of public interaction within the community.
            </p>
          </div>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <BookMarked className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Attribution</h2>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          This Code of Conduct is adapted from the{" "}
          <a
            href="https://www.contributor-covenant.org"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
          >
            Contributor Covenant
          </a>
          , version 2.1, available at{" "}
          <a
            href="https://www.contributor-covenant.org/version/2/1/code_of_conduct.html"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
          >
            contributor-covenant.org/version/2/1
          </a>
          .
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Community Impact Guidelines were inspired by{" "}
          <a
            href="https://github.com/mozilla/diversity"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
          >
            Mozilla&apos;s code of conduct enforcement ladder
          </a>
          . For answers to common questions about this code of conduct, see the{" "}
          <a
            href="https://www.contributor-covenant.org/faq"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
          >
            FAQ
          </a>
          . Translations are available at{" "}
          <a
            href="https://www.contributor-covenant.org/translations"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
          >
            contributor-covenant.org/translations
          </a>
          .
        </p>
      </section>
    </div>
  )
}
