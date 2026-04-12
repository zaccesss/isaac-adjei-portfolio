export interface Experience {
  id: string
  role: string
  company: string
  location: string
  type: "work" | "internship" | "virtual"
  startDate: string
  endDate: string | "Present"
  description: string
  achievements: string[]
  technologies?: string[]
}

export const experiences: Experience[] = [
  {
    id: "mcdonalds",
    role: "Crew Member",
    company: "McDonald's",
    location: "Birmingham, UK",
    type: "work",
    startDate: "2024",
    endDate: "Present",
    description: "Part-time role providing customer service and operational support",
    achievements: [
      "Developed strong teamwork and time management skills",
      "Maintained high service standards in a fast-paced environment",
    ],
  },
  {
    id: "ghana-high-commission-consular",
    role: "Intern (Consular)",
    company: "Ghana High Commission",
    location: "London, UK",
    type: "internship",
    startDate: "2023",
    endDate: "2023",
    description: "Consular department internship handling administrative duties",
    achievements: [
      "Assisted with consular documentation and client services",
      "Gained insight into diplomatic operations and protocols",
    ],
  },
  {
    id: "ghana-high-commission-admin",
    role: "Intern (Administrative/Estates)",
    company: "Ghana High Commission",
    location: "London, UK",
    type: "internship",
    startDate: "2023",
    endDate: "2023",
    description: "Administrative and estates management support",
    achievements: [
      "Supported facilities management and administrative operations",
      "Developed organisational and project coordination skills",
    ],
  },
  {
    id: "british-airways-virtual",
    role: "Virtual Experience Programme",
    company: "British Airways (via Forage)",
    location: "Remote",
    type: "virtual",
    startDate: "2024",
    endDate: "2024",
    description: "Engineering Operations virtual experience programme",
    achievements: [
      "Completed simulations in aircraft maintenance and operations",
      "Gained understanding of aviation engineering principles",
    ],
  },
]
