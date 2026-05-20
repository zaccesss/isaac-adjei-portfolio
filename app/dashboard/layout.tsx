import { auth } from "@/auth"
import { redirect } from "next/navigation"
import DashboardSidebar from "./components/DashboardSidebar"

export const metadata = {
  robots: "noindex, nofollow",
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/dashboard/login")

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <DashboardSidebar user={session.user ?? {}} />
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}
