// I render the research and publications page listing conference papers, reports and talks.

import type { Metadata } from "next"
import Link from "next/link"
import { Download, FileText, Mail } from "lucide-react"
import { FaLinkedin } from "react-icons/fa6"
import { SiZenodo, SiOrcid, SiGooglescholar, SiResearchgate } from "react-icons/si"
import { publications } from "@/data/respub"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Research & Publications",
  description:
    "What Isaac Adjei researches, writes up and formally publishes. Citable papers, technical notes and open-source curricula, with links to every record.",
  alternates: {
    canonical: "https://www.isaacadjei.me/respub",
  },
  openGraph: {
    images: [
      "/api/og?title=Research%20%26%20Publications&description=Academic%20publications%20and%20research%20by%20Isaac%20Adjei",
    ],
  },
}

const typeLabel: Record<string, string> = {
  "technical-note": "Technical Note",
  conference: "Conference Paper",
  journal: "Journal Article",
  preprint: "Preprint",
}

const ITEMS_PER_PAGE = 6

const researchInterests = [
  {
    area: "Embedded Systems & Real-Time Computing",
    detail:
      "Bare-metal firmware development on STM32 and AVR microcontrollers. Real-time operating systems: FreeRTOS task scheduling, preemptive multitasking, inter-task communication via queues and semaphores, priority inversion and deadline analysis. Peripheral interfacing: UART, SPI, I2C, GPIO, ADC, PWM and DMA. Building deterministic control loops for motor drivers, sensor fusion pipelines and IoT edge nodes.",
  },
  {
    area: "Computer Architecture & Hardware Design",
    detail:
      "Digital logic design and FPGA development using VHDL. Instruction set architecture internals: pipelining, hazard detection, branch prediction and memory hierarchy. Hardware-software co-design, choosing what belongs in silicon versus firmware. Low-level systems programming in C where every byte and clock cycle matters. Processor bring-up, bootloaders and linker scripts.",
  },
  {
    area: "Artificial Intelligence, Machine Learning & Data Science",
    detail:
      "Supervised and unsupervised learning, neural network architectures and model evaluation. Competing on Kaggle and applying data science methods to real engineering problems. Interest in TinyML: deploying lightweight inference models on microcontrollers where compute and memory are scarce. Exploratory data analysis, feature engineering and visualisation pipelines.",
  },
  {
    area: "Cybersecurity & Ethical Hacking",
    detail:
      "CTF competitions covering web exploitation, binary exploitation, reverse engineering, cryptography and forensics. Vulnerability research, responsible disclosure and threat modelling. Security in embedded systems: memory-safe C patterns, stack canaries, secure boot, firmware authentication and side-channel awareness. Learning paths on TryHackMe and hands-on lab environments.",
  },
  {
    area: "Software Engineering Education & Open-Source Curricula",
    detail:
      "Designing open-source learning materials that lower the barrier to entry for version control, collaborative development and software engineering practice. The git-unlocked curriculum (published on Zenodo, 2026) is the first output of this line of work. Interest in evidence-based pedagogical approaches, peer learning structures and self-directed technical education.",
  },
  {
    area: "Algorithms, Competitive Programming & Problem Solving",
    detail:
      "Active on LeetCode, Codeforces, AtCoder, CodeChef and HackerRank. Algorithmic topics: dynamic programming, graph theory, segment trees, binary search, greedy methods and number theory. Competitive programming as a discipline for building intuition about time and space complexity under pressure.",
  },
  {
    area: "Full-Stack & Systems Web Development",
    detail:
      "Building performant, accessible web applications with Next.js, React and TypeScript. Interest in the systems layer: edge runtimes (Cloudflare Workers), serverless function latency, CDN cache invalidation, real-time data pipelines and WebSocket-based presence systems. Bridging the gap between hardware projects and the web interfaces that surface them.",
  },
  {
    area: "Hardware Maker Projects & Electronics",
    detail:
      "PCB design, soldering, component selection and debugging physical circuits. Published hardware projects on Hackster. Interest in the intersection of maker culture and rigorous engineering: building things that work reliably in the real world, not just in simulation.",
  },
]

