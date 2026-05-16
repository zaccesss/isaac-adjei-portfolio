// I generate an RSS 2.0 feed from all published blog posts so readers can subscribe
// in any RSS reader. The feed is static and cached for an hour.

import { getPublishedPosts } from "@/data/blog"

export const dynamic = "force-static"

export function GET() {
  const posts = getPublishedPosts().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const siteUrl = "https://www.isaacadjei.me"

  const items = posts
    .map((post) => {
      const url = `${siteUrl}/blog/${post.slug}`
      const pubDate = new Date(post.date).toUTCString()
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${pubDate}</pubDate>
    </item>`
    })
    .join("")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Isaac Adjei</title>
    <link>${siteUrl}</link>
    <description>Engineering write-ups, project breakdowns, journal entries and research notes by Isaac Adjei.</description>
    <language>en-gb</language>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
