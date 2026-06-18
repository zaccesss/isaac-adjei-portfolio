// Preview card for a single project shown in the grid and on the homepage.
// Technologies are capped at 5 - if there are more, a '+N' overflow badge is shown
// so the card doesn't get too tall.

import Link from "next/link"
import Image from "next/image"
import { ExternalLink, Github } from "lucide-react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { type Project } from "@/data/projects"

interface Props {
  project: Project
}

export default function ProjectCard({ project }: Props) {
  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      {project.images[0] && (
        <Link href={`/projects/${project.id}`} className="block overflow-hidden rounded-t-lg">
          <div className="relative h-48 w-full bg-muted">
            <Image
              src={project.images[0]}
              alt={project.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover sm:transition-transform sm:duration-300 sm:hover:scale-105"
            />
          </div>
        </Link>
      )}
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="capitalize text-xs">
              {project.category}
            </Badge>
            {project.ongoing && (
              <Badge className="text-xs bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30 border">
                Ongoing
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground shrink-0">{project.date}</span>
        </div>
        <div>
          <CardTitle className="text-xl">
            <Link href={`/projects/${project.id}`} className="hover:text-primary transition-colors">
              {project.title}
            </Link>
          </CardTitle>
          <CardDescription className="mt-2">{project.description}</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="flex flex-wrap gap-1.5">
          {project.technologies.slice(0, 5).map((tech) => (
            <Badge key={tech} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
          {project.technologies.length > 5 && (
            <Badge variant="secondary" className="text-xs">
              +{project.technologies.length - 5}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        <Button asChild variant="ghost" size="sm" className="pl-0">
          <Link href={`/projects/${project.id}`}>View details</Link>
        </Button>
        {project.github && (
          <Button asChild variant="ghost" size="icon">
            <a href={project.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <Github className="h-4 w-4" />
            </a>
          </Button>
        )}
        {project.demo && (
          <Button asChild variant="ghost" size="icon">
            <a href={project.demo} target="_blank" rel="noopener noreferrer" aria-label="Live demo">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
