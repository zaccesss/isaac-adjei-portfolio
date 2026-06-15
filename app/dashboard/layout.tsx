// Outer dashboard layout - exists solely to set robots: noindex on all /dashboard
// routes including the login page. The protected layout handles auth and UI chrome.
export const metadata = {
  robots: "noindex, nofollow",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
