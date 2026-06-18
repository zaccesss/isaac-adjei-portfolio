// I generate /robots.txt at build time.
// I disallow all crawlers from /dashboard and all its sub-routes so the private
// section never appears in search results even if someone links to it.
// AI training and assistant crawlers are blocked entirely - content is not available for training.

import { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/constants"

// Every known AI training and assistant crawler as of mid-2026.
// Listed individually so each gets its own User-agent block in the output.
const AI_BOTS = [
  "GPTBot",           // OpenAI training
  "ChatGPT-User",     // OpenAI browsing plugin
  "OAI-SearchBot",    // OpenAI search
  "anthropic-ai",     // Anthropic training
  "Claude-Web",       // Anthropic web search
  "CCBot",            // Common Crawl (feeds many model datasets)
  "Google-Extended",  // Google AI training (separate from Search)
  "Gemini-Crawling",  // Google Gemini
  "PerplexityBot",    // Perplexity AI
  "YouBot",           // You.com
  "Diffbot",          // Diffbot AI extraction
  "FacebookBot",      // Meta AI training
  "Meta-ExternalAgent", // Meta AI assistant
  "cohere-ai",        // Cohere training
  "Bytespider",       // ByteDance/TikTok AI
  "PetalBot",         // Huawei AI
  "omgilibot",        // Webz.io data collection
  "omgili",           // Webz.io data collection
]

export default function robots(): MetadataRoute.Robots {
  const aiRules: MetadataRoute.Robots["rules"] = AI_BOTS.map((bot) => ({
    userAgent: bot,
    disallow: "/",
  }))

  return {
    rules: [
      // I block all AI crawlers first - order matters for some parsers
      ...aiRules,
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/api/dashboard/", "/cv/", "/cv"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
