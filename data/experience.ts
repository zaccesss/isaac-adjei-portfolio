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
}

export const experiences: Experience[] = [
  // PAL Leader - uncomment when role begins in September 2026
  // {
  //   id: "pal-leader",
  //   role: "PAL Leader - Electronics and Programming",
  //   company: "Aston University, Learning Services",
  //   location: "Birmingham, UK",
  //   type: "work" as const,
  //   startDate: "Sep 2026",
  //   endDate: "Present",
  //   description: "Peer-Assisted Learning Leader supporting first-year Electronic Engineering and Computer Science students with programming fundamentals and course content.",
  //   achievements: [
  //     "Facilitate weekly PAL sessions helping students understand core programming concepts in Python",
  //     "Prepare session materials and exercises aligned with the module curriculum",
  //     "Support peer learning in a collaborative, low-pressure environment",
  //     "Develop communication, leadership and mentoring skills through structured sessions",
  //   ],
  // },
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
    technologies: ["Excel", "Data Analysis", "Technical Writing", "EASA/CAA Compliance"],
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
    technologies: ["IoT", "Sensor Networks", "Data Visualisation", "Smart City Systems"],
  },
  {
    id: "ghana-high-commission-consular",
    role: "Consular Intern",
    company: "Ghana High Commission",
    location: "London, UK",
    type: "internship",
    startDate: "Jul 2024",
    endDate: "Aug 2024",
    description:
      "Supported the Consular Department in processing passports, visas and travel documents.",
    achievements: [
      "Supported passport and visa processing workflows, document verification and client enquiries",
      "Maintained accurate digital records and handled sensitive information with professionalism and confidentiality",
      "Developed practical experience in diplomatic services, international relations and cross-border documentation",
      "Enhanced communication, organisation and public-service professionalism",
    ],
  },
  {
    id: "ghana-high-commission-admin",
    role: "Diplomatic Administrative & Estates Intern",
    company: "Ghana High Commission",
    location: "London, UK",
    type: "internship",
    startDate: "Mar 2024",
    endDate: "Mar 2024",
    description:
      "Assisted the Administration Section with estates management activities and general administrative operations.",
    achievements: [
      "Supported the team with document handling, facilities coordination and office logistics",
      "Developed skills in professional communication, record management and organisational efficiency",
      "Gained experience in public sector administration and diplomatic procedures",
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
    technologies: ["HVAC Systems", "Diagnostic Tools", "Electrical Safety", "On-site Maintenance"],
  },
]
