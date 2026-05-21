import SettingsClient from "./SettingsClient"

export const dynamic = "force-dynamic"
export const metadata = { robots: "noindex, nofollow" }

export default function SettingsPage() {
  return <SettingsClient />
}
