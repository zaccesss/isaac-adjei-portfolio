import { getUserFiles } from "@/app/dashboard/actions"
import FilesClient from "./FilesClient"

export const dynamic = "force-dynamic"
export const metadata = { title: "Files", robots: "noindex, nofollow" }

export default async function FilesPage() {
  const files = await getUserFiles()
  return <FilesClient initial={files} />
}
