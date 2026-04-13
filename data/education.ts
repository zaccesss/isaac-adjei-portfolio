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
    institution: "Aston University, Birmingham, United Kingdom",
    degree: "BEng (Hons)",
    field: "Electronic Engineering and Computer Science",
    startDate: "Oct 2024",
    endDate: "Jul 2028",
    grade: "Predicted: First Class",
    description:
      "Working towards a First Class with a strong focus on embedded systems, digital electronics, software development and applied computing.",
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
  {
    id: "stanmore",
    institution: "Stanmore College, London, United Kingdom",
    degree: "Pearson BTEC Level 3 National Extended Diploma in Engineering",
    field: "",
    startDate: "Sep 2022",
    endDate: "Jul 2024",
    grade: "D*DD (Distinction*, Distinction, Distinction)",
    description:
      "Studied Electrical Principles, Engineering Product Design, Microcontroller Systems and Specialist Engineering Projects. Developed practical skills in circuit design, Arduino programming, systems automation and technical CAD drawing.",
    modules: [
      "Electrical Principles",
      "Engineering Product Design",
      "Microcontroller Systems",
      "Specialist Engineering Projects",
    ],
  },
  {
    id: "adisadel",
    institution: "Adisadel College, Cape Coast, Ghana",
    degree: "West African Senior School Certificate (WASSCE)",
    field: "General Arts",
    startDate: "Sep 2019",
    endDate: "Mar 2022",
    description:
      "Studied General Arts with electives in Economics, Government, Christian Religious Studies and Geography. Active in Robotics Club, APOSA (Secretary), Scripture Union, Debate Society and Athletics.",
    modules: [
      "Economics",
      "Government",
      "Christian Religious Studies",
      "Geography",
      "Mathematics",
      "English",
      "Integrated Science",
      "ICT",
    ],
  },
]
