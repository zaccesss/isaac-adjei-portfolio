// I use auth() here because this project uses NextAuth v5 - getToken (v4) always
// returned null when NEXTAUTH_SECRET was not set, causing every PIN attempt to 401.
import { NextRequest, NextResponse } from "next/server"
import { verifyPin } from "@/lib/pin"
import { auth } from "@/auth"

export async function POST(req: NextRequest) {
  // I require an active dashboard session before accepting a PIN attempt
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const { pin } = await req.json()
  if (!pin || typeof pin !== "string") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const valid = await verifyPin(pin)
  if (!valid) {
    return NextResponse.json({ error: "Wrong PIN" }, { status: 403 })
  }

  // I set an httpOnly cookie so the PIN gate stays unlocked for 4 hours across
  // Diary, Notes and Vault without the user having to re-enter it each time
  const res = NextResponse.json({ ok: true })
  res.cookies.set("dashboard_pin_verified", "1", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 4,
    path: "/",
  })
  return res
}

export async function DELETE(req: NextRequest) {
  // I expose a DELETE endpoint so I can manually lock the PIN gate if needed
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const res = NextResponse.json({ ok: true })
  res.cookies.delete("dashboard_pin_verified")
  return res
}
