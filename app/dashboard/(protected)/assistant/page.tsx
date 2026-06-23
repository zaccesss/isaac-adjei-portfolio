import AssistantClient from "./AssistantClient"

// The in-dashboard AI assistant page. I read the key presence on the server so the client can show a
// friendly "not configured" hint when no provider key is set, without ever exposing the keys.
export const dynamic = "force-dynamic"
export const metadata = { title: "Assistant", robots: "noindex, nofollow" }

export default function AssistantPage() {
  const configured = !!(process.env.GROQ_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.OPENROUTER_API_KEY)
  return <AssistantClient configured={configured} />
}
