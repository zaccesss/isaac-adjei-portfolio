// I generate per-post OG images with type badge, title, description and date/reading-time footer.

import { ImageResponse } from "next/og"
import { getPostBySlug } from "@/data/blog"

export const runtime = "edge"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const TYPE_COLOUR: Record<string, string> = {
  blog:      "#6366f1",
  journal:   "#22c55e",
  research:  "#f59e0b",
  notes:     "#71717a",
  report:    "#a855f7",
  article:   "#0ea5e9",
  resources: "#f97316",
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post || !post.published) {
    return new ImageResponse(
      <div tw="h-full w-full flex flex-col justify-between bg-slate-950 text-slate-50 p-16">
        <div tw="flex justify-between items-center text-[28px] tracking-[1px] uppercase text-slate-300">
          <span>Blog</span>
          <span>isaacadjei.me</span>
        </div>
        <div tw="text-[80px] font-extrabold leading-tight">Isaac Adjei</div>
        <div tw="text-[32px] text-slate-400">Electronic Engineering and Computer Science</div>
      </div>,
      { ...size },
    )
  }

  const accent = TYPE_COLOUR[post.type] ?? "#6366f1"
  const typeLabel = post.type.charAt(0).toUpperCase() + post.type.slice(1)
  const title = post.title.length > 72 ? post.title.slice(0, 69) + "..." : post.title
  const desc  = post.description.length > 120 ? post.description.slice(0, 117) + "..." : post.description

  return new ImageResponse(
    <div tw="h-full w-full flex flex-col justify-between bg-slate-950 text-slate-50 p-16">
      {/* Top row */}
      <div tw="flex justify-between items-center">
        <div
          tw="flex items-center rounded-full px-4 py-1 text-[22px] font-semibold"
          style={{ background: `${accent}22`, color: accent, border: `1.5px solid ${accent}55` }}
        >
          {typeLabel}
        </div>
        <span tw="text-[24px] text-slate-400 tracking-wide">isaacadjei.me</span>
      </div>

      {/* Title and description */}
      <div tw="flex flex-col gap-5">
        <div tw="text-[58px] font-extrabold leading-[1.1] text-slate-50">{title}</div>
        <div tw="text-[28px] text-slate-400 leading-snug">{desc}</div>
      </div>

      {/* Footer */}
      <div tw="flex justify-between items-center text-[24px] text-slate-500">
        <span>{formatDate(post.date)}</span>
        <span>{post.readingTime} min read</span>
      </div>
    </div>,
    { ...size },
  )
}
