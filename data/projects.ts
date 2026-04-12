export interface Project {
  id: string
  title: string
  description: string
  longDescription: string
  technologies: string[]
  category: "embedded" | "web" | "software" | "hardware" | "other"
  featured: boolean
  images: string[]
  github?: string
  demo?: string
  date: string
  highlights: string[]
}

export const projects: Project[] = [
  {
    id: "led-cube",
    title: "4x4x4 NeoPixel LED Cube",
    description: "64 WS2812B LEDs controlled by Arduino Uno with modular C++ firmware",
    longDescription:
      "Built a fully functional LED cube featuring 64 individually addressable WS2812B LEDs arranged in a 4x4x4 matrix. The firmware implements a non-blocking state machine using millis(), debounced button inputs, buzzer feedback, serial diagnostics, LDR adaptive brightness control, and multiple animation patterns.",
    technologies: ["Arduino", "C++", "WS2812B", "Electronics", "3D Design"],
    category: "embedded",
    featured: true,
    images: ["/images/projects/led-cube/main.jpg"],
    github: "https://github.com/zaccesss/neopixel-led-cube-project",
    date: "2024",
    highlights: [
      "Non-blocking state machine architecture using millis()",
      "Debounced button inputs with buzzer feedback",
      "LDR adaptive brightness control",
      "Multiple programmable animation patterns",
      "Serial diagnostic interface",
    ],
  },
  {
    id: "astoncv",
    title: "AstonCV – Full-Stack CV Database",
    description: "Full-stack CV database website built from scratch with PHP 8.2, MySQL and custom CSS — no frameworks",
    longDescription:
      "A full-stack CV database website built at Aston University entirely from scratch — no frameworks. Features public browsing, searching and viewing of CVs, user registration, login, CV management and logout. Implements 11 security measures including bcrypt hashing, CSRF protection, PDO prepared statements and brute-force protection. Includes server-side PDF export via mPDF/Composer and a custom domain redirect via Cloudflare. Deployed live on Aston University's internal server.",
    technologies: ["PHP 8.2", "MySQL", "CSS", "Apache", "Composer", "mPDF", "Cloudflare"],
    category: "web",
    featured: true,
    images: ["/images/projects/astoncv/main.jpg"],
    github: "https://github.com/zaccesss/astoncv",
    demo: "https://astoncv.zacess.com",
    date: "2024",
    highlights: [
      "Built from scratch with no frameworks — pure PHP 8.2, MySQL, CSS",
      "11 security measures: bcrypt, CSRF, PDO, brute-force protection",
      "PDF export via mPDF (server-side generation with Composer)",
      "Custom domain via Cloudflare (astoncv.zacess.com)",
      "Deployed live on Aston University internal server",
    ],
  },
  {
    id: "society-manifestos",
    title: "Computing Society Campaign Materials",
    description: "Complete manifesto documents for President and Treasurer positions",
    longDescription:
      "Designed and produced comprehensive campaign manifestos for both President and Treasurer positions of the Computing and Electronics Society, incorporating personal story, technical projects, and leadership background. Created in multiple formats (PDF, Word, HTML) for maximum accessibility.",
    technologies: ["Document Design", "HTML/CSS", "Typography", "Visual Communication"],
    category: "other",
    featured: false,
    images: ["/images/projects/manifesto/president.jpg"],
    date: "2024",
    highlights: [
      "Multi-format deliverables (PDF, Word, HTML)",
      "Accessible design with clear structure",
      "Professional typography and layout",
      "Personal storytelling integrated with technical credentials",
    ],
  },
]
