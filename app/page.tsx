// Homepage - assembles the five homepage sections in order.
// All the heavy lifting lives inside the individual section components.

import type { Metadata } from "next"
import Hero from "@/components/sections/Hero"
import AboutPreview from "@/components/sections/AboutPreview"
import FeaturedProjects from "@/components/sections/FeaturedProjects"
import SkillsOverview from "@/components/sections/SkillsOverview"
import ContactCTA from "@/components/sections/ContactCTA"

export const metadata: Metadata = {
  alternates: {
    canonical: "https://isaacadjei.me",
  },
}

export default function Home() {
  return (
    <>
      <Hero />
      <AboutPreview />
      <FeaturedProjects />
      <SkillsOverview />
      <ContactCTA />
    </>
  )
}
