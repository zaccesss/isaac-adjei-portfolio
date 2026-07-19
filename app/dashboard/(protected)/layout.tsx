// I gate every protected dashboard route here with server-side auth and theme sync.
// This layout is separate from the outer dashboard/layout.tsx so only protected routes carry the auth overhead.
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import DashboardSidebar from "../components/DashboardSidebar"
import InactivityGuard from "@/components/dashboard/InactivityGuard"
import QuickCapture from "@/components/dashboard/QuickCapture"
import FloatingAssistant from "@/components/dashboard/FloatingAssistant"
import ShortcutHelp from "@/components/dashboard/ShortcutHelp"
import ThemeSync from "@/components/dashboard/ThemeSync"
import FloatingFormatToolbar from "@/components/shared/FloatingFormatToolbar"
import DashboardThemeToggle from "../components/DashboardThemeToggle"
import { Toaster } from "sonner"
import { getCachedTheme } from "@/app/dashboard/actions"

// A title template rather than an absolute title, so every dashboard page names itself in the tab
// the way the public pages do (Me | Isaac Adjei, Goals | Isaac Adjei); anything without its own
// title falls back to the plain Dashboard tab.
export const metadata = {
  title: { template: "%s | Isaac Adjei", default: "Dashboard | Isaac Adjei" },
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
      <DashboardThemeToggle />
      <DashboardSidebar user={session.user ?? {}} />
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-auto min-w-0">
        {children}
      </main>
      <QuickCapture />
      <FloatingAssistant />
      <ShortcutHelp />
      {/* Floating text formatting toolbar - appears on text selection across all dashboard inputs */}
      <FloatingFormatToolbar />
      <Toaster richColors position="bottom-right" />
    </div>
  )
}
