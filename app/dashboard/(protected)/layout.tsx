import { auth } from "@/auth"
import { redirect } from "next/navigation"
import DashboardSidebar from "../components/DashboardSidebar"
import InactivityGuard from "@/components/dashboard/InactivityGuard"

export default async function ProtectedDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  // I redirect here as a server-side safety net even though middleware already guards this path
  if (!session) redirect("/dashboard/login")

  return (
    <div className="min-h-screen flex bg-background">
      <InactivityGuard />
      <DashboardSidebar user={session.user ?? {}} />
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-auto min-w-0">
        {children}
      </main>
    </div>
  )
}
