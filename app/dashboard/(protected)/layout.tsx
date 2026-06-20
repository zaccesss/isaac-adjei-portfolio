// I gate every protected dashboard route here with server-side auth and theme sync.
// This layout is separate from the outer dashboard/layout.tsx so only protected routes carry the auth overhead.
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import DashboardSidebar from "../components/DashboardSidebar"
import InactivityGuard from "@/components/dashboard/InactivityGuard"
import QuickCapture from "@/components/dashboard/QuickCapture"
import ShortcutHelp from "@/components/dashboard/ShortcutHelp"
import ThemeSync from "@/components/dashboard/ThemeSync"
import FloatingFormatToolbar from "@/components/shared/FloatingFormatToolbar"
import { Toaster } from "sonner"
import { getCachedTheme } from "@/app/dashboard/actions"

// I set the metadata here so all protected dashboard pages inherit this title without
// affecting the root layout used by the public site
export const metadata = {
  title: { absolute: "Dashboard | Isaac Adjei" },
  robots: "noindex, nofollow",
}

export default async function ProtectedDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  // I redirect here as a server-side safety net even though middleware already guards this path
  if (!session) redirect("/dashboard/login")

  const savedTheme = await getCachedTheme() as string | null

  return (
    <div className="min-h-screen flex bg-background">
      <InactivityGuard />
      <ThemeSync savedTheme={savedTheme} />
      <DashboardSidebar user={session.user ?? {}} />
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-auto min-w-0">
        {children}
      </main>
      <QuickCapture />
      <ShortcutHelp />
      {/* Floating text formatting toolbar - appears on text selection across all dashboard inputs */}
      <FloatingFormatToolbar />
      <Toaster richColors position="bottom-right" />
    </div>
  )
}
