// I generate an RSS 2.0 feed from all published blog posts so readers can subscribe
// in any RSS reader. When a browser visits (Accept: text/html), I serve a styled
// HTML page instead of raw XML — Chrome 131+ dropped XSLT so the <?xml-stylesheet?>
// PI no longer works in Chrome.

import { getPublishedPosts } from "@/data/blog"

export const dynamic = "force-dynamic"

const SITE_URL = "https://www.isaacadjei.me"

function buildXml(posts: ReturnType<typeof getPublishedPosts>) {
  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`
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

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/feed.xsl"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Isaac Adjei</title>
    <link>${SITE_URL}</link>
    <description>Engineering and tech write-ups, project breakdowns, journal entries and research notes by Isaac Adjei.</description>
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

function buildHtml(posts: ReturnType<typeof getPublishedPosts>) {
  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`
      const pubDate = new Date(post.date).toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric",
      })
      const tags = post.tags
        .map((t) => `<span class="tag">${t}</span>`)
        .join("")
      return `
      <div class="post">
        <div class="post-title"><a href="${url}">${post.title}</a></div>
        <div class="post-desc">${post.description}</div>
        <div class="post-meta"><span>${pubDate}</span></div>
        ${tags ? `<div class="tags">${tags}</div>` : ""}
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
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background: #09090b;
        color: #e4e4e7;
        line-height: 1.6;
        padding: 2rem 1rem;
      }
      .container { max-width: 720px; margin: 0 auto; }
      .header { border-bottom: 1px solid #27272a; padding-bottom: 2rem; margin-bottom: 2rem; }
      .header-top { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
      .avatar { width: 48px; height: 48px; border-radius: 50%; border: 1px solid #3f3f46; }
      .site-name { font-size: 1.25rem; font-weight: 700; color: #fafafa; }
      .site-desc { font-size: 0.875rem; color: #71717a; margin-top: 0.25rem; }
      .subscribe-box {
        display: inline-flex; align-items: center; gap: 0.5rem;
        background: #18181b; border: 1px solid #3f3f46;
        border-radius: 0.5rem; padding: 0.75rem 1rem;
        font-size: 0.8125rem; color: #a1a1aa; margin-top: 1rem;
      }
      .subscribe-box a { color: #3b82f6; text-decoration: none; }
      .subscribe-box a:hover { text-decoration: underline; }
      .rss-icon { color: #f97316; }
      .posts { display: flex; flex-direction: column; gap: 0; }
      .post { border-bottom: 1px solid #27272a; padding: 1.5rem 0; }
      .post:last-child { border-bottom: none; }
      .post-title { font-size: 1rem; font-weight: 600; color: #fafafa; margin-bottom: 0.375rem; }
      .post-title a { color: inherit; text-decoration: none; }
      .post-title a:hover { color: #3b82f6; }
      .post-desc { font-size: 0.875rem; color: #71717a; margin-bottom: 0.5rem; line-height: 1.5; }
      .post-meta { font-size: 0.75rem; color: #52525b; font-family: monospace; }
      .tags { display: flex; flex-wrap: wrap; gap: 0.375rem; margin-top: 0.5rem; }
      .tag {
        font-size: 0.6875rem; color: #71717a;
        border: 1px solid #3f3f46; border-radius: 9999px;
        padding: 0.125rem 0.625rem;
      }
      .raw-btn {
        display: inline-flex; align-items: center; gap: 0.5rem;
        background: #18181b; border: 1px solid #3f3f46;
        border-radius: 0.5rem; padding: 0.75rem 1.25rem;
        font-size: 0.875rem; color: #a1a1aa; text-decoration: none;
        margin-top: 0.75rem;
      }
      .raw-btn:hover { border-color: #71717a; color: #e4e4e7; }
      .footer { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid #27272a; font-size: 0.75rem; color: #52525b; }
      .footer a { color: #3b82f6; text-decoration: none; }
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
      <div class="footer">
        <a href="${SITE_URL}">isaacadjei.me</a>
        &#183;
        <a href="mailto:contact@isaacadjei.me">contact@isaacadjei.me</a>
      </div>
    </div>
  </body>
</html>`
}

function buildRawHtml(xml: string): string {
  // Escape XML for safe HTML embedding, then apply colour spans
  const escaped = xml
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

  const highlighted = escaped
    // CDATA blocks
    .replace(/(&lt;!\[CDATA\[)([\s\S]*?)(\]\]&gt;)/g, '<span class="c">$1</span><span class="cd">$2</span><span class="c">$3</span>')
    // XML declaration and processing instructions
    .replace(/(&lt;\?)([\s\S]*?)(\?&gt;)/g, '<span class="pi">$1$2$3</span>')
    // Comments
    .replace(/(&lt;!--)([\s\S]*?)(--&gt;)/g, '<span class="cm">$1$2$3</span>')
    // Closing tags
    .replace(/(&lt;\/)([\w:-]+)(&gt;)/g, '<span class="tb">$1</span><span class="tn">$2</span><span class="tb">$3</span>')
    // Opening/self-closing tags with attributes
    .replace(/(&lt;)([\w:-]+)((?:\s[\s\S]*?)?)(\/?&gt;)/g, (_, open, name, attrs, close) => {
      const coloredAttrs = attrs.replace(/([\w:-]+)(=)(&quot;[^&]*&quot;|'[^']*')/g,
        '<span class="an">$1</span><span class="tb">$2</span><span class="av">$3</span>')
      return `<span class="tb">${open}</span><span class="tn">${name}</span>${coloredAttrs}<span class="tb">${close}</span>`
    })

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Isaac Adjei - RSS Feed (raw XML)</title>
    <link rel="icon" type="image/png" href="${SITE_URL}/images/avatar.png" />
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: #09090b; color: #e4e4e7; font-family: "SF Mono", "Fira Code", "Cascadia Code", monospace; font-size: 0.8125rem; line-height: 1.6; padding: 2rem 1rem; }
      .container { max-width: 900px; margin: 0 auto; }
      .topbar { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid #27272a; flex-wrap: wrap; }
      .topbar a { color: #3b82f6; text-decoration: none; font-size: 0.8125rem; }
      .topbar a:hover { text-decoration: underline; }
      .topbar span { color: #52525b; }
      .label { font-size: 0.75rem; color: #52525b; margin-bottom: 0.5rem; }
      pre { white-space: pre-wrap; word-break: break-all; }
      .tb { color: #71717a; }
      .tn { color: #60a5fa; }
      .an { color: #f472b6; }
      .av { color: #fb923c; }
      .pi { color: #a78bfa; }
      .cm { color: #4b5563; font-style: italic; }
      .c  { color: #71717a; }
      .cd { color: #86efac; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="topbar">
        <a href="${SITE_URL}/feed.xml">← Back to feed</a>
        <span>·</span>
        <a href="${SITE_URL}/blog">Blog</a>
        <span>·</span>
        <span style="color:#a1a1aa">Copy <code style="color:#60a5fa">${SITE_URL}/feed.xml</code> into your RSS reader to subscribe</span>
      </div>
      <p class="label">feed.xml</p>
      <pre>${highlighted}</pre>
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

  if (forceRaw && accept.includes("text/html")) {
    return new Response(buildRawHtml(buildXml(posts)), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    })
  }

  if (accept.includes("text/html") && !forceRaw) {
    return new Response(buildHtml(posts), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    })
  }

  return new Response(buildXml(posts), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
