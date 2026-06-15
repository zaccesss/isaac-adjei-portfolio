// I generate an RSS 2.0 feed from all published blog posts so readers can subscribe
// in any RSS reader. When a browser visits (Accept: text/html), I serve a styled
// HTML page instead of raw XML - Chrome 131+ dropped XSLT so the <?xml-stylesheet?>
// PI no longer works in Chrome.

import { getPublishedPosts } from "@/data/blog"

export const dynamic = "force-dynamic"

const SITE_URL = "https://www.isaacadjei.me"

function imageType(url: string): string {
  if (url.endsWith(".png")) return "image/png"
  if (url.endsWith(".svg")) return "image/svg+xml"
  if (url.endsWith(".webp")) return "image/webp"
  return "image/jpeg"
}

function buildXml(posts: ReturnType<typeof getPublishedPosts>, baseUrl = SITE_URL, includeStylesheet = true) {
  function resolveImageUrl(coverImage: string | undefined): string | null {
    if (!coverImage) return null
    if (coverImage.startsWith("http")) return coverImage
    return `${baseUrl}${coverImage}`
  }
  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`
      const pubDate = new Date(post.date).toUTCString()
      const categories = post.tags
        .map((tag) => `      <category>${tag}</category>`)
        .join("\n")
      const imageUrl = resolveImageUrl(post.cover_image)
      const enclosure = imageUrl
        ? `      <enclosure url="${imageUrl}" length="0" type="${imageType(imageUrl)}" />`
        : ""
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description><![CDATA[${post.description}]]></description>
      <author>contact@isaacadjei.me (Isaac Adjei)</author>
      <dc:creator>Isaac Adjei</dc:creator>
      <pubDate>${pubDate}</pubDate>
      <comments>${url}#comments</comments>
${categories}
${enclosure}
    </item>`
    })
    .join("")

  return `<?xml version="1.0" encoding="UTF-8"?>
${includeStylesheet ? '<?xml-stylesheet type="text/xsl" href="/feed.xsl"?>\n' : ''}
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Isaac Adjei</title>
    <link>${SITE_URL}</link>
    <description>Engineering and tech write-ups, project breakdowns, research posts, journal entries, articles and curated resources by Isaac Adjei.</description>
    <language>en-gb</language>
    <managingEditor>contact@isaacadjei.me (Isaac Adjei)</managingEditor>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE_URL}/images/avatar.png</url>
      <title>Isaac Adjei</title>
      <link>${SITE_URL}</link>
    </image>
${items}
  </channel>
</rss>`
}

const RSS_PER_PAGE = 7

