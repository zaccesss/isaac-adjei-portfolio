"use client"

// Displays only the projects flagged as featured on the homepage.
// The 'All projects' button is hidden on small screens and shown via a second
// button below the grid so the layout works on both mobile and desktop.

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { projects } from "@/data/projects"
import ProjectCard from "@/components/projects/ProjectCard"
import { staggerContainer, fadeUp } from "@/lib/animations"

export default function FeaturedProjects() {
  const featured = projects.filter((p) => p.featured)

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
              <p className="text-sm font-mono text-primary uppercase tracking-widest">Projects</p>
              <h2 className="text-3xl font-bold tracking-tight">Featured work</h2>
            </div>
            <Button asChild variant="ghost" className="hidden sm:flex">
              <Link href="/projects">
                All projects
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          <motion.div variants={fadeUp} className="grid gap-6 md:grid-cols-2">
            {featured.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="flex sm:hidden">
            <Button asChild variant="outline">
              <Link href="/projects">
                All projects
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
