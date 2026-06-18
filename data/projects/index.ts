// I store all portfolio project data here - the featured flag controls homepage display.

export interface Project {
  id: string
  title: string
  description: string
  longDescription: string
  technologies: string[]
  category: "embedded" | "web" | "software" | "hardware" | "cybersecurity" | "iot" | "academic" | "other"
  featured: boolean
  images: string[]
  // optional path to a demo video shown below the gallery on the project detail page
  video?: string
  github?: string
  demo?: string
  date: string
  highlights: string[]
  ongoing?: boolean
}

// Auto-generated: one file per entry
import _0 from "./items/audio-amplifier"
import _1 from "./items/led-cube"
import _2 from "./items/astoncv"
import _3 from "./items/zacess-pages"
import _4 from "./items/cnc-control"
import _5 from "./items/goods-lift"
import _6 from "./items/cad-portfolio"
import _7 from "./items/git-unlocked"
import _8 from "./items/phaemos"
import _9 from "./items/avr-zac"
import _10 from "./items/dotfiles"

export const projects: Project[] = [
  _0,
  _1,
  _2,
  _3,
  _4,
  _5,
  _6,
  _7,
  _8,
  _9,
  _10,
]