function buildHtml(posts: ReturnType<typeof getPublishedPosts>, baseUrl = SITE_URL, page = 1) {
  const totalPages = Math.ceil(posts.length / RSS_PER_PAGE)
  const currentPage = Math.max(1, Math.min(page, totalPages))
  const paginated = posts.slice((currentPage - 1) * RSS_PER_PAGE, currentPage * RSS_PER_PAGE)

  function resolveLocal(coverImage: string | undefined): string | null {
    if (!coverImage) return null
    if (coverImage.startsWith("http")) return coverImage
    return `${baseUrl}${coverImage}`
  }
  const items = paginated
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`
      const pubDate = new Date(post.date).toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric",
      })
      const tags = post.tags
        .map((t) => `<span class="tag">${t}</span>`)
        .join("")
      const imageUrl = resolveLocal(post.cover_image)
      return `
      <div class="post">
        ${imageUrl ? `<img class="post-img" src="${imageUrl}" alt="${post.title}" loading="lazy" />` : ""}
        <div class="post-body">
          <div class="post-title"><a href="${url}">${post.title}</a></div>
          <div class="post-desc">${post.description}</div>
          <div class="post-meta">
            <span>${pubDate}</span>
            <span class="post-author">Isaac Adjei</span>
          </div>
          ${tags ? `<div class="tags">${tags}</div>` : ""}
          <div class="post-actions">
            <a href="${url}#reactions" class="post-action">&#128077; Reactions</a>
            <a href="${url}#comments" class="post-action">&#128172; Comments</a>
          </div>
        </div>
      </div>`
    })
    .join("")

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Isaac Adjei - RSS Feed</title>
    <link rel="icon" type="image/png" href="${SITE_URL}/images/avatar.png" />
    <link rel="alternate" type="application/rss+xml" title="Isaac Adjei RSS" href="${SITE_URL}/feed.xml" />
    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      :root {
        --bg: #09090b; --fg: #e4e4e7; --muted: #71717a; --subtle: #52525b;
        --border: #27272a; --card: #18181b; --card-border: #3f3f46;
        --heading: #fafafa; --link: #3b82f6; --btn-fg: #a1a1aa;
      }
      @media (prefers-color-scheme: light) {
        :root {
          --bg: #ffffff; --fg: #18181b; --muted: #71717a; --subtle: #a1a1aa;
          --border: #e4e4e7; --card: #f4f4f5; --card-border: #d4d4d8;
          --heading: #09090b; --link: #2563eb; --btn-fg: #52525b;
        }
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background: var(--bg); color: var(--fg);
        line-height: 1.6; padding: 2rem 1rem;
      }
      .container { max-width: 720px; margin: 0 auto; }
      .header { border-bottom: 1px solid var(--border); padding-bottom: 2rem; margin-bottom: 2rem; }
      .header-top { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
      .avatar { width: 48px; height: 48px; border-radius: 50%; border: 1px solid var(--card-border); }
      .site-name { font-size: 1.25rem; font-weight: 700; color: var(--heading); }
      .site-desc { font-size: 0.875rem; color: var(--muted); margin-top: 0.25rem; }
      .subscribe-box {
        display: inline-flex; align-items: center; gap: 0.5rem;
        background: var(--card); border: 1px solid var(--card-border);
        border-radius: 0.5rem; padding: 0.75rem 1rem;
        font-size: 0.8125rem; color: var(--muted); margin-top: 1rem;
      }
      .subscribe-box a { color: var(--link); text-decoration: none; }
      .subscribe-box a:hover { text-decoration: underline; }
      .rss-icon { color: #f97316; }
      .posts { display: flex; flex-direction: column; gap: 0; }
      .post { border-bottom: 1px solid var(--border); padding: 1.5rem 0; display: flex; gap: 1rem; align-items: flex-start; }
      .post:last-child { border-bottom: none; }
      .post-img { width: 80px; height: 56px; object-fit: cover; border-radius: 0.375rem; border: 1px solid var(--card-border); flex-shrink: 0; }
      .post-body { flex: 1; min-width: 0; }
      .post-title { font-size: 1rem; font-weight: 600; color: var(--heading); margin-bottom: 0.375rem; }
      .post-title a { color: inherit; text-decoration: none; }
      .post-title a:hover { color: var(--link); }
      .post-desc { font-size: 0.875rem; color: var(--muted); margin-bottom: 0.5rem; line-height: 1.5; }
      .post-meta { font-size: 0.75rem; color: var(--subtle); font-family: monospace; display: flex; gap: 1rem; align-items: center; }
      .post-author { color: var(--muted); font-family: sans-serif; }
      .post-actions { display: flex; gap: 1rem; margin-top: 0.625rem; }
      .post-action { font-size: 0.75rem; color: var(--muted); text-decoration: none; }
      .post-action:hover { color: var(--link); }
      .tags { display: flex; flex-wrap: wrap; gap: 0.375rem; margin-top: 0.5rem; }
      .tag {
        font-size: 0.6875rem; color: var(--muted);
        border: 1px solid var(--card-border); border-radius: 9999px;
        padding: 0.125rem 0.625rem;
      }
      .raw-btn {
        display: inline-flex; align-items: center; gap: 0.5rem;
        background: var(--card); border: 1px solid var(--card-border);
        border-radius: 0.5rem; padding: 0.75rem 1.25rem;
        font-size: 0.875rem; color: var(--btn-fg); text-decoration: none;
        margin-top: 0.75rem;
      }
      .raw-btn:hover { border-color: var(--muted); color: var(--fg); }
      .pagination { display: flex; align-items: center; justify-content: center; gap: 0.375rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border); }
      .page-btn {
        display: inline-flex; align-items: center; justify-content: center;
        min-width: 2rem; height: 2rem; padding: 0 0.5rem;
        border: 1px solid var(--card-border); border-radius: 0.375rem;
        background: var(--card); color: var(--btn-fg);
        font-size: 0.8125rem; text-decoration: none; cursor: pointer;
      }
      .page-btn:hover { border-color: var(--muted); color: var(--fg); }
      .page-btn.active { background: var(--link); border-color: var(--link); color: #fff; }
      .page-btn.disabled { opacity: 0.4; pointer-events: none; }
      .footer { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid var(--border); font-size: 0.75rem; color: var(--subtle); }
      .footer a { color: var(--link); text-decoration: none; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="header-top">
          <img class="avatar" src="${SITE_URL}/images/avatar.png" alt="Isaac Adjei" />
          <div>
            <div class="site-name">Isaac Adjei</div>
            <div class="site-desc">Engineering and tech write-ups, project breakdowns, journal entries and research notes.</div>
          </div>
        </div>
        <div class="subscribe-box">
          <span class="rss-icon">&#9656;</span>
          This is an RSS feed. Subscribe in your reader at
          <a href="${SITE_URL}/feed.xml">isaacadjei.me/feed.xml</a>
          or browse the <a href="${SITE_URL}/blog">blog</a>.
        </div>
        <br/>
        <a class="raw-btn" href="${SITE_URL}/feed.xml?raw">&#60;/&#62; View raw XML</a>
      </div>
      <div class="posts">${items}
      </div>
      ${totalPages > 1 ? `
      <div class="pagination">
        <a href="?page=1" class="page-btn${currentPage === 1 ? " disabled" : ""}">&#171;</a>
        <a href="?page=${currentPage - 1}" class="page-btn${currentPage === 1 ? " disabled" : ""}">&#8249;</a>
        ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p =>
          `<a href="?page=${p}" class="page-btn${p === currentPage ? " active" : ""}">${p}</a>`
        ).join("")}
        <a href="?page=${currentPage + 1}" class="page-btn${currentPage === totalPages ? " disabled" : ""}">&#8250;</a>
        <a href="?page=${totalPages}" class="page-btn${currentPage === totalPages ? " disabled" : ""}">&#187;</a>
      </div>
      <p style="text-align:center;font-size:0.75rem;color:var(--muted);margin-top:0.5rem;">Showing ${(currentPage - 1) * RSS_PER_PAGE + 1}&#8211;${Math.min(currentPage * RSS_PER_PAGE, posts.length)} of ${posts.length} posts</p>` : ""}
      <div class="footer">
        <a href="${SITE_URL}">isaacadjei.me</a>
        &#183;
        <a href="mailto:contact@isaacadjei.me">contact@isaacadjei.me</a>
      </div>
    </div>
  </body>
</html>`
}

export function GET(request: Request) {
  const url = new URL(request.url)
  const accept = request.headers.get("accept") ?? ""
  const forceRaw = url.searchParams.has("raw")
  const posts = getPublishedPosts().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const baseUrl = `${url.protocol}//${url.host}`

  // I serve plain XML when ?raw is requested - the old syntax-highlighted HTML viewer
  // ran too many regex passes over the full XML string and exceeded Cloudflare's CPU limit.
  if (forceRaw) {
    return new Response(buildXml(posts, baseUrl, false), {
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    })
  }

  if (accept.includes("text/html")) {
    const page = parseInt(url.searchParams.get("page") ?? "1", 10)
    return new Response(buildHtml(posts, baseUrl, page), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    })
  }

  return new Response(buildXml(posts, baseUrl), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
