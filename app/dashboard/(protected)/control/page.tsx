// Mission control: run any allow-listed workflow across my six repos, watch each job's health and
// hold the operational switches that used to live in Settings. Force-dynamic so statuses are live.

import ControlClient from "./ControlClient"

export const dynamic = "force-dynamic"
export const metadata = { title: "Control", robots: "noindex, nofollow" }

export default function ControlPage() {
  return <ControlClient />
}
