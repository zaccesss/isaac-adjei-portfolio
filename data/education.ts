// I list my education history shown on the About page - modules is optional per entry.

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
      "Working towards a First Class with a strong focus on software engineering, electronics, AI and applied computing.",
    modules: [
      "Internet Applications and Databases",
      "Foundations of AI and Data Science",
      "Introductory Programming for Digital Science (Python)",
      "Electronics 1",
      "Electronics 2",
      "Introductory Mathematics for Engineering",
      "Power Skills (Professional Skills)",
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
      "Completed BTEC Engineering with strong practical training across design, microcontrollers, electronics and engineering maths.",
    modules: [
      "Engineering Product Design and Manufacture",
      "Microcontroller Systems for Engineers",
      "Engineering Principles",
      "Specialist Engineering Project",
      "Computer Aided Design in Engineering",
      "Electronic Devices and Circuits",
      "Calculus to Solve Engineering Problems",
      "Electronic Measurement and Testing of Circuits",
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
      "Core subjects: English Language, Mathematics, Social Studies and Integrated Science. Active in Robotics Club, APOSA (Secretary), Scripture Union and Debate Society.",
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
