"use client"

// Row of filter buttons that lets users narrow projects by category.
// The parent (ProjectGrid) owns the state - this component just receives the current
// filter value and an onChange callback.

import { type Project } from "@/data/projects"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Category = Project["category"] | "all"

// I include "all" as a synthetic option - it is not a real Project category so the parent treats it as "no filter"
const categories: { value: Category; label: string }[] = [
  { value: "all", label: "All" },
  { value: "embedded", label: "Embedded" },
  { value: "hardware", label: "Hardware" },
  { value: "software", label: "Software" },
  { value: "web", label: "Web" },
  { value: "cybersecurity", label: "Cybersecurity" },
  { value: "other", label: "Other" },
]

interface Props {
  active: Category
  onChange: (cat: Category) => void
}

export default function ProjectFilter({ active, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter projects by category">
      {categories.map((cat) => (
        <Button
          key={cat.value}
          variant={active === cat.value ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(cat.value)}
          className={cn("rounded-full")}
        >
          {cat.label}
        </Button>
      ))}
    </div>
  )
}
