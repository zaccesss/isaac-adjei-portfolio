import Image from "next/image"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getMaintenance } from "@/lib/maintenance"

export const dynamic = "force-dynamic"
export const metadata = { title: "Under maintenance", robots: "noindex, nofollow" }

// I gate this page so the public can never stumble onto it: when maintenance is OFF, only I (a session
// cookie present) can open it to preview; everyone else is sent home. When it is ON, the middleware
// rewrites the public here and they see it. I use a cookie-presence check (not auth()) so this page needs
// no AUTH_SECRET, matching the middleware. I can preview my unsaved message via ?preview= (mine only).
export default async function MaintenancePage({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const [{ enabled, message }, jar, params] = await Promise.all([getMaintenance(), cookies(), searchParams])
  const isOwner = jar.has("authjs.session-token") || jar.has("__Secure-authjs.session-token")
  // Hide it from non-owners in production only; in local dev I can always open it to preview the design.
  if (!enabled && !isOwner && process.env.NODE_ENV === "production") redirect("/")

  const shown =
    (isOwner && typeof params.preview === "string" ? params.preview : message) ||
    "I'm fixing something or making a few improvements. Be back soon!"

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 py-16 text-center bg-background text-foreground">
      <Image src="/Media/giphy.gif" alt="" width={220} height={220} unoptimized priority className="rounded-2xl h-auto w-[220px]" />
      <div className="max-w-md flex flex-col gap-3">
        <h1 className="text-2xl font-bold">Under maintenance</h1>
        <p className="text-muted-foreground whitespace-pre-wrap">{shown}</p>
        <p className="text-sm text-muted-foreground">
          Urgent? Reach me at{" "}
          <a href="mailto:contact@isaacadjei.me" className="text-primary underline underline-offset-2">contact@isaacadjei.me</a>
        </p>
      </div>
    </main>
  )
}
