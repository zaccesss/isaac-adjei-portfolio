const isDev = process.env.NODE_ENV === "development"

// static.cloudflareinsights.com serves the CF beacon script; the beacon posts to
// cloudflareinsights.com. GA4 collects via regional hosts (region1.google-analytics.com and
// friends), so connect-src needs the wildcard, not just www. vercel.live (script, connect,
// frame and the pusher websocket) is the Vercel Toolbar, which Vercel injects for me as a
// logged-in team member - visitors never load it, but blocking it spams my own console.
const scriptSrc = ["'self'", "'unsafe-inline'", "https://challenges.cloudflare.com", "https://www.googletagmanager.com", "https://static.cloudflareinsights.com", "https://vercel.live"]
// api.maptiler.com serves the Applications map's vector tiles, glyphs and style JSON - all
// fetched by MapLibre GL JS via connect-src, not img-src (they are not plain <img> requests).
const connectSrc = ["'self'", "https://challenges.cloudflare.com", "https://zenquotes.io", "https://*.google-analytics.com", "https://analytics.google.com", "https://api.lanyard.rest", "https://cloudflareinsights.com", "https://vercel.live", "wss://ws-us3.pusher.com", "https://api.maptiler.com"]

if (isDev) {
  scriptSrc.push("'unsafe-eval'")
  connectSrc.push("ws://127.0.0.1:3000", "ws://localhost:3000")
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // domains[] is deprecated in Next.js 13+ - use remotePatterns instead.
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "www.google.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "i.scdn.co" },
      { protocol: "https", hostname: "mosaic.scdn.co" },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Serve images in AVIF (best compression) with WebP as a fallback.
    // Next.js negotiates the format automatically via Accept headers.
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
    // Saved assistant chats can carry a downscaled image as a data URL, so I lift the default 1MB
    // server-action body cap a little. Images are shrunk client-side first, so this stays modest.
    serverActions: { bodySizeLimit: "4mb" },
  },
  async redirects() {
    return [
      // I renamed the posts analytics route from blog-analytics to post-analytics; keep old links working.
      { source: "/dashboard/blog-analytics", destination: "/dashboard/post-analytics", permanent: true },
      // The World Cup predictor note generalised into a multi-sport platform; keep the old link working.
      { source: "/notes/world-cup-ai-predictor", destination: "/notes/multi-sport-ai-predictor", permanent: true },
    ]
  },
  async headers() {
    return [
      // I noindex OG and Twitter image generation routes - they are internal
      // image endpoints, not content pages and should not appear in search results.
      { source: "/opengraph-image",          headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
      { source: "/twitter-image",            headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
      { source: "/:any+/opengraph-image",    headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
      { source: "/:any+/twitter-image",      headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
      {
        source: "/(.*)",
        headers: [
          // ─── Content Security Policy ────────────────────────────────────────
          // Controls which resources the browser is allowed to load.
          // 'unsafe-inline' for scripts is required because next-themes injects
          // an inline script to prevent flash-of-unstyled-content on page load.
          // Tighten to a nonce-based policy in a future pass if needed.
          // connect-src must include Cloudflare Turnstile (CAPTCHA) and ZenQuotes
          // because those are called from the browser/API routes at runtime.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `script-src ${scriptSrc.join(" ")}`,
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
              "img-src 'self' data: blob: https:",
              `connect-src ${connectSrc.join(" ")}`,
              // MapLibre GL JS (the Applications map) parses vector tiles in a Web Worker created
              // from a blob: URL - worker-src falls back to script-src, not default-src, per the
              // CSP spec, and 'self' alone does not implicitly cover a blob: worker.
              "worker-src 'self' blob:",
              // I include 'self' so the /cv page can embed /resume/cv.html in an iframe
              // giscus.app is required for the blog comments iframe
              "frame-src 'self' https://challenges.cloudflare.com https://www.youtube.com https://open.spotify.com https://giscus.app https://vercel.live",
              // I use SAMEORIGIN instead of 'none' so the CV iframe can load same-origin content
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          // I use SAMEORIGIN so the CV preview iframe can load /resume/cv.html from the same origin
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Prevent MIME type sniffing - browser must respect declared Content-Type
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Force HTTPS for 2 years; include subdomains; submit for HSTS preload list
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Only send the origin (no path/query) as Referer on cross-origin requests
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Disable browser features the portfolio does not use
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // NOTE: X-XSS-Protection was intentionally removed.
          // It is deprecated, ignored by all modern browsers and can cause issues
          // in some legacy scenarios. CSP above supersedes it entirely.
        ],
      },
    ]
  },
}

export default nextConfig

// I only init OpenNext Cloudflare in local dev - it breaks Vercel builds if run unconditionally
if (isDev) {
  import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
}
