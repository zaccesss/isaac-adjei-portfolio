// I show all matching blog posts, TIL entries, projects and publications for a given tag slug.

import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Tag } from "lucide-react"
import { getPublishedPosts } from "@/data/blog"
import { getPublishedTILEntries } from "@/data/til"
import { notes } from "@/data/notes"
import { projects } from "@/data/projects"
import { publications } from "@/data/respub"
import { videos, articles, others, books, resources, artists } from "@/data/consumed"
import { normTag, consumedSlug } from "@/lib/tags"

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export async function generateStaticParams() {
  const slugs = new Set<string>()
  for (const post of getPublishedPosts()) post.tags.forEach((t) => slugs.add(normTag(t)))
  for (const til of getPublishedTILEntries()) til.tags?.forEach((t) => slugs.add(normTag(t)))
  for (const note of notes) note.tags.forEach((t) => slugs.add(normTag(t)))
  for (const project of projects) project.technologies.forEach((t) => slugs.add(normTag(t)))
  for (const pub of publications) pub.keywords?.forEach((t) => slugs.add(normTag(t)))
  for (const v of videos) v.tags.forEach((t) => slugs.add(normTag(t)))
  for (const a of articles) a.tags.forEach((t) => slugs.add(normTag(t)))
  for (const o of others) o.tags.forEach((t) => slugs.add(normTag(t)))
  for (const b of books) slugs.add(normTag(b.genre))
  for (const r of resources) slugs.add(normTag(r.category))
  for (const a of artists) slugs.add(normTag(a.genre))
  return [...slugs].map((tag) => ({ tag }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>
}): Promise<Metadata> {
  const { tag } = await params
  const description = `Everything tagged with ${tag}: blog posts, TIL entries, notes, projects, publications and consumed items.`
  return {
    title: `#${tag} - Tags`,
    description,
    alternates: { canonical: `https://www.isaacadjei.me/tags/${tag}` },
    openGraph: {
      images: [`/api/og?title=%23${encodeURIComponent(tag)}&description=${encodeURIComponent(description)}`],
    },
  }
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>
}) {
  const { tag } = await params

  const posts = getPublishedPosts()
    .filter((p) => p.tags.some((t) => normTag(t) === tag))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const tils = getPublishedTILEntries()
    .filter((e) => e.tags?.some((t) => normTag(t) === tag))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const matchedNotes = notes.filter((n) => n.tags.some((t) => normTag(t) === tag))

  const matchedProjects = projects.filter((p) =>
    p.technologies.some((t) => normTag(t) === tag)
  )

  const matchedPubs = publications.filter((p) =>
    p.keywords?.some((k) => normTag(k) === tag)
  )

  const matchedVideos = videos.filter((v) => v.tags.some((t) => normTag(t) === tag))
  const matchedArticles = articles.filter((a) => a.tags.some((t) => normTag(t) === tag))
  const matchedOthers = others.filter((o) => o.tags.some((t) => normTag(t) === tag))
  const matchedBooks = books.filter((b) => normTag(b.genre) === tag)
  const matchedResources = resources.filter((r) => normTag(r.category) === tag)
  const matchedArtists = artists.filter((a) => normTag(a.genre) === tag)

  const hasConsumed =
    matchedVideos.length > 0 || matchedArticles.length > 0 ||
    matchedOthers.length > 0 || matchedBooks.length > 0 || matchedResources.length > 0 ||
    matchedArtists.length > 0

  if (
    posts.length === 0 && tils.length === 0 && matchedNotes.length === 0 &&
    matchedProjects.length === 0 && matchedPubs.length === 0 && !hasConsumed
  ) notFound()

  // I prefer the display form from blog posts (often correct casing), then TIL, then notes, then projects, then consumed
  const displayTag =
    posts[0]?.tags.find((t) => normTag(t) === tag) ??
    tils[0]?.tags?.find((t) => normTag(t) === tag) ??
    matchedNotes[0]?.tags.find((t) => normTag(t) === tag) ??
    matchedProjects[0]?.technologies.find((t) => normTag(t) === tag) ??
    matchedPubs[0]?.keywords?.find((k) => normTag(k) === tag) ??
    matchedVideos[0]?.tags.find((t) => normTag(t) === tag) ??
    matchedArticles[0]?.tags.find((t) => normTag(t) === tag) ??
    matchedOthers[0]?.tags.find((t) => normTag(t) === tag) ??
    matchedBooks[0]?.genre ??
    matchedResources[0]?.category ??
    matchedArtists[0]?.genre ??
    tag

  const total =
    posts.length + tils.length + matchedNotes.length + matchedProjects.length + matchedPubs.length +
    matchedVideos.length + matchedArticles.length + matchedOthers.length + matchedBooks.length +
    matchedResources.length + matchedArtists.length

  return (
    <div className="container max-w-2xl py-24 space-y-12">
      <div className="space-y-4">
        <Link
          href="/tags"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All tags
        </Link>
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">{displayTag}</h1>
        </div>
        <p className="text-muted-foreground">
          {total} {total === 1 ? "entry" : "entries"} tagged with{" "}
          <span className="text-foreground font-medium">{displayTag}</span>
        </p>
      </div>

      {posts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-mono text-primary uppercase tracking-widest">Blog Posts</h2>
          <ul className="space-y-3">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-muted/30 hover:bg-muted/60 hover:border-border p-4 transition-all"
                >
                  <div className="space-y-1 min-w-0">
                    <p className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{post.description}</p>
                  </div>
                  <p className="text-[11px] font-mono text-muted-foreground/70 shrink-0">
                    {fmtDate(post.date)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tils.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-mono text-primary uppercase tracking-widest">TIL Entries</h2>
          <ul className="space-y-3">
            {tils.map((entry) => (
              <li key={entry.id}>
                <Link
                  href={`/til/${entry.id}`}
                  className="group flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-muted/30 hover:bg-muted/60 hover:border-border p-4 transition-all"
                >
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs font-medium text-primary">{entry.category}</p>
                    <p className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {entry.title}
                    </p>
                  </div>
                  <p className="text-[11px] font-mono text-muted-foreground/70 shrink-0">
                    {fmtDate(entry.date)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {matchedNotes.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-mono text-primary uppercase tracking-widest">Notes</h2>
          <ul className="space-y-3">
            {matchedNotes.map((note) => (
              <li key={note.slug}>
                <Link
                  href={`/notes/${note.slug}`}
                  className="group flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-muted/30 hover:bg-muted/60 hover:border-border p-4 transition-all"
                >
                  <div className="space-y-1 min-w-0">
                    <p className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {note.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{note.description}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {matchedProjects.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-mono text-primary uppercase tracking-widest">Projects</h2>
          <ul className="space-y-3">
            {matchedProjects.map((project) => (
              <li key={project.id}>
                <Link
                  href={`/projects/${project.id}`}
                  className="group flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-muted/30 hover:bg-muted/60 hover:border-border p-4 transition-all"
                >
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs font-medium text-primary">{project.category}</p>
                    <p className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {project.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{project.description}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {matchedPubs.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-mono text-primary uppercase tracking-widest">Publications</h2>
          <ul className="space-y-3">
            {matchedPubs.map((pub) => (
              <li key={pub.id}>
                <Link
                  href={`/respub/${pub.id}`}
                  className="group flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-muted/30 hover:bg-muted/60 hover:border-border p-4 transition-all"
                >
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs font-medium text-primary">{pub.type}</p>
                    <p className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {pub.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{pub.venue} · {pub.year}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(matchedVideos.length > 0 || matchedArticles.length > 0 || matchedOthers.length > 0 || matchedBooks.length > 0 || matchedResources.length > 0 || matchedArtists.length > 0) && (
        <section className="space-y-4">
          <h2 className="text-sm font-mono text-primary uppercase tracking-widest">Consumed</h2>
          <ul className="space-y-3">
            {matchedArtists.map((artist) => (
              <li key={artist.name}>
                <Link
                  href={`/consumed/music/${consumedSlug(artist.name)}`}
                  className="group flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-muted/30 hover:bg-muted/60 hover:border-border p-4 transition-all"
                >
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs font-medium text-primary">Artist</p>
                    <p className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {artist.name}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{artist.note}</p>
                  </div>
                </Link>
              </li>
            ))}
            {matchedBooks.map((book) => (
              <li key={book.title}>
                <Link
                  href={`/consumed/books/${consumedSlug(book.title)}`}
                  className="group flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-muted/30 hover:bg-muted/60 hover:border-border p-4 transition-all"
                >
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs font-medium text-primary">Book</p>
                    <p className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {book.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{book.author}</p>
                  </div>
                </Link>
              </li>
            ))}
            {matchedVideos.map((video) => (
              <li key={video.id}>
                <Link
                  href={`/consumed/videos/${consumedSlug(video.title)}`}
                  className="group flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-muted/30 hover:bg-muted/60 hover:border-border p-4 transition-all"
                >
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs font-medium text-primary">Video</p>
                    <p className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {video.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{video.channel}</p>
                  </div>
                </Link>
              </li>
            ))}
            {matchedArticles.map((article) => (
              <li key={article.title}>
                <Link
                  href={`/consumed/articles/${consumedSlug(article.title)}`}
                  className="group flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-muted/30 hover:bg-muted/60 hover:border-border p-4 transition-all"
                >
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs font-medium text-primary">Article</p>
                    <p className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{article.source}</p>
                  </div>
                </Link>
              </li>
            ))}
            {matchedOthers.map((other) => (
              <li key={other.title}>
                <Link
                  href={`/consumed/others/${consumedSlug(other.title)}`}
                  className="group flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-muted/30 hover:bg-muted/60 hover:border-border p-4 transition-all"
                >
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs font-medium text-primary">Other</p>
                    <p className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {other.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{other.source}</p>
                  </div>
                </Link>
              </li>
            ))}
            {matchedResources.map((resource) => (
              <li key={resource.title}>
                <Link
                  href={`/consumed/resources/${consumedSlug(resource.title)}`}
                  className="group flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-muted/30 hover:bg-muted/60 hover:border-border p-4 transition-all"
                >
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs font-medium text-primary">Resource</p>
                    <p className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {resource.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{resource.category}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
