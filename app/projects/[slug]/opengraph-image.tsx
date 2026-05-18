import { ImageResponse } from "next/og"
import { projects } from "@/data/projects"

export const runtime = "edge"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const CATEGORY_COLOUR: Record<string, string> = {
  embedded:     "#f59e0b",
  web:          "#6366f1",
  software:     "#0ea5e9",
  hardware:     "#22c55e",
  cybersecurity:"#ef4444",
  other:        "#71717a",
}

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = projects.find((p) => p.id === slug)

  if (!project) {
    return new ImageResponse(
      <div tw="h-full w-full flex flex-col justify-between bg-slate-950 text-slate-50 p-16">
        <div tw="flex justify-between items-center text-[28px] uppercase text-slate-300">
          <span>Projects</span>
          <span>isaacadjei.me</span>
        </div>
        <div tw="text-[80px] font-extrabold">Isaac Adjei</div>
        <div tw="text-[32px] text-slate-400">Electronic Engineering and Computer Science</div>
      </div>,
      { ...size },
    )
  }

  const accent = CATEGORY_COLOUR[project.category] ?? "#6366f1"
  const categoryLabel = project.category.charAt(0).toUpperCase() + project.category.slice(1)
  const title = project.title.length > 60 ? project.title.slice(0, 57) + "..." : project.title
  const desc  = project.description.length > 110 ? project.description.slice(0, 107) + "..." : project.description
  // I show at most 5 tech chips so the row stays on one line
  const techs = project.technologies.slice(0, 5)

  return new ImageResponse(
    <div tw="h-full w-full flex flex-col justify-between bg-slate-950 text-slate-50 p-16">
      {/* Top row */}
      <div tw="flex justify-between items-center">
        <div
          tw="flex items-center rounded-full px-4 py-1 text-[22px] font-semibold"
          style={{ background: `${accent}22`, color: accent, border: `1.5px solid ${accent}55` }}
        >
          {categoryLabel}
        </div>
        <span tw="text-[24px] text-slate-400 tracking-wide">isaacadjei.me</span>
      </div>

      {/* Title and description */}
      <div tw="flex flex-col gap-5">
        <div tw="text-[60px] font-extrabold leading-[1.1] text-slate-50">{title}</div>
        <div tw="text-[28px] text-slate-400 leading-snug">{desc}</div>
      </div>

      {/* Tech chips */}
      <div tw="flex gap-3">
        {techs.map((tech) => (
          <div
            key={tech}
            tw="flex items-center rounded-lg px-4 py-1.5 text-[20px] text-slate-300"
            style={{ background: "#1e293b", border: "1px solid #334155" }}
          >
            {tech}
          </div>
        ))}
        {project.technologies.length > 5 && (
          <div
            tw="flex items-center rounded-lg px-4 py-1.5 text-[20px] text-slate-500"
            style={{ background: "#1e293b", border: "1px solid #334155" }}
          >
            +{project.technologies.length - 5} more
          </div>
        )}
      </div>
    </div>,
    { ...size },
  )
}
