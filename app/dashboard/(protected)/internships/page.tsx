import { redirect } from "next/navigation"
// I redirect /internships to /applications because the page was broadened to track all job applications
export default function InternshipsPage() { redirect("/dashboard/applications") }
