"use client"

import Link from "next/link"
import { ArrowLeft, Github, ExternalLink } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { type Project } from "@/data/projects"
import { staggerContainer, fadeUp } from "@/lib/animations"

interface Props {
  project: Project
}

export default function ProjectDetail({ project }: Props) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="container max-w-3xl py-24 space-y-10"
    >
      <motion.div variants={fadeUp}>
        <Button asChild variant="ghost" size="sm" className="pl-0 mb-6">
          <Link href="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to projects
          </Link>
        </Button>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="capitalize">
              {project.category}
            </Badge>
            <span className="text-sm text-muted-foreground">{project.date}</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">{project.title}</h1>
          <p className="text-lg text-muted-foreground">{project.description}</p>

          <div className="flex gap-3 pt-2">
            {project.github && (
              <Button asChild variant="outline" size="sm">
                <a href={project.github} target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </a>
              </Button>
            )}
            {project.demo && (
              <Button asChild size="sm">
                <a href={project.demo} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Live demo
                </a>
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      <Separator />

      <motion.div variants={fadeUp} className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Overview</h2>
          <p className="text-muted-foreground leading-relaxed">{project.longDescription}</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Key highlights</h2>
          <ul className="space-y-2">
            {project.highlights.map((h) => (
              <li key={h} className="flex gap-3 text-muted-foreground">
                <span className="text-primary mt-0.5 shrink-0">·</span>
                {h}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Technologies</h2>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <Badge key={tech} variant="secondary">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
