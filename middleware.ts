import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl

  // allow the login page and NextAuth API routes through unconditionally
  if (
    pathname === "/dashboard/login" ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next()
  }

  if (pathname.startsWith("/dashboard") && !req.auth) {
    return NextResponse.redirect(new URL("/dashboard/login", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/dashboard/:path*", "/api/auth/:path*"],
}
