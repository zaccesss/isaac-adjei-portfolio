import { supabase } from "@/lib/supabase"
import MeClient from "./MeClient"

export const dynamic = "force-dynamic"
export const metadata = { title: "Me", robots: "noindex, nofollow" }

const DEFAULT_PROFILE = {
  name: "Isaac Adjei",
  // dob, student_number and email live only in the me_profile config row in
  // Supabase. This file is public source, so no private identifier goes here.
  dob: "",
  nationality: "Ghanaian",
  location: "Birmingham, UK",
  university: "Aston University",
  course: "BEng Electronic Engineering and Computer Science",
  year: 2,
  student_number: "",
  faith: "Christian",
  bio: "I am a second-year Electronic Engineering and Computer Science student at Aston University with a passion for building things that matter. I grew up in Ghana and moved to the UK in 2022. I am driven by my faith, my family and my desire to create technology that has real-world impact.",
  values: ["Faith and purpose", "Family and loyalty", "Discipline and consistency", "Creativity and building", "Continuous learning"],
  interests: ["Software development", "Electronics and embedded systems", "AI and machine learning", "Gaming and streaming", "Football", "Music and keyboard", "Fashion and style"],
  personality: "Ambitious, creative and deeply driven. I work best when I have clear goals and creative freedom. I value authenticity and real relationships over surface-level connections.",
  github: "zaccesss",
  linkedin: "isaacadjei",
  website: "isaacadjei.me",
  height: "",
  weight: "",
  phone: "",
  email: "",
}

export default async function MePage() {
  const { data } = await supabase.from("config").select("value").eq("key", "me_profile").single()
  const profile = { ...DEFAULT_PROFILE, ...(data?.value as Record<string, unknown> ?? {}) }

  return <MeClient profile={profile} />
}
