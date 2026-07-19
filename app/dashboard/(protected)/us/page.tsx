// I load the 'Us' page data from Supabase and pass it to UsClient - a private page for our relationship vision, mission and shared notes.

import { supabase } from "@/lib/supabase"
import UsClient from "./UsClient"

export const dynamic = "force-dynamic"
export const metadata = { title: "Us", robots: "noindex, nofollow" }

const DEFAULT_DATA = {
  vision: "To build a relationship rooted in God, honesty, mutual growth and unconditional love.",
  mission: "To show up for each other every day - in the small things and the big things - with patience, care and intentionality.",
  notes: "This page is our covenant. Everything here is a reminder of what we are building together.",
  isaac_routine: [
    { time: "6:00am", activity: "Wake up, quiet time, Bible" },
    { time: "7:00am", activity: "Gym or morning walk" },
    { time: "9:00am", activity: "University / study" },
    { time: "1:00pm", activity: "Lunch, break, check in with Pam" },
    { time: "3:00pm", activity: "Deep work / projects" },
    { time: "7:00pm", activity: "Dinner, wind down" },
    { time: "10:00pm", activity: "Evening call with Pam, sleep by midnight" },
  ],
  pam_routine: [
    { time: "7:00am", activity: "Wake up, morning routine" },
    { time: "9:00am", activity: "Studies / work" },
    { time: "1:00pm", activity: "Lunch, check in with Isaac" },
    { time: "5:00pm", activity: "Personal time, hobbies" },
    { time: "8:00pm", activity: "Evening wind down" },
    { time: "10:00pm", activity: "Call with Isaac, sleep" },
  ],
  pledges: [
    { text: "I will always be honest with you, even when it is hard.", status: "yes" },
    { text: "I will pray for you every single day.", status: "yes" },
    { text: "I will never go to bed angry without trying to resolve things first.", status: "yes" },
    { text: "I will celebrate your wins as if they are my own.", status: "yes" },
    { text: "I will give you space when you need it and show up when you need me.", status: "yes" },
    { text: "I will never take you for granted.", status: "yes" },
  ],
  things_to_remember: [
    "Her love language is quality time and words of affirmation",
    "She notices the small thoughtful things more than grand gestures",
    "She needs reassurance when she goes quiet - check in on her",
    "She works hard and deserves to be told that regularly",
    "She appreciates effort over perfection",
  ],
  things_she_dislikes: [
    "Being ignored or left on read for long periods",
    "Feeling like she is not a priority",
    "Passive-aggressive behaviour",
    "Broken promises, even small ones",
    "Being talked over or dismissed",
  ],
  rules: [
    { text: "Daily check-in call, even if just 10 minutes", status: "yes" },
    { text: "No going to sleep angry without at least a message", status: "yes" },
    { text: "Hug for at least 10 seconds when we see each other", status: "yes" },
    { text: "No social media drama or vague posting", status: "yes" },
    { text: "Monthly date, no excuses", status: "yes" },
  ],
  traditions: [
    "Friday evening call - no exceptions",
    "Celebrate each other's wins, no matter how small",
    "Pray together at least once a week",
    "Annual trip somewhere new",
    "Write each other a letter on our anniversary",
  ],
}

export default async function UsPage() {
  const { data } = await supabase.from("config").select("value").eq("key", "us_data").single()
  const usData = { ...DEFAULT_DATA, ...(data?.value as Record<string, unknown> ?? {}) }
  return <UsClient data={usData as typeof DEFAULT_DATA} />
}
