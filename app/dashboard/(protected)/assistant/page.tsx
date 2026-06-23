import AssistantClient from "./AssistantClient"
import { getAiChats } from "@/app/dashboard/actions"

// The in-dashboard AI assistant page. I read the key presence on the server so the client can show a
// friendly "not configured" hint when no provider key is set, without ever exposing the keys, and I
// load the opt-in saved chats so they appear in the side list.
export const dynamic = "force-dynamic"
export const metadata = { title: "Assistant | Isaac Adjei", robots: "noindex, nofollow" }

export default async function AssistantPage() {
  const configured = !!(process.env.GROQ_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.OPENROUTER_API_KEY)
  const chats = await getAiChats()
  return <AssistantClient configured={configured} initialChats={chats} />
}
