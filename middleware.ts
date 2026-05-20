import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl

  if (pathname.startsWith("/api/auth")) return NextResponse.next()
  if (pathname.startsWith("/api/dashboard")) return NextResponse.next()
  if (pathname === "/dashboard/login") return NextResponse.next()

  if (pathname.startsWith("/dashboard") && !req.auth) {
    return NextResponse.redirect(new URL("/dashboard/login", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/dashboard/:path*", "/api/auth/:path*", "/api/dashboard/:path*"],
}
