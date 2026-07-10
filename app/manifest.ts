// I define the public portfolio PWA manifest so visitors can install the site as an app.
// The dashboard has its own separate manifest at /api/dashboard-manifest.

import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Isaac Adjei",
    short_name: "IA",
    description: "Electronic Engineering and Computer Science student at Aston University. Building full-stack software, embedded systems, AI/ML and data science solutions.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#09090b",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  }
}
