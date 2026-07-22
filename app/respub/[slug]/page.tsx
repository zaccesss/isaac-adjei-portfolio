// I render a single publication's detail page. generateStaticParams pre-builds one per entry.

import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Download, FileText } from "lucide-react"
import { SiZenodo, SiGooglescholar } from "react-icons/si"
import { publications, type Publication } from "@/data/respub"
import { Separator } from "@/components/ui/separator"
import ShareButton from "@/components/shared/ShareButton"
import CodeBlock from "@/components/shared/CodeBlock"

const typeLabel: Record<string, string> = {
  "technical-note": "Technical Note",
  conference: "Conference Paper",
  journal: "Journal Article",
  preprint: "Preprint",
}

// I format authors the way APA style does: "Last, F." for one, "Last, F., & Last, F." for two,
// "Last, F., Last, F., & Last, F." for three or more.
function apaAuthors(authors: string[]): string {
  const initials = (name: string) => {
    const parts = name.trim().split(/\s+/)
    const last = parts.pop()
    return `${last}, ${parts.map((p) => `${p[0]}.`).join(" ")}`
  }
  const formatted = authors.map(initials)
  if (formatted.length === 1) return formatted[0]
  if (formatted.length === 2) return `${formatted[0]}, & ${formatted[1]}`
  return `${formatted.slice(0, -1).join(", ")}, & ${formatted[formatted.length - 1]}`
}

function apaCitation(pub: Publication): string {
  return `${apaAuthors(pub.authors)} (${pub.year}). ${pub.title}. ${pub.venue}. https://doi.org/${pub.doi}`
}

function bibtexCitation(pub: Publication): string {
  const key = `${pub.authors[0].split(/\s+/).pop()?.toLowerCase()}${pub.year}${pub.id.replace(/-/g, "")}`
  return `@misc{${key},
  author    = {${pub.authors.join(" and ")}},
  title     = {${pub.title}},
  year      = {${pub.year}},
  publisher = {${pub.venue}},
  doi       = {${pub.doi}},
  url       = {https://doi.org/${pub.doi}}
}`
}

export async function generateStaticParams() {
  return publications.map((p) => ({ slug: p.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const pub = publications.find((p) => p.id === slug)
  if (!pub) return {}

  const description = pub.abstract ?? `${pub.venue}, ${pub.year}`

  return {
    title: `Research | ${pub.title}`,
    description,
    alternates: {
      canonical: `https://www.isaacadjei.me/respub/${slug}`,
    },
    openGraph: {
      title: `Research | ${pub.title}`,
      images: [`/api/og?title=${encodeURIComponent(pub.title)}&description=${encodeURIComponent(description)}`],
    },
  }
}

export default async function PublicationSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const pub = publications.find((p) => p.id === slug)
  if (!pub) notFound()

  return (
    <div className="container max-w-3xl py-24 space-y-10">
      <Link
        href="/respub"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Research &amp; Publications
      </Link>

      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {typeLabel[pub.type] ?? pub.type}
          </span>
          <span className="text-xs text-muted-foreground">
            {pub.venue} · {pub.year}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight leading-tight">{pub.title}</h1>
          <ShareButton title={`Research | ${pub.title}`} />
        </div>

        <p className="text-base text-muted-foreground">{pub.authors.join(", ")}</p>
      </div>

      {pub.abstract && (
        <>
          <Separator />
          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Abstract</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{pub.abstract}</p>
          </section>
        </>
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

      <Separator />

      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Cite this work</h2>
        <p className="text-sm text-muted-foreground leading-relaxed font-mono">{apaCitation(pub)}</p>
        <CodeBlock lang="bibtex" text={bibtexCitation(pub)} />
      </section>

      <Separator />

      <div className="flex items-center gap-4 flex-wrap">
        <Link
          href={`https://doi.org/${pub.doi}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm font-mono text-primary hover:underline"
        >
          <FileText className="h-4 w-4" />
          {pub.doi}
        </Link>
        {pub.zenodoUrl && (
          <Link
            href={pub.zenodoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <SiZenodo className="h-4 w-4" />
            View on Zenodo
          </Link>
        )}
        {pub.scholarUrl && (
          <Link
            href={pub.scholarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <SiGooglescholar className="h-4 w-4" />
            Google Scholar
          </Link>
        )}
        {pub.pdfUrl && (
          <a
            href={pub.pdfUrl}
            download
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </a>
        )}
      </div>
    </div>
  )
}
