import Image from "next/image"
import { getMaintenance } from "@/lib/maintenance"

export const dynamic = "force-dynamic"
export const metadata = { title: "Under maintenance", robots: "noindex, nofollow" }

// Always reachable at /maintenance (so I can preview it any time, locally or deployed). The middleware
// only rewrites the public here while maintenance is on; I stay on the real site when logged in.
export default async function MaintenancePage() {
  const { message } = await getMaintenance()
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 py-16 text-center bg-background text-foreground">
      <Image src="/Media/giphy.gif" alt="" width={220} height={220} unoptimized priority className="rounded-2xl" />
      <div className="max-w-md flex flex-col gap-3">
        <h1 className="text-2xl font-bold">Under maintenance</h1>
        <p className="text-muted-foreground whitespace-pre-wrap">
          {message || "I'm fixing something or making a few improvements. Be back soon!"}
        </p>
        <p className="text-sm text-muted-foreground">
          Urgent? Reach me at{" "}
          <a href="mailto:contact@isaacadjei.me" className="text-primary underline underline-offset-2">contact@isaacadjei.me</a>
        </p>
      </div>
    </main>
  )
}
