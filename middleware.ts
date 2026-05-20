import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // auth API routes always pass through
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  // login page always passes through - must not be guarded or it loops
  if (pathname === "/dashboard/login") {
    return NextResponse.next()
  }

  // all other /dashboard routes require a valid JWT
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
