// This layout wraps every protected dashboard page and handles the server-side auth
// check, theme sync and global UI chrome (sidebar, quick capture, toaster).
// It exists as a separate file from the outer dashboard/layout.tsx so only protected
// routes carry the auth overhead - the login page uses the outer layout alone.
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import DashboardSidebar from "../components/DashboardSidebar"
import InactivityGuard from "@/components/dashboard/InactivityGuard"
import QuickCapture from "@/components/dashboard/QuickCapture"
import ShortcutHelp from "@/components/dashboard/ShortcutHelp"
import ThemeSync from "@/components/dashboard/ThemeSync"
import { Toaster } from "sonner"
import { getConfig } from "@/app/dashboard/actions"

// I set the metadata here so all protected dashboard pages inherit this title without
// affecting the root layout used by the public site
export const metadata = {
  title: { absolute: "Isaac Adjei | Dashboard" },
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

  const savedTheme = await getConfig("theme_preference") as string | null

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
      <Toaster richColors position="bottom-right" />
    </div>
  )
}
