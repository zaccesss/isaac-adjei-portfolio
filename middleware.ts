// I guard /dashboard at the edge (a quick redirect to login when there is no session cookie) and gate the
// public site behind a maintenance page when I flip the toggle in Settings. I (logged in) bypass it.
// Next 16 renamed middleware to proxy, but proxy is hard-locked to the Node.js runtime with no way to opt
// back into edge - the docs say explicitly "if you want to continue using the edge runtime, keep using
// middleware". This file runs on every request across the whole public site, so that swap silently moved
// it from a near-free edge isolate to a billed Node.js Fluid invocation on every single page view; it was
// the majority of a month's Fluid Active CPU. Staying on middleware.ts keeps this cheap, which is the
// entire point of a guard this small and this frequently hit.
//
// I deliberately do NOT wrap this in NextAuth's auth(), so it never needs AUTH_SECRET on public pages and
// never runs the session machinery for every public request. That is safe because the protected dashboard
// layout re-verifies the real session server-side (its own auth() + redirect) and maintenance is not a
// security boundary - it just hides the public site - so a session-cookie presence check is enough here.

import { NextResponse, type NextRequest } from "next/server"

// Edge-side read of the maintenance flag from Upstash (mirrored by lib/maintenance.setMaintenance). I cache
// it briefly per edge instance to avoid a Redis call on every request and FAIL OPEN (never block) on any
// error or missing config, so a flag-read problem can never take the public site down by mistake.
let cached: { on: boolean; at: number } | null = null
async function maintenanceOn(): Promise<boolean> {
  if (cached && Date.now() - cached.at < 10_000) return cached.on
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return false
  try {
    const res = await fetch(`${url}/get/maintenance`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
    const data = (await res.json()) as { result?: string | null }
    const on = data?.result === "1"
    cached = { on, at: Date.now() }
    return on
  } catch {
    return false
  }
}

// NextAuth v5 session cookie names (plain on http/dev, __Secure- prefixed on https/prod).
function hasSession(req: NextRequest): boolean {
  return req.cookies.has("authjs.session-token") || req.cookies.has("__Secure-authjs.session-token")
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith("/api/auth")) return NextResponse.next()
  if (pathname === "/dashboard/login") return NextResponse.next()
  if (pathname.startsWith("/api/dashboard")) return NextResponse.next()

  const loggedIn = hasSession(req)

  // Dashboard pages: fast edge redirect when there is no session cookie. The protected layout re-verifies
  // the real session server-side, so this is only a UX guard, not the security boundary.
  if (pathname.startsWith("/dashboard")) {
    if (!loggedIn) return NextResponse.redirect(new URL("/dashboard/login", req.url))
    return NextResponse.next()
  }

  // Public routes: send logged-out visitors to the maintenance page when maintenance is on. I redirect
  // (not rewrite) so the URL actually becomes /maintenance - that is what makes it render bare, because the
  // shared PublicShell and command menu strip their chrome by matching the path. A rewrite keeps the
  // original URL, so they would render the maintenance content under the normal header and footer. The
  // owner (logged in), the maintenance page itself and API routes are never redirected.
  if (
    !loggedIn &&
    pathname !== "/maintenance" &&
    !pathname.startsWith("/api/") &&
    (await maintenanceOn())
  ) {
    return NextResponse.redirect(new URL("/maintenance", req.url))
  }

  return NextResponse.next()
}

export const config = {
  // Run on everything except Next internals and static assets (anything with a file extension), so the
  // maintenance gate can cover public pages. The logic above still scopes the auth redirect to /dashboard.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|Media/|.*\\.).*)"],
}
