"use client"

// Skills preview section on the homepage.
// I only show the first two skill categories here and filter out a few less-common
// languages to keep the list concise. The full list lives on the /skills page.

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { skillCategories } from "@/data/skills"
import { staggerContainer, fadeUp } from "@/lib/animations"

export default function SkillsOverview() {
  const HIDDEN_ON_HOME = ["Assembly", "Rust", "C#", "Go", "JSON", "Markdown"]
  const SHOW_CATEGORIES = ["Platforms & Operating Systems", "Core Tools", "Languages & Software"]
  const topCategories = skillCategories
    .filter((cat) => SHOW_CATEGORIES.includes(cat.category))
    .sort((a, b) => SHOW_CATEGORIES.indexOf(a.category) - SHOW_CATEGORIES.indexOf(b.category))
    .map((cat) =>
      cat.category === "Languages & Software"
        ? { ...cat, skills: cat.skills.filter((s) => !HIDDEN_ON_HOME.includes(s.name)) }
        : cat
    )

  return (
    <section className="py-24 border-t">
      <div className="container space-y-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-10"
        >
          <motion.div variants={fadeUp} className="flex items-end justify-between">
            <div className="space-y-2">
              <p className="text-sm font-mono text-primary uppercase tracking-widest">Skills</p>
              <h2 className="text-3xl font-bold tracking-tight">Technologies I work with</h2>
            </div>
            <Button asChild variant="ghost" className="hidden sm:flex">
              <Link href="/skills">
                All skills
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          <motion.div variants={fadeUp} className="grid gap-8 sm:grid-cols-3">
            {topCategories.map((cat) => (
              <div key={cat.category} className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {cat.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {cat.skills.map((skill) => (
                    <Badge key={skill.name} variant="outline">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
