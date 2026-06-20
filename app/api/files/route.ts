// File manager API: GET lists files, POST uploads a file to Supabase Storage.
// Auth is checked via the dashboard session cookie on every request.
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { supabase } from "@/lib/supabase"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const { data, error } = await supabase
    .from("user_files")
    .select("*")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
  }

  const file = formData.get("file") as File | null
  const folder = (formData.get("folder") as string | null) ?? "General"

  if (!file || file.size === 0) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  // 500 MB limit
  if (file.size > 500 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 500 MB)" }, { status: 413 })
  }

  const ext = file.name.split(".").pop() ?? ""
  // I sanitise the folder the same way as the filename so a crafted value like "../" cannot
  // escape the storage bucket prefix.
  const safeFolder = folder.toLowerCase().replace(/[^a-z0-9._-]/g, "_")
  const storagePath = `${safeFolder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`

  const arrayBuffer = await file.arrayBuffer()
  const { error: uploadError } = await supabase.storage
    .from("user-files")
    .upload(storagePath, arrayBuffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: inserted, error: dbError } = await supabase
    .from("user_files")
    .insert({
      name: file.name,
      original_name: file.name,
      folder,
      size_bytes: file.size,
      mime_type: file.type || `application/${ext}`,
      storage_path: storagePath,
      is_deleted: false,
    })
    .select()
    .single()

  if (dbError) {
    // Clean up the uploaded file if the DB insert fails
    await supabase.storage.from("user-files").remove([storagePath])
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json(inserted, { status: 201 })
}
