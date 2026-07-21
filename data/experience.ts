// I list all work experience, internships and programmes shown on the About timeline.

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
  /** ISO date (YYYY-MM-DD). Entry is filtered out of the rendered timeline until this date, so it
   * can be written now and simply appear on its own - see isExperienceVisible below. */
  visibleFrom?: string
}

// Real clock, not a Month-style hardcoded year, since a role can begin any year. Read at call time
// (not module load) so a long-lived server process never freezes the answer at boot.
export function isExperienceVisible(exp: Experience): boolean {
  return !exp.visibleFrom || new Date() >= new Date(exp.visibleFrom)
}

export const experiences: Experience[] = [
  {
    id: "pal-leader",
    role: "Peer Assisted Learning (PAL) Leader - Electronics and Programming",
    company: "Aston University, Learning Services",
    location: "Birmingham, UK",
    type: "work",
    startDate: "Sep 2026",
    endDate: "Present",
    visibleFrom: "2026-09-01",
    description: "Peer Assisted Learning (PAL) Leader at Aston University Learning Services, facilitating structured sessions to help undergraduate students across multiple cohorts build confidence in programming and electronics.",
    achievements: [
      "Facilitate weekly PAL sessions covering Python programming and electronics for multiple student cohorts, adapting session content to different backgrounds and learning needs",
      "Design and prepare structured session materials and targeted exercises aligned with module curricula, ensuring sessions complement rather than duplicate taught content",
      "Develop communication, mentoring and leadership skills by fostering a low-pressure collaborative environment where students feel comfortable asking questions and working through problems together",
    ],
  },
  {
    id: "ces-treasurer",
    role: "Treasurer",
    company: "Computing & Electronics Society, Aston Students' Union",
    location: "Birmingham, UK",
    type: "work",
    startDate: "Sep 2026",
    endDate: "Present",
    visibleFrom: "2026-09-01",
    description: "Elected Treasurer of the Computing & Electronics Society at Aston University, managing the society's budget and financial records for the academic year.",
    achievements: [
      "Manage the society's budget and financial records, reporting to the committee and the Students' Union",
      "Elected onto the committee for the Computing & Electronics Society, working alongside the President to run society operations",
      "Completed the required committee leader training through Aston Students' Union",
    ],
  },
  {
    id: "aston-student-rep",
    role: "Student Representative",
    company: "Aston Students' Union",
    location: "Birmingham, UK",
    type: "work",
    startDate: "Sep 2025",
    endDate: "Present",
    description:
      "Elected course representative for Electronic Engineering and Computer Science at Aston University.",
    achievements: [
      "Represent student voice by gathering and communicating feedback to academic staff",
      "Attend Staff-Student Liaison Committee (SSLC), Senate and Council meetings",
      "Present student feedback and contribute to discussions on course improvements",
      "Collaborate with staff to agree and implement actions based on feedback",
      "Completed official Student Representative training at Aston Students' Union",
    ],
  },
  {
    id: "targetjobs-judge",
    role: "Student Judge",
    company: "targetjobs UK",
    location: "Remote",
    type: "virtual",
    startDate: "Feb 2026",
    endDate: "Feb 2026",
    description:
      "Selected as a Student Judge for the National Emerging Talent Awards 2026, evaluating employer submissions for Best Placement or Internship Programme.",
    achievements: [
      "Assessed national employer entries on programme design, recruitment strategy, inclusivity and student experience",
      "Provided detailed qualitative feedback and numerical scoring to support award decisions",
      "Recognised for timely, high-quality and thorough approach by targetjobs staff",
    ],
  },
  {
    id: "cancer-research-volunteer",
    role: "Fundraising Volunteer",
    company: "Cancer Research UK",
    location: "United Kingdom",
    type: "work",
    startDate: "Feb 2026",
    endDate: "Mar 2026",
    description:
      "Participated in the Cancer Research UK 10 Days of 5K Challenge to support life-saving cancer research.",
    achievements: [
      "Completed 10 x 5 km runs (more than 50 km total) across March, demonstrating consistency and discipline",
      "Set up and managed an online fundraising page, contributing to a wider campaign that raised over £797,424.64, with an additional £159,224.14 through Gift Aid",
      "Raised funds through outreach and personal network engagement",
      "Promoted awareness of cancer research initiatives",
    ],
  },
  {
    id: "british-airways-virtual",
    role: "Engineering Operations & Maintenance Planning (Virtual Experience)",
    company: "British Airways via Forage",
    location: "Remote",
    type: "virtual",
    startDate: "Oct 2025",
    endDate: "Oct 2025",
    description:
      "Completed a virtual engineering operations simulation focused on real-world aircraft maintenance and supply-chain planning.",
    achievements: [
      "Analysed A320 maintenance schedules, forecasted material requirements and identified risk factors during C-checks",
      "Diagnosed component faults and produced professional Work Request (WREQ) reports",
      "Built a Material Forecast & Planning Report covering six A320 aircraft",
      "Proposed risk-mitigation strategies for long-lead parts using data-driven forecasting",
      "Developed actionable planning reports aligned with EASA/CAA compliance and sustainability standards",
    ],
  },
  {
    id: "yunex-traffic-virtual",
    role: "Smart Mobility & Digital Tech (Virtual Work Experience)",
    company: "Yunex Traffic via Springpod",
    location: "Remote",
    type: "virtual",
    startDate: "Aug 2025",
    endDate: "Aug 2025",
    description:
      "Explored intelligent transport systems, IoT sensor networks and real-time air quality monitoring in smart city environments.",
    achievements: [
      "Explored how intelligent transport systems and digital technology improve air quality and urban efficiency",
      "Studied traffic lights design, sensor integration and data-driven transport management in smart cities",
      "Created an infographic demonstrating Zephyr® air quality sensors monitoring NO₂, O₃ and PM₁₀ pollution in real time",
      "Gained professional insight into engineering, software and project management roles within Yunex Traffic",
    ],
  },
  {
    id: "ghana-high-commission",
    role: "Diplomatic, Consular and Estates Intern",
    company: "Ghana High Commission",
    location: "London, UK",
    type: "internship",
    startDate: "Mar 2024",
    endDate: "Aug 2024",
    description:
      "Internship spanning consular operations and diplomatic estates management at the Ghana High Commission in London.",
    achievements: [
      "Operated end-to-end consular processing workflows using official diplomatic management systems, handling application intake, biometric data capture, document authentication and physical visa and passport production, supporting 100+ daily client interactions",
      "Coordinated diplomatic property operations by accompanying officers on site inspections and facility surveys, managing estates documentation, maintenance schedules and office workflows",
    ],
  },
  {
    id: "casa-do-frango",
    role: "Waiter / Food Runner / Bar Back",
    company: "Casa do Frango",
    location: "Piccadilly, London, UK",
    type: "work",
    startDate: "Sep 2022",
    endDate: "Jan 2025",
    description:
      "Delivered high-quality front-of-house service in a busy, high-volume restaurant in central London.",
    achievements: [
      "Delivered high-quality service in a fast-paced, high-volume restaurant environment",
      "Worked closely with kitchen and bar teams to ensure smooth service flow and exceptional customer experiences",
      "Trained new starters on menu knowledge, table service systems and operational workflows",
      "Strengthened multitasking, communication and time management skills under pressure",
    ],
  },
  {
    id: "search-hub",
    role: "Hospitality Associate (Agency)",
    company: "Search Hub Consultancy",
    location: "London, UK",
    type: "work",
    startDate: "Jul 2022",
    endDate: "Sep 2022",
    description:
      "Provided hospitality support across various venues in London through flexible agency shifts.",
    achievements: [
      "Supported multiple venues across London through flexible agency shifts",
      "Assisted with bar preparation, table running and guest assistance in varied settings",
      "Adapted quickly to new environments, teams and service standards",
    ],
  },
  {
    id: "total-facilities",
    role: "Hospitality Associate (Agency)",
    company: "Total Facilities Recruitment Ltd",
    location: "London, UK",
    type: "work",
    startDate: "Jul 2022",
    endDate: "Aug 2022",
    description: "Worked across multiple restaurants and event venues through agency assignments.",
    achievements: [
      "Worked across multiple restaurants and event venues supporting food and bar service",
      "Ensured service duties were completed efficiently and to a high standard",
      "Strengthened teamwork and communication skills in varied hospitality settings",
    ],
  },
  {
    id: "massive-refrigeration",
    role: "Junior Apprentice HVAC Technician",
    company: "Massive Refrigeration Services",
    location: "Accra, Ghana",
    type: "work",
    startDate: "Jul 2019",
    endDate: "Jul 2021",
    description:
      "Part-time on-site apprenticeship assisting with air conditioning servicing, installation and maintenance.",
    achievements: [
      "Assisted in air conditioner servicing, installations and maintenance for over 50 units",
      "Used hand tools, drills and diagnostic meters under supervision",
      "Applied safety procedures and client etiquette during on-site technical visits",
      "Gained early hands-on technical experience and professional work ethic",
    ],
  },
]
