// I assemble the homepage sections in order - each section component owns its own logic.

import type { Metadata } from "next"
import Hero from "@/components/sections/Hero"
import AboutPreview from "@/components/sections/AboutPreview"
import FeaturedProjects from "@/components/sections/FeaturedProjects"
import FeaturedBlogPosts from "@/components/sections/FeaturedBlogPosts"
import SkillsOverview from "@/components/sections/SkillsOverview"
import ContactCTA from "@/components/sections/ContactCTA"

export const metadata: Metadata = {
  alternates: {
    canonical: "https://www.isaacadjei.me",
  },
  openGraph: {
    images: ["/api/og?title=Isaac%20Adjei&description=Electronic%20Engineering%20%26%20Computer%20Science%20Student%20at%20Aston%20University."],
  },
}

export default function Home() {
  return (
    <>
      <Hero />
      <AboutPreview />
      <FeaturedProjects />
      <FeaturedBlogPosts />
      <SkillsOverview />
      <ContactCTA />
    </>
  )
}
