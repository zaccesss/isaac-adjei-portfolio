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
        <link rel="icon" type="image/png" href="/images/avatar.png" />
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
          .rss-icon { color: #f97316; font-size: 1rem; }
          .posts { display: flex; flex-direction: column; gap: 0; }
          .post {
            border-bottom: 1px solid #27272a;
            padding: 1.5rem 0;
          }
          .post:last-child { border-bottom: none; }
          .post-title { font-size: 1rem; font-weight: 600; color: #fafafa; margin-bottom: 0.375rem; }
          .post-title a { color: inherit; text-decoration: none; }
          .post-title a:hover { color: #3b82f6; }
          .post-desc { font-size: 0.875rem; color: #71717a; margin-bottom: 0.5rem; line-height: 1.5; }
          .post-meta { display: flex; align-items: center; gap: 1rem; font-size: 0.75rem; color: #52525b; font-family: monospace; }
          .tags { display: flex; flex-wrap: wrap; gap: 0.375rem; margin-top: 0.5rem; }
          .tag {
            font-size: 0.6875rem; color: #71717a;
            border: 1px solid #3f3f46; border-radius: 9999px;
            padding: 0.125rem 0.625rem;
          }
          .footer { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid #27272a; font-size: 0.75rem; color: #52525b; }
          .footer a { color: #3b82f6; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-top">
              <img class="avatar" src="/images/avatar.png" alt="Isaac Adjei" />
              <div>
                <div class="site-name"><xsl:value-of select="/rss/channel/title" /></div>
                <div class="site-desc"><xsl:value-of select="/rss/channel/description" /></div>
              </div>
            </div>
            <div class="subscribe-box">
              <span class="rss-icon">&#9656;</span>
              This is an RSS feed. Subscribe using your feed reader at
              <a href="/feed.xml">isaacadjei.me/feed.xml</a>
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
