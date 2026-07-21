// I pass pre-resolved static data to the client search component.
// Newsletter issues are fetched client-side since they come from an external API.

import type { Metadata } from "next"
import { getPublishedPosts } from "@/data/blog"
import { getPublishedTILEntries } from "@/data/til"
import { notes } from "@/data/notes"
import { projects } from "@/data/projects"
import { publications } from "@/data/respub"
import { books, videos, podcasts, articles, resources, others } from "@/data/consumed"
import { consumedSlug } from "@/lib/tags"
import SearchClient from "@/components/search/SearchClient"

export const metadata: Metadata = {
  title: "Search",
  description: "Search across blog posts, TIL entries, projects, publications, notes and newsletter issues.",
  alternates: { canonical: "https://www.isaacadjei.me/search" },
  openGraph: {
    images: ["/api/og?title=Search&description=Search%20across%20blog%20posts%2C%20TIL%20entries%2C%20projects%20and%20more."],
  },
}

export const NOTES_INDEX = notes.map((n) => ({
  href: `/notes/${n.slug}`,
  title: n.title,
  description: n.description,
}))

// I normalise all consumed categories into a flat searchable index with internal hrefs.
function buildConsumedIndex() {
  const index: { href: string; title: string; body: string; badge: string; tags: string[] }[] = []
  for (const b of books)
    index.push({ href: `/consumed/books/${consumedSlug(b.title)}`,     title: b.title, body: b.note,        badge: b.genre,      tags: [b.genre] })
  for (const v of videos)
    index.push({ href: `/consumed/videos/${consumedSlug(v.title)}`,    title: v.title, body: v.description ?? "", badge: v.channel,    tags: v.tags })
  for (const p of podcasts)
    index.push({ href: `/consumed/podcasts/${consumedSlug(p.title)}`,  title: p.title, body: p.description ?? "", badge: p.show,       tags: [] })
  for (const a of articles)
    index.push({ href: `/consumed/articles/${consumedSlug(a.title)}`,  title: a.title, body: a.description, badge: a.source,     tags: a.tags })
  for (const r of resources)
    index.push({ href: `/consumed/resources/${consumedSlug(r.title)}`, title: r.title, body: r.description, badge: r.category,   tags: [r.category] })
  for (const o of others)
    index.push({ href: `/consumed/others/${consumedSlug(o.title)}`,    title: o.title, body: o.description, badge: o.source,     tags: o.tags })
  return index
}

export default function SearchPage() {
  const posts = getPublishedPosts().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  const tils = getPublishedTILEntries().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  return (
    <SearchClient
      posts={posts}
      tils={tils}
      projects={projects}
      publications={publications}
      notes={NOTES_INDEX}
      consumed={buildConsumedIndex()}
    />
  )
}
