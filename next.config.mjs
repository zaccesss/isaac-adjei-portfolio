/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // domains[] is deprecated in Next.js 13+ - use remotePatterns instead.
    // Both are empty because all images are served locally from /public.
    remotePatterns: [],
    // Serve images in AVIF (best compression) with WebP as a fallback.
    // Next.js negotiates the format automatically via Accept headers.
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
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
              "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://challenges.cloudflare.com https://zenquotes.io",
              "frame-src https://challenges.cloudflare.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          // Prevent clickjacking - disallows the page being embedded in an iframe
          { key: "X-Frame-Options", value: "DENY" },
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
