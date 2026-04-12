export interface Education {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string | "Present"
  description?: string
  grade?: string
  modules?: string[]
}

export const education: Education[] = [
  {
    id: "aston",
    institution: "Aston University",
    degree: "BEng (Hons)",
    field: "Electronic Engineering and Computer Science",
    startDate: "2024",
    endDate: "2027",
    description:
      "Studying embedded systems, digital electronics, software engineering, and computer architecture.",
    modules: [
      "Digital Electronics",
      "Microprocessors & Embedded Systems",
      "Computer Architecture",
      "Software Engineering",
      "Mathematics for Engineers",
      "Circuit Theory",
      "Signals & Systems",
    ],
  },
]
