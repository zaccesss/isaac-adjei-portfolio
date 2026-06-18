// I generate an RSS 2.0 feed for TIL entries.
// When a browser visits (Accept: text/html) I serve a styled HTML page instead of raw XML.
// Add ?raw to get the raw XML in Chrome's native tree viewer.

import { getPublishedTILEntries, type TILEntry } from "@/data/til"

export const dynamic = "force-dynamic"

const TIL_PER_PAGE = 10

// I strip [label](url) markdown links so body text reads cleanly in the feed.
function stripMarkdown(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
}

function escapeXml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function buildXml(entries: TILEntry[], baseUrl: string, includeStylesheet = true) {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  const items = sorted
    .map((entry) => {
      const url = `${baseUrl}/til/${entry.id}`
      const pubDate = new Date(entry.date).toUTCString()
      const categories = (entry.tags ?? [])
        .map((tag) => `      <category>${escapeXml(tag)}</category>`)
        .join("\n")
      return `
    <item>
      <title><![CDATA[${entry.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description><![CDATA[${stripMarkdown(entry.body)}]]></description>
      <author>contact@isaacadjei.me (Isaac Adjei)</author>
      <category>${escapeXml(entry.category)}</category>
      <pubDate>${pubDate}</pubDate>
${categories}
    </item>`
    })
    .join("")

  return `<?xml version="1.0" encoding="UTF-8"?>
${includeStylesheet ? '<?xml-stylesheet type="text/xsl" href="/feed.xsl"?>\n' : ''}
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>TIL: Isaac Adjei</title>
    <link>${baseUrl}/til</link>
    <description>Short notes on things Isaac Adjei discovers while coding, building and learning.</description>
    <language>en-gb</language>
    <managingEditor>contact@isaacadjei.me (Isaac Adjei)</managingEditor>
    <atom:link href="${baseUrl}/til/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${baseUrl}/images/avatar.webp</url>
      <title>TIL: Isaac Adjei</title>
      <link>${baseUrl}/til</link>
    </image>
${items}
  </channel>
</rss>`
}

function buildHtml(entries: TILEntry[], baseUrl: string, page = 1) {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  const totalPages = Math.ceil(sorted.length / TIL_PER_PAGE)
  const currentPage = Math.max(1, Math.min(page, totalPages || 1))
  const paginated = sorted.slice((currentPage - 1) * TIL_PER_PAGE, currentPage * TIL_PER_PAGE)

  const items = paginated
    .map((entry) => {
      const url = `${baseUrl}/til/${entry.id}`
      const pubDate = new Date(entry.date).toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric",
      })
      const tags = (entry.tags ?? [])
        .map((t) => `<span class="tag">${t}</span>`)
        .join("")
      const sourceLink = entry.source
        ? `<a href="${entry.source.url}" class="post-action" target="_blank" rel="noopener noreferrer">&#128279; ${entry.source.label}</a>`
        : ""
      return `
      <div class="post">
        <div class="post-body">
          <div class="post-cat">${entry.category}</div>
          <div class="post-title"><a href="${url}">${entry.title}</a></div>
          <div class="post-desc">${stripMarkdown(entry.body)}</div>
          <div class="post-meta">
            <span>${pubDate}</span>
            <span class="post-author">Isaac Adjei</span>
          </div>
          ${tags ? `<div class="tags">${tags}</div>` : ""}
          ${sourceLink ? `<div class="post-actions">${sourceLink}</div>` : ""}
        </div>
      </div>`
    })
    .join("")

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TIL RSS Feed | Isaac Adjei</title>
    <link rel="icon" type="image/png" href="${baseUrl}/images/avatar.webp" />
    <link rel="alternate" type="application/rss+xml" title="TIL: Isaac Adjei" href="${baseUrl}/til/feed.xml" />
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
      .post { border-bottom: 1px solid var(--border); padding: 1.5rem 0; }
      .post:last-child { border-bottom: none; }
      .post-body { flex: 1; min-width: 0; }
      .post-cat {
        display: inline-flex; font-size: 0.6875rem; font-weight: 600;
        color: var(--link); text-transform: uppercase; letter-spacing: 0.05em;
        margin-bottom: 0.375rem;
      }
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
          <img class="avatar" src="${baseUrl}/images/avatar.webp" alt="Isaac Adjei" />
          <div>
            <div class="site-name">TIL: Isaac Adjei</div>
            <div class="site-desc">Short notes on things I discover while coding, building and learning.</div>
          </div>
        </div>
        <div class="subscribe-box">
          <span class="rss-icon">&#9656;</span>
          This is an RSS feed. Subscribe in your reader at
          <a href="${baseUrl}/til/feed.xml">isaacadjei.me/til/feed.xml</a>
          or browse <a href="${baseUrl}/til">TIL</a>.
        </div>
        <br/>
        <a class="raw-btn" href="${baseUrl}/til/feed.xml?raw">&#60;/&#62; View raw XML</a>
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
      <p style="text-align:center;font-size:0.75rem;color:var(--muted);margin-top:0.5rem;">Showing ${(currentPage - 1) * TIL_PER_PAGE + 1}&#8211;${Math.min(currentPage * TIL_PER_PAGE, sorted.length)} of ${sorted.length} entries</p>` : ""}
      <div class="footer">
        <a href="${baseUrl}">isaacadjei.me</a>
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
  const baseUrl = `${url.protocol}//${url.host}`
  const entries = getPublishedTILEntries().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  if (forceRaw) {
    return new Response(buildXml(entries, baseUrl, false), {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    })
  }

  if (accept.includes("text/html")) {
    const page = parseInt(url.searchParams.get("page") ?? "1", 10)
    return new Response(buildHtml(entries, baseUrl, page), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    })
  }

  return new Response(buildXml(entries, baseUrl), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
