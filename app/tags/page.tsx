// I aggregate tags from all content types and render them as a filterable tag cloud.

import type { Metadata } from "next"
import { getPublishedPosts } from "@/data/blog"
import { getPublishedTILEntries } from "@/data/til"
import { notes } from "@/data/notes"
import { projects } from "@/data/projects"
import { publications } from "@/data/respub"
import { videos, articles, others, books, resources, artists } from "@/data/consumed"
import { normTag } from "@/lib/tags"
import TagsClient from "@/components/tags/TagsClient"

export const metadata: Metadata = {
  title: "Tags",
  description: "Browse all topics across blog posts, TIL entries, notes, projects, publications and consumed items.",
  alternates: { canonical: "https://www.isaacadjei.me/tags" },
  openGraph: {
    images: ["/api/og?title=Tags&description=Browse%20all%20topics%20across%20blog%20posts%2C%20TIL%20entries%2C%20notes%2C%20projects%2C%20publications%20and%20consumed%20items."],
  },
}

export default function TagsPage() {
  const counts = new Map<string, { display: string; count: number }>()

  const addTag = (tag: string) => {
    const slug = normTag(tag)
    const existing = counts.get(slug)
    if (existing) {
      existing.count++
    } else {
      counts.set(slug, { display: tag, count: 1 })
    }
  }

  for (const post of getPublishedPosts()) post.tags.forEach(addTag)
  for (const til of getPublishedTILEntries()) til.tags?.forEach(addTag)
  for (const note of notes) note.tags.forEach(addTag)
  for (const project of projects) project.technologies.forEach(addTag)
  for (const pub of publications) pub.keywords?.forEach(addTag)
  for (const video of videos) video.tags.forEach(addTag)
  for (const article of articles) article.tags.forEach(addTag)
  for (const other of others) other.tags.forEach(addTag)
  for (const book of books) addTag(book.genre)
  for (const resource of resources) addTag(resource.category)
  for (const artist of artists) addTag(artist.genre)

  // I sort by count descending, then alphabetically within the same count.
  const tags = [...counts.entries()]
    .sort((a, b) => b[1].count - a[1].count || a[1].display.localeCompare(b[1].display))
    .map(([slug, { display, count }]) => ({ slug, display, count }))

  return <TagsClient tags={tags} />
}
