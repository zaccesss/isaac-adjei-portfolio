// I generate an RSS 2.0 feed from all published blog posts so readers can subscribe
// in any RSS reader. The XSL stylesheet reference makes the feed render as a styled
// HTML page when opened in a browser.

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
      const categories = post.tags
        .map((tag) => `      <category>${tag}</category>`)
        .join("\n")
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description><![CDATA[${post.description}]]></description>
      <author>contact@isaacadjei.me (Isaac Adjei)</author>
      <pubDate>${pubDate}</pubDate>
${categories}
    </item>`
    })
    .join("")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/feed.xsl"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Isaac Adjei</title>
    <link>${siteUrl}</link>
    <description>Engineering and tech write-ups, project breakdowns, journal entries and research notes by Isaac Adjei.</description>
    <language>en-gb</language>
    <managingEditor>contact@isaacadjei.me (Isaac Adjei)</managingEditor>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${siteUrl}/images/avatar.png</url>
      <title>Isaac Adjei</title>
      <link>${siteUrl}</link>
    </image>
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