export default async function ResearchPublicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const totalPages = Math.ceil(publications.length / ITEMS_PER_PAGE)
  const currentPage = Math.max(1, Math.min(parseInt(pageParam ?? "1", 10), totalPages || 1))
  const paginated = publications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <div className="container max-w-3xl py-24 space-y-16">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Research &amp; Publications</h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          What I research, write up and formally publish. Citable papers, technical notes and
          open-source curricula, with links to every record so you can find, cite or build on
          the work.
        </p>

        {/* Academic profile links */}
        <div className="flex items-center gap-4 flex-wrap">
          <a
            href="mailto:academic@isaacadjei.me"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Mail className="h-5 w-5 shrink-0" />
            <span className="text-primary hover:underline">academic@isaacadjei.me</span>
          </a>
          {([
            { Icon: SiOrcid,        label: "ORCID",         href: "https://orcid.org/0009-0001-8298-5098" },
            { Icon: SiGooglescholar,label: "Google Scholar", href: "https://scholar.google.com/citations?user=YZq0XuMAAAAJ" },
            { Icon: SiResearchgate, label: "ResearchGate",  href: "https://www.researchgate.net/profile/Isaac-Adjei-15" },
            { Icon: FaLinkedin,     label: "LinkedIn",      href: "https://www.linkedin.com/in/isaacadjei" },
          ] as const).map(({ Icon, label, href }) => (
            <Link
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="text-primary hover:underline">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Publications */}
      <section className="space-y-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Publications
        </h2>

        {publications.length === 0 ? (
          <p className="text-sm text-muted-foreground">No publications yet.</p>
        ) : (
          <>
            <div className="space-y-6">
              {paginated.map((pub) => (
                <div key={pub.id} className="rounded-xl border bg-card p-6 space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      {typeLabel[pub.type] ?? pub.type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {pub.venue} · {pub.year}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold leading-snug">{pub.title}</h3>
                  <p className="text-sm text-muted-foreground">{pub.authors.join(", ")}</p>

                  {pub.abstract && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{pub.abstract}</p>
                  )}

                  {pub.keywords && pub.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {pub.keywords.map((kw) => (
                        <span
                          key={kw}
                          className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 flex-wrap pt-1">
                    <Link
                      href={`https://doi.org/${pub.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-mono text-primary hover:underline"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      {pub.doi}
                    </Link>
                    {pub.zenodoUrl && (
                      <Link
                        href={pub.zenodoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <SiZenodo className="h-3.5 w-3.5" />
                        View on Zenodo
                      </Link>
                    )}
                    {pub.scholarUrl && (
                      <Link
                        href={pub.scholarUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <SiGooglescholar className="h-3.5 w-3.5" />
                        Google Scholar
                      </Link>
                    )}
                    {pub.pdfUrl && (
                      <a
                        href={pub.pdfUrl}
                        download
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download PDF
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 pt-2">
                {currentPage > 1 && (
                  <Link
                    href={`?page=${currentPage - 1}`}
                    className="inline-flex items-center justify-center h-8 w-8 rounded-md border text-sm hover:bg-muted transition-colors"
                  >
                    ‹
                  </Link>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={`?page=${p}`}
                    className={cn(
                      "inline-flex items-center justify-center h-8 w-8 rounded-md border text-sm transition-colors",
                      p === currentPage
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    {p}
                  </Link>
                ))}
                {currentPage < totalPages && (
                  <Link
                    href={`?page=${currentPage + 1}`}
                    className="inline-flex items-center justify-center h-8 w-8 rounded-md border text-sm hover:bg-muted transition-colors"
                  >
                    ›
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </section>

      {/* Research Interests */}
      <section className="space-y-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Research Interests
        </h2>
        <ul className="space-y-6">
          {researchInterests.map(({ area, detail }) => (
            <li key={area} className="space-y-1">
              <p className="text-sm font-semibold">{area}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{detail}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
