// University society memberships shown on the About page.

export interface Society {
  name: string
  role: string
  period: string
  description: string
}

export const societies: Society[] = [
  {
    name: "Institution of Engineering and Technology (IET)",
    role: "Student Member",
    period: "2024 - Present",
    description:
      "Professional engineering institution membership focused on advancing engineering knowledge and skills.",
  },
  {
    name: "Aston Computing and Electronics Society (ESOC)",
    role: "Member & Student Representative",
    period: "2024 - Present",
    description:
      "Active member and course representative.",
  },
  {
    name: "Aston African-Caribbean Society (ACS)",
    role: "Member",
    period: "2024 - Present",
    description: "Active participation in cultural and community events.",
  },
  {
    name: "Aston Ghana Society (AGS)",
    role: "Member",
    period: "2024 - Present",
    description: "Connecting with Ghanaian students and promoting cultural heritage.",
  },
  {
    name: "Aston Gaming Society",
    role: "Member",
    period: "2024 - Present",
    description: "Participating in gaming events, tournaments and community activities.",
  },
]
