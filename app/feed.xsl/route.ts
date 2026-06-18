// I serve an XSL stylesheet so browsers render the RSS feed as a styled HTML page
// instead of raw XML. Feed readers ignore this and consume the XML directly.

export const dynamic = "force-static"

export function GET() {
  const xsl = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="UTF-8" indent="yes" />

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title><xsl:value-of select="/rss/channel/title" /> - RSS Feed</title>
        <link rel="icon" type="image/png" href="/images/avatar.webp" />
        <style>
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          :root {
            --bg: #09090b; --fg: #e4e4e7; --muted: #71717a; --subtle: #52525b;
            --border: #27272a; --card: #18181b; --card-border: #3f3f46;
            --heading: #fafafa; --link: #3b82f6;
          }
          @media (prefers-color-scheme: light) {
            :root {
              --bg: #ffffff; --fg: #18181b; --muted: #71717a; --subtle: #a1a1aa;
              --border: #e4e4e7; --card: #f4f4f5; --card-border: #d4d4d8;
              --heading: #09090b; --link: #2563eb;
            }
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: var(--bg);
            color: var(--fg);
            line-height: 1.6;
            padding: 2rem 1rem;
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
          .rss-icon { color: #f97316; font-size: 1rem; }
          .posts { display: flex; flex-direction: column; gap: 0; }
          .post { border-bottom: 1px solid var(--border); padding: 1.5rem 0; }
          .post:last-child { border-bottom: none; }
          .post-title { font-size: 1rem; font-weight: 600; color: var(--heading); margin-bottom: 0.375rem; }
          .post-title a { color: inherit; text-decoration: none; }
          .post-title a:hover { color: var(--link); }
          .post-desc { font-size: 0.875rem; color: var(--muted); margin-bottom: 0.5rem; line-height: 1.5; }
          .post-meta { display: flex; align-items: center; gap: 1rem; font-size: 0.75rem; color: var(--subtle); font-family: monospace; }
          .tags { display: flex; flex-wrap: wrap; gap: 0.375rem; margin-top: 0.5rem; }
          .tag {
            font-size: 0.6875rem; color: var(--muted);
            border: 1px solid var(--card-border); border-radius: 9999px;
            padding: 0.125rem 0.625rem;
          }
          .footer { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid var(--border); font-size: 0.75rem; color: var(--subtle); }
          .footer a { color: var(--link); text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-top">
              <img class="avatar" src="/images/avatar.webp" alt="Isaac Adjei" />
              <div>
                <div class="site-name"><xsl:value-of select="/rss/channel/title" /></div>
                <div class="site-desc"><xsl:value-of select="/rss/channel/description" /></div>
              </div>
            </div>
            <div class="subscribe-box">
              <span class="rss-icon">&#9656;</span>
              This is an RSS feed. Subscribe using your feed reader at
              <a href="/blog/feed.xml">isaacadjei.me/blog/feed.xml</a>
              or visit the <a href="/blog">blog</a>.
            </div>
          </div>

          <div class="posts">
            <xsl:for-each select="/rss/channel/item">
              <div class="post">
                <div class="post-title">
                  <a href="{link}"><xsl:value-of select="title" /></a>
                </div>
                <div class="post-desc"><xsl:value-of select="description" /></div>
                <div class="post-meta">
                  <span><xsl:value-of select="pubDate" /></span>
                </div>
                <xsl:if test="category">
                  <div class="tags">
                    <xsl:for-each select="category">
                      <span class="tag"><xsl:value-of select="." /></span>
                    </xsl:for-each>
                  </div>
                </xsl:if>
              </div>
            </xsl:for-each>
          </div>

          <div class="footer">
            <a href="https://www.isaacadjei.me">isaacadjei.me</a>
            &#183;
            <a href="mailto:contact@isaacadjei.me">contact@isaacadjei.me</a>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>`

  return new Response(xsl, {
    headers: {
      "Content-Type": "text/xsl; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  })
}
