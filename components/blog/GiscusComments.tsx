"use client"
// I load Giscus comments in a client component so I can read the resolved theme
// and pass a matching custom CSS URL. I use a separate discussions repo so comment
// activity does not pollute the main portfolio repo's issue tracker.

import Giscus from "@giscus/react"
import { useTheme } from "next-themes"

export default function GiscusComments() {
  const { resolvedTheme } = useTheme()

  if (process.env.NEXT_PUBLIC_GISCUS_ENABLED?.toLowerCase() === "false") return null
  if (!resolvedTheme) return null

  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID ?? ""
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID ?? ""

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
      theme={resolvedTheme === "dark"
        ? "https://isaacadjei.me/giscus-theme-dark.css"
        : "https://isaacadjei.me/giscus-theme-light.css"
      }
      lang="en"
      loading="eager"
    />
  )
}
