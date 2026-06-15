// Outer dashboard layout - exists solely to set robots: noindex on all /dashboard
// routes including the login page. The protected layout handles auth and UI chrome.
// manifest points to the dashboard-specific PWA so the browser offers a separate
// "Install Dashboard" prompt, independent of the public portfolio install.
export const metadata = {
  robots: "noindex, nofollow",
  manifest: "/api/dashboard-manifest",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
