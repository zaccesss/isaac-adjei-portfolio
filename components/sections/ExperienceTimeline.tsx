"use client"

// Vertical timeline that lists experience entries in order.
// Each entry shows a numbered dot, a type badge, the role title, company
// and a list of achievements. I pass the experiences in as a prop so the
// same component can render both the professional and volunteering lists
// on the Experience page.

import { motion } from "framer-motion"
import { type Experience } from "@/data/experience"
import { Badge } from "@/components/ui/badge"
import { staggerContainer, fadeUp } from "@/lib/animations"
import { cn } from "@/lib/utils"

const typeLabel: Record<Experience["type"], string> = {
  work: "Work",
  internship: "Internship",
  virtual: "Virtual",
}

interface Props {
  experiences: Experience[]
}

export default function ExperienceTimeline({ experiences }: Props) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="relative space-y-8"
    >
      {/* Vertical line */}
      <div className="absolute left-3.5 top-2 bottom-2 w-px bg-border" aria-hidden="true" />

      {experiences.map((exp, i) => (
        <motion.div key={exp.id} variants={fadeUp} className="relative flex gap-4 pl-10">
          {/* Dot */}
          <div className="absolute left-0 mt-1.5 h-7 w-7 rounded-full border-2 border-background bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold shrink-0">
            {i + 1}
          </div>

          <div className="flex-1 min-w-0 space-y-2 pb-2">
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={exp.type === "work" || exp.type === "internship" ? "default" : "outline"}
                  className={cn(
                    "text-xs",
                    exp.type === "internship" &&
                      "bg-amber-500 hover:bg-amber-500 text-white border-amber-500"
                  )}
                >
                  {typeLabel[exp.type]}
                </Badge>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {exp.startDate} - {exp.endDate}
                </span>
              </div>
              <h3 className="font-semibold leading-snug">{exp.role}</h3>
              <p className="text-sm text-muted-foreground">
                {exp.company} · {exp.location}
              </p>
            </div>

            <p className="text-sm text-muted-foreground">{exp.description}</p>

            <ul className="space-y-1">
              {exp.achievements.map((a) => (
                <li key={a} className="text-sm text-muted-foreground flex gap-2">
                  <span className="text-primary mt-0.5 shrink-0">·</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>

            {exp.technologies && exp.technologies.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {exp.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-xs text-muted-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
