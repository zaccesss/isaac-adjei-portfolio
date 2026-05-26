// I generate /robots.txt at build time.
// I disallow all crawlers from /dashboard and all its sub-routes so the private
// section never appears in search results even if someone links to it.

import { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/constants"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/api/dashboard/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
