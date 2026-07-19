import { redirect } from "next/navigation"

export const metadata = { title: "Gym" }
// I redirect /gym to /health because the gym section was merged into the broader Health and Fitness page
export default function GymPage() { redirect("/dashboard/health") }
