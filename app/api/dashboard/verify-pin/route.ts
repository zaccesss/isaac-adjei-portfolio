import { NextRequest, NextResponse } from "next/server"
import { verifyPin } from "@/lib/pin"
import { auth } from "@/auth"

export async function POST(req: NextRequest) {
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

  const res = NextResponse.json({ ok: true })
  res.cookies.set("dashboard_pin_verified", "1", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 4, // 4 hours
    path: "/",
  })
  return res
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const res = NextResponse.json({ ok: true })
  res.cookies.delete("dashboard_pin_verified")
  return res
}
