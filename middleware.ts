// I guard /dashboard at the edge (redirect to login when logged out) and gate the public site behind a
// maintenance page when I flip the toggle in Settings. I (logged in) always bypass maintenance.

import { auth } from "@/auth"
import { NextResponse } from "next/server"

// Edge-side read of the maintenance flag from Upstash (mirrored by lib/maintenance.setMaintenance). I cache
// it briefly per edge instance to avoid a Redis call on every request, and FAIL OPEN (never block) on any
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

export default auth(async (req) => {
  const { pathname } = req.nextUrl

  // NextAuth callbacks, the login page and dashboard API handlers always pass through.
  if (pathname.startsWith("/api/auth")) return NextResponse.next()
  if (pathname === "/dashboard/login") return NextResponse.next()
  if (pathname.startsWith("/api/dashboard")) return NextResponse.next()

  // Dashboard pages: auth guard. The owner always has full access; maintenance never blocks the dashboard.
  if (pathname.startsWith("/dashboard")) {
    if (!req.auth) return NextResponse.redirect(new URL("/dashboard/login", req.url))
    return NextResponse.next()
  }

  // Public routes: show the maintenance page to logged-out visitors when maintenance is on. The owner
  // (logged in), the maintenance page itself and API routes are never rewritten.
  if (
    !req.auth &&
    pathname !== "/maintenance" &&
    !pathname.startsWith("/api/") &&
    (await maintenanceOn())
  ) {
    return NextResponse.rewrite(new URL("/maintenance", req.url))
  }

  return NextResponse.next()
})

export const config = {
  // Run on everything except Next internals and static assets (anything with a file extension), so the
  // maintenance gate can cover public pages. The logic above still scopes the auth redirect to /dashboard.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|Media/|.*\\.).*)"],
}
