import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Isaac Adjei | Dashboard",
    short_name: "Zacess",
    description: "Isaac Adjei's personal dashboard",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#09090b",
    orientation: "portrait",
    icons: [
      {
        src: "/images/avatar.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/avatar.png",
        sizes: "any",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
