// My all-pages directory - every public page on this site in one place.
// I link this from the footer and from the lab terminal (type 'pages').
// Private pages are not listed here.

import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { CommandShortcut } from "@/components/shared/CommandShortcut"

export const metadata: Metadata = {
  title: "All Pages",
  description: "Every public page on isaacadjei.me in one place.",
  alternates: {
    canonical: "https://www.isaacadjei.me/all-pages",
  },
}

const PAGE_GROUPS = [
  {
    heading: "Main",
    pages: [
      { href: "/",            label: "Home",        description: "Start here" },
      { href: "/about",       label: "About",       description: "Who I am" },
      { href: "/projects",    label: "Projects",    description: "Things I have built" },
      { href: "/experience",  label: "Experience",  description: "Where I have worked" },
      { href: "/skills",      label: "Skills",      description: "What I can do" },
      { href: "/blog",        label: "Blog",        description: "Writing" },
      { href: "/notes",       label: "Notes",       description: "What I am thinking" },
      { href: "/contact",     label: "Contact",     description: "Get in touch" },
      { href: "/links",       label: "Links",       description: "Profiles and external links" },
    ],
  },
  {
    heading: "More",
    pages: [
      { href: "/now",         label: "Now",         description: "What I am doing right now" },
      { href: "/uses",        label: "Uses",        description: "Hardware, software and tools I use" },
      { href: "/colophon",    label: "Colophon",    description: "How this site is built" },
      { href: "/changelog",   label: "Changelog",   description: "Full history of changes to this site" },
      { href: "/newsletter",  label: "Newsletter",  description: "Subscribe for updates" },
      { href: "/hall-of-fame",label: "Hall of Fame",description: "Acknowledgements and security researchers" },
      { href: "/consumed",    label: "Consumed",    description: "Books, videos and podcasts I am working through" },
      { href: "/lab",         label: "Lab",         description: "Interactive terminal and GitHub stats" },
      { href: "/cv",          label: "CV",          description: "View and download my CV" },
    ],
  },
]

export default function AllPagesPage() {
  return (
    <div className="container max-w-2xl py-24 space-y-14">
      <section className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">All Pages</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Every public page on this site. Use{" "}
          <CommandShortcut />{" "}
          to search them instantly from anywhere, or type{" "}
          <Link href="/lab" className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-mono text-primary hover:bg-primary/20 transition-colors">pages</Link>{" "}
          in the lab terminal.
        </p>
      </section>

      <div className="space-y-12">
        {PAGE_GROUPS.map(({ heading, pages }) => (
          <section key={heading} className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {heading}
            </h2>
            <ul className="space-y-1">
              {pages.map(({ href, label, description }) => (
                <li key={href}>
                  <Link
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between rounded-md px-3 py-2.5 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-28 shrink-0 font-mono text-xs text-muted-foreground">
                        {href}
                      </span>
                      <div>
                        <p className="text-sm font-medium group-hover:text-primary transition-colors">
                          {label}
                        </p>
                        <p className="text-xs text-muted-foreground">{description}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
