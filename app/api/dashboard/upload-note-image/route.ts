import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "node:crypto"
import { auth } from "@/auth"
import { supabase } from "@/lib/supabase"
import { checkRateLimit, heavyApiLimiter, getIp } from "@/lib/ratelimit"

// I accept an image file from the notes/diary editor and store it in the PRIVATE user-files bucket
// under note-images/. I return an auth-gated proxy URL (not a public storage URL) because notes and
// diary entries can hold sensitive content - only a logged-in session can ever fetch the image back.
export const runtime = "nodejs"

const MAX_BYTES = 5 * 1024 * 1024
const noStore = { "Cache-Control": "no-store" }

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401, headers: noStore })
  if (!(await checkRateLimit(heavyApiLimiter, getIp(req)))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: noStore })
  }

  const form = await req.formData()
  const file = form.get("file")
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400, headers: noStore })
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Not an image" }, { status: 400, headers: noStore })
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Image too large (max 5MB)" }, { status: 400, headers: noStore })

  const ext = (file.name.split(".").pop() || file.type.split("/")[1] || "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png"
  const path = `note-images/${randomUUID()}.${ext}`
  const { error } = await supabase.storage.from("user-files").upload(path, file, { contentType: file.type, upsert: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: noStore })

  return NextResponse.json({ url: `/api/dashboard/note-image?path=${encodeURIComponent(path)}` }, { headers: noStore })
}
