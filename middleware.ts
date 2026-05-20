import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // I let auth API routes pass unconditionally so NextAuth can handle its own callbacks
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  // I exempt the login page explicitly - guarding it causes an infinite redirect loop
  if (pathname === "/dashboard/login") {
    return NextResponse.next()
  }

  // I use getToken directly rather than the auth() wrapper to avoid NextAuth triggering its own redirects
  if (pathname.startsWith("/dashboard")) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token) {
      return NextResponse.redirect(new URL("/dashboard/login", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/auth/:path*"],
}
