// I list my university society memberships shown on the About page.

export interface SocietyRole {
  role: string
  period: string
  /** ISO date (YYYY-MM-DD). Role is filtered out until this date, so a future role (e.g. an
   * elected position starting next academic year) can be written now - see isSocietyRoleVisible.
   * Same pattern as data/experience.ts's visibleFrom. */
  visibleFrom?: string
}

export interface Society {
  name: string
  roles: SocietyRole[]
  description: string
}

// Real clock, read at call time (not module load), so a long-lived server process never freezes
// the answer at boot - same reasoning as isExperienceVisible in data/experience.ts.
export function isSocietyRoleVisible(role: SocietyRole): boolean {
  return !role.visibleFrom || new Date() >= new Date(role.visibleFrom)
}

export const societies: Society[] = [
  {
    name: "Institution of Engineering and Technology (IET)",
    roles: [{ role: "Student Member", period: "September 2024 - Present" }],
    description:
      "Professional engineering institution membership, advancing engineering knowledge and skills.",
  },
  {
    name: "Aston Computing and Electronics Society (ESOC)",
    roles: [
      { role: "Member & Student Representative", period: "September 2024 - Present" },
      { role: "Treasurer", period: "September 2026 - Present", visibleFrom: "2026-09-01" },
    ],
    description:
      "Active member and course representative for the EECS programme at Aston, elected Treasurer for the 2026/27 academic year.",
  },
  {
    name: "Aston Computer Science Society (ACSS)",
    roles: [{ role: "Member", period: "September 2025 - Present" }],
    description: "Active member, engaging with computer science community events and talks.",
  },
  {
    name: "Aston Gaming Society (GS)",
    roles: [{ role: "Member", period: "September 2024 - Present" }],
    description: "Participating in gaming events, tournaments and community activities.",
  },
  {
    name: "Aston African-Caribbean Society (ACS)",
    roles: [{ role: "Member", period: "September 2024 - Present" }],
    description: "Active participation in cultural, social and community events.",
  },
  {
    name: "Aston Ghana Society (AGS)",
    roles: [{ role: "Member", period: "September 2024 - Present" }],
    description: "Connecting with Ghanaian students and celebrating cultural heritage.",
  },
]
