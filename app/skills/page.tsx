"use client"

// I use React hooks (useEffect, useRef, useState) so this must be a client component.

import { useEffect, useRef, useState } from "react"
import { skillCategories, professionalSkillGroups, type Skill } from "@/data/skills"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// SkillCard renders a single icon + label tile.
// I show the icon image if a URL is available, otherwise I fall back to the first two letters of the name.
function SkillCard({ skill }: { skill: Skill }) {
  return (
    <div className="group flex flex-col items-center gap-2 p-3 w-[88px] rounded-xl border bg-card hover:border-primary/50 hover:shadow-lg hover:-translate-y-1.5 hover:scale-105 transition-all duration-200 cursor-default">
      {skill.icon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={skill.icon}
          alt={skill.name}
          width={36}
          height={36}
          className="w-9 h-9 object-contain"
          loading="lazy"
        />
      ) : (
        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
          {skill.name.slice(0, 2).toUpperCase()}
        </div>
      )}
      <span className="text-[10px] font-medium text-center leading-tight text-muted-foreground group-hover:text-foreground transition-colors">
        {skill.name}
      </span>
    </div>
  )
}

// CategorySection renders one tech stack category section.
// I use IntersectionObserver to fade the section in when it scrolls into view.
// This fires once per section and then disconnects itself to avoid wasting memory.
function CategorySection({ cat }: { cat: (typeof skillCategories)[0] }) {
  // ref lets me attach the IntersectionObserver to the actual DOM element
  const ref = useRef<HTMLElement>(null)
  // visible tracks whether this section has entered the viewport yet
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // IntersectionObserver calls my callback whenever the element enters or leaves the viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Once visible I set the flag and stop watching - I only want the animation once
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 } // trigger when at least 10% of the element is visible
    )
    observer.observe(el)
    // cleanup: if the component unmounts before the animation fires, stop observing
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      className={cn(
        "transition-all duration-700",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      )}
    >
      <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-5 text-center">
        {cat.category}
      </h2>
      <div className={cn("skills-grid", `skills-cols-${cat.columns}`)}>
        {cat.skills.map((skill) => (
          <SkillCard key={skill.name} skill={skill} />
        ))}
      </div>
    </section>
  )
}

export default function SkillsPage() {
  return (
    <div className="container py-24 space-y-14">
      <div className="space-y-3 animate-fade-up text-center">
        <h1 className="text-4xl font-bold tracking-tight">Skills</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A full picture of what I bring - professional skills, hardware experience and the tech
          stack I work with.
        </p>
      </div>

      {/* Professional & Hardware Skills */}
      <div className="space-y-8 animate-fade-up">
        {professionalSkillGroups.map((group) => (
          <section key={group.label} className="space-y-4">
            <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest text-center">
              {group.label}
            </h2>
            <div className="flex flex-wrap justify-center gap-2">
              {group.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-sm px-3 py-1">
                  {skill}
                </Badge>
              ))}
            </div>
          </section>
        ))}
      </div>

      <Separator />

      {/* Tech Stack heading */}
      <div className="space-y-3 text-center">
        <h2 className="text-2xl font-bold tracking-tight">Tech Stack</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Technologies I work with and am actively learning. Some are daily tools, others I&apos;m
          still developing.
        </p>
      </div>

      <div className="space-y-12">
        {skillCategories.map((cat) => (
          <CategorySection key={cat.category} cat={cat} />
        ))}
      </div>

      <p className="text-xs text-center max-w-xl mx-auto leading-relaxed text-primary/80">
        <strong className="text-primary">NB:</strong> I am not an expert in all these technologies
        yet. This is a living document that reflects what I am actively using and what I am
        learning. Some tools are part of my daily workflow, others are at beginner level. The
        process of continuous learning is what drives my interest in technology and innovation.
      </p>
    </div>
  )
}
