// I render the settings page which wraps SettingsClient - force-dynamic so triggers and workflow status always fetch live.

import SettingsClient from "./SettingsClient"

export const dynamic = "force-dynamic"
export const metadata = { robots: "noindex, nofollow" }

export default function SettingsPage() {
  return <SettingsClient />
}
