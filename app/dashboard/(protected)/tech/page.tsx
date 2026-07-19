import { redirect } from "next/navigation"

export const metadata = { title: "Tech" }
// I redirect /tech to /inventory because the tech items tracker was renamed to Inventory
export default function TechPage() { redirect("/dashboard/inventory") }
