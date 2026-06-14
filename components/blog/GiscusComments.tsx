"use client"

import Giscus from "@giscus/react"
import { useTheme } from "next-themes"

export default function GiscusComments() {
  const { resolvedTheme } = useTheme()

  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID

  if (process.env.NEXT_PUBLIC_GISCUS_ENABLED?.toLowerCase() !== "true" || !repoId || !categoryId) return null

  return (
    <Giscus
      repo="zaccesss/isaac-adjei-portfolio-discussions"
      repoId={repoId}
      category="Announcements"
      categoryId={categoryId}
      mapping="pathname"
      strict="1"
      reactionsEnabled="0"
      emitMetadata="0"
      inputPosition="top"
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      lang="en"
      loading="lazy"
    />
  )
}
