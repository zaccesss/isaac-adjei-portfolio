import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getLinearTeams } from "@/lib/linear-sync"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const teams = await getLinearTeams()
  return NextResponse.json({ teams }, { headers: { "Cache-Control": "no-store" } })
}
