import { withSentryConfig } from "@sentry/nextjs"

const isDev = process.env.NODE_ENV === "development"

const scriptSrc = ["'self'", "'unsafe-inline'", "https://challenges.cloudflare.com", "https://www.googletagmanager.com"]
const connectSrc = ["'self'", "https://challenges.cloudflare.com", "https://zenquotes.io", "https://www.google-analytics.com", "https://analytics.google.com", "https://api.lanyard.rest"]

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
  async headers() {
    return [
      // I noindex OG and Twitter image generation routes - they are internal
      // image endpoints, not content pages, and should not appear in search results.
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
              // I include 'self' so the /cv page can embed /resume/cv.html in an iframe
              // giscus.app is required for the blog comments iframe
              "frame-src 'self' https://challenges.cloudflare.com https://www.youtube.com https://open.spotify.com https://giscus.app",
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

// I wrap the config with Sentry's official build integration (this is the piece a hand-rolled
// instrumentation-only setup was missing, which broke the Vercel build). Server-only: there is no client
// config file, so no browser SDK is injected. Source-map upload is disabled (no SENTRY_AUTH_TOKEN), which
// keeps the build lean and tokenless - errors just keep minified stack traces.
export default withSentryConfig(nextConfig, {
  org: "isaacadjei-dashboard",
  project: "javascript-nextjs",
  silent: true,
  sourcemaps: { disable: true },
})

// I only init OpenNext Cloudflare in local dev - it breaks Vercel builds if run unconditionally
if (isDev) {
  import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
}
