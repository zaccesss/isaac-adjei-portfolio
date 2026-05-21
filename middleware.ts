import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl

  // I let NextAuth's own callback routes through before checking for a session
  if (pathname.startsWith("/api/auth")) return NextResponse.next()
  // I bypass auth on dashboard API routes because each handler checks auth() internally
  if (pathname.startsWith("/api/dashboard")) return NextResponse.next()
  // I allow the login page through to avoid an infinite redirect loop
  if (pathname === "/dashboard/login") return NextResponse.next()

  // I redirect any unauthenticated dashboard visit rather than showing a blank/broken page
  if (pathname.startsWith("/dashboard") && !req.auth) {
    return NextResponse.redirect(new URL("/dashboard/login", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/dashboard/:path*", "/api/auth/:path*", "/api/dashboard/:path*"],
}
