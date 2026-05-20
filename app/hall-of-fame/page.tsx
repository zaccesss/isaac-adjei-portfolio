// Hall of Fame - personal acknowledgements first, then security researchers.
// I wanted this page to lead with the people who matter most to me, not just
// a security disclosure list.

import type { Metadata } from "next"
import { Separator } from "@/components/ui/separator"
import { Trophy, Heart, Shield, Users } from "lucide-react"

export const metadata: Metadata = {
  title: "Hall of Fame",
  description:
    "The people I am most grateful for, and security researchers who have responsibly disclosed vulnerabilities on isaacadjei.me.",
  alternates: {
    canonical: "https://www.isaacadjei.me/hall-of-fame",
  },
}

// I add security researchers here as disclosures come in
const researchers: { name: string; contribution: string; date: string; link?: string }[] = []

export default function HallOfFamePage() {
  return (
    <div className="container max-w-3xl py-24 space-y-16">
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Trophy className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">Hall of Fame</h1>
        </div>
        <p className="text-lg text-muted-foreground leading-relaxed">
          The people without whom none of this would exist, and those who have helped keep
          this site safe.
        </p>
      </section>

      <Separator />

      {/* Personal acknowledgements */}
      <section className="space-y-8">
        <div className="flex items-center gap-2.5">
          <Heart className="h-5 w-5 text-primary shrink-0" />
          <h2 className="text-xl font-bold">People who made me</h2>
        </div>

        <div className="space-y-6">
          {/* God - given a distinct card to reflect how central faith is */}
          <div className="rounded-lg border border-primary/30 bg-primary/5 px-6 py-6 space-y-2">
            <div className="flex items-center gap-2">
              <p className="font-bold text-foreground text-base">God</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Everything starts here. My faith has been the constant through every difficult chapter.
              Losing my sight at two, losing my father, starting over in a new country. I do not take
              for granted that I am still standing and still building. Whatever I achieve, it is not
              by my own strength alone. This is all grounded in something much bigger than me.
            </p>
          </div>

          {/* Dad */}
          <div className="rounded-lg border border-border/60 bg-muted/20 px-6 py-5 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-foreground">Dad</p>
              <span className="text-xs font-mono text-muted-foreground">In memory</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              I carry him with me in every decision I make. He taught me what it looks like to
              work hard and lead with integrity. I did not get enough time with him, but what I
              had shaped the person I am becoming. This site, this work, this life is partly for
              him.
            </p>
          </div>

          {/* Mum */}
          <div className="rounded-lg border border-border/60 bg-muted/20 px-6 py-5 space-y-2">
            <p className="font-semibold text-foreground">Mum</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              She sacrificed more than I will ever fully understand to give me the chance to be
              here. Every late night studying, every project finished at 2am, every opportunity
              I chased was only possible because of what she gave up first. I owe her everything.
            </p>
          </div>
        </div>
      </section>

      <Separator />

      {/* My people - siblings, girlfriend, close friends */}
      <section className="space-y-8">
        <div className="flex items-center gap-2.5">
          <Users className="h-5 w-5 text-primary shrink-0" />
          <h2 className="text-xl font-bold">My people</h2>
        </div>

        <div className="space-y-6">
          {/* Younger brother */}
          <div className="rounded-lg border border-border/60 bg-muted/20 px-6 py-5 space-y-2">
            <p className="font-semibold text-foreground">My brother</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              My younger brother. Having a sibling who looks up to you is one of the greatest
              motivators I know. I want to show him what is possible.
            </p>
          </div>

          {/* Younger sister */}
          <div className="rounded-lg border border-border/60 bg-muted/20 px-6 py-5 space-y-2">
            <p className="font-semibold text-foreground">My sister</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The youngest of us three. She reminds me every day why it matters to keep going and
              to be someone worth looking up to.
            </p>
          </div>

          {/* Girlfriend */}
          <div className="rounded-lg border border-border/60 bg-muted/20 px-6 py-5 space-y-2">
            <p className="font-semibold text-foreground">My girlfriend</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The woman who pushes me. She holds me to a standard I would not always hold myself to,
              and she does it with patience and belief in equal measure. Having someone in your corner
              who genuinely wants to see you win changes everything.
            </p>
          </div>

          {/* Friends */}
          <div className="rounded-lg border border-border/60 bg-muted/20 px-6 py-5 space-y-2">
            <p className="font-semibold text-foreground">My friends</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              I do not have a large circle and I do not want one. The few people who have
              genuinely shown up and stayed consistent while I build know who they are. Quality
              over quantity, always.
            </p>
          </div>

          {/* Teachers */}
          <div className="rounded-lg border border-border/60 bg-muted/20 px-6 py-5 space-y-2">
            <p className="font-semibold text-foreground">My teachers</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every teacher who saw something in me and took the time to nurture it, from primary
              school through to university. The ones who challenged me, pushed back when I needed
              it and believed I could go further than I thought. Good teachers change the
              trajectory of a life and I have been fortunate to have had a few of them.
            </p>
          </div>

          {/* Church */}
          <div className="rounded-lg border border-border/60 bg-muted/20 px-6 py-5 space-y-2">
            <p className="font-semibold text-foreground">My church</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The community that has kept me grounded. Church has been a consistent source of
              strength, accountability and encouragement through every season. Having a community
              that prays with you, checks on you and reminds you of what really matters is
              something I do not take lightly.
            </p>
          </div>
        </div>
      </section>

      <Separator />

      {/* Security researchers */}
      <section className="space-y-6">
        <div className="flex items-center gap-2.5">
          <Shield className="h-5 w-5 text-primary shrink-0" />
          <h2 className="text-xl font-bold">Security Researchers</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Thank you to everyone who has responsibly disclosed security vulnerabilities on this
          site. Responsible disclosure helps keep the web safer for everyone.
        </p>

        {researchers.length === 0 ? (
          <div className="rounded-lg border border-border/60 bg-muted/30 px-6 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No disclosures yet. If you find a vulnerability, please see the{" "}
              <a href="/security-policy" className="text-primary underline underline-offset-4">
                Security Policy
              </a>{" "}
              for how to report it.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {researchers.map(({ name, contribution, date, link }) => (
              <div
                key={name}
                className="rounded-lg border border-border/60 bg-muted/20 px-5 py-4 flex items-start justify-between gap-4"
              >
                <div className="space-y-0.5">
                  {link ? (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-sm text-foreground hover:text-primary transition-colors"
                    >
                      {name}
                    </a>
                  ) : (
                    <p className="font-medium text-sm text-foreground">{name}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{contribution}</p>
                </div>
                <span className="text-xs font-mono text-muted-foreground shrink-0">{date}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
