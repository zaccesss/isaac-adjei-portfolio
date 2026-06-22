import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { supabase } from "@/lib/supabase"

// I serve note/diary images from the private bucket behind the dashboard session: I sign a short-lived
// URL on each request and redirect to it, so a logged-out visitor with the link gets nothing. I only
// ever sign paths under note-images/, so this can never be turned into a reader for other stored files.
export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return new NextResponse("Unauthorised", { status: 401, headers: { "Cache-Control": "no-store" } })

  const path = req.nextUrl.searchParams.get("path")
  if (!path || !path.startsWith("note-images/")) {
    return new NextResponse("Bad request", { status: 400, headers: { "Cache-Control": "no-store" } })
  }

  const { data, error } = await supabase.storage.from("user-files").createSignedUrl(path, 3600)
  if (error || !data) return new NextResponse("Not found", { status: 404, headers: { "Cache-Control": "no-store" } })

  return NextResponse.redirect(data.signedUrl, { headers: { "Cache-Control": "no-store" } })
}
