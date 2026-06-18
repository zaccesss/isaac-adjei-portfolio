import type { BlogPost } from "../index"

const _british_airways_engineering_simulation: BlogPost = {
    slug: "british-airways-engineering-simulation",
    title: "Inside British Airways Engineering: What a Maintenance Simulation Taught Me",
    date: "2025-10-01",
    type: "journal",
    cover_image: "/images/blog/covers/british-airways-engineering-simulation.webp",
    description:
      "Reflections on the British Airways Engineering Virtual Experience on Forage, covering A320 maintenance planning, C-check operations and what aviation engineering looks like from the inside.",
    tags: ["British Airways", "Aviation", "Engineering", "Maintenance", "Career"],
    published: true,
    content: [
      {
        type: "p",
        text: "In October 2025 I completed the [British Airways](https://www.britishairways.com) Engineering Virtual Experience on [Forage](https://www.theforage.com). It was a structured simulation of real maintenance and supply-chain operations, and it gave me a genuinely different perspective on what engineering looks like at scale.",
      },
      {
        type: "h2",
        text: "What the Programme Involved",
      },
      {
        type: "p",
        text: "The simulation was built around Airbus A320 aircraft maintenance. The A320 is one of the most common commercial aircraft in the world and British Airways operates a significant fleet. The programme asked participants to think like an engineering operations planner: analyse maintenance schedules, forecast material requirements and identify risk factors.",
      },
      {
        type: "ul",
        items: [
          "Analysed A320 maintenance schedules and identified components approaching their service limits",
          "Built a Material Forecast and Planning Report covering six A320 aircraft",
          "Diagnosed component faults and produced professional Work Request (WREQ) reports",
          "Proposed risk-mitigation strategies for long-lead parts using data-driven forecasting",
          "Applied EASA and CAA compliance requirements to maintenance planning decisions",
          "Integrated sustainable solutions including recycled components and consolidated logistics",
        ],
      },
      {
        type: "h2",
        text: "What a C-Check Is",
      },
      {
        type: "p",
        text: "Commercial aircraft undergo structured maintenance checks at increasing intervals and depth. A C-check is a heavy maintenance visit, typically occurring every 18 to 24 months depending on the operator's programme. The aircraft is partially disassembled, systems are inspected in detail and many components are replaced on a schedule rather than waiting for failure. The planning for a C-check is complex because many parts have long lead times and a delay in a single component can ground the aircraft beyond its planned return-to-service date.",
      },
      {
        type: "p",
        text: "The WREQ report was the most interesting part for me. A Work Request is the formal document that initiates a maintenance action. It needs to specify the fault, the required corrective action, the parts needed and the technical reference. Writing one properly requires understanding the systems involved and the regulatory framework governing the work.",
      },
      {
        type: "h2",
        text: "Material Forecasting Under Uncertainty",
      },
      {
        type: "p",
        text: "The most technically demanding part of the programme was building the Material Forecast and Planning Report across six A320 aircraft. Each aircraft has a different accumulated flight hours and cycles. Long-lead components like landing gear actuators or engine control units may have lead times of 6 to 18 months. If a component approaches its replacement limit and is not on order in time, the aircraft is grounded.",
      },
      {
        type: "p",
        text: "The exercise required identifying which components across all six aircraft were approaching limits within the C-check window, calculating the probability of a part arriving on time given historical lead times and proposing risk mitigation strategies: buffer stock for critical items, consolidated logistics to reduce costs and sustainable options like certified refurbished components where available.",
      },
      {
        type: "h2",
        text: "What a WREQ Report Actually Contains",
      },
      {
        type: "p",
        text: "A Work Request (WREQ) is the formal document that initiates a maintenance action. It must specify the fault description with reference to the relevant AMM (Aircraft Maintenance Manual) chapter, the required corrective action and the applicable airworthiness directive or service bulletin if relevant, the parts needed by part number and quantity and the skilled labour required including licensing category. Writing one properly requires understanding the systems involved, the regulatory references and the traceability requirements of EASA Part 145 approved maintenance organisations.",
      },
      {
        type: "h2",
        text: "What I Took From It",
      },
      {
        type: "p",
        text: "Aviation engineering is rigorous in a way that most engineering contexts are not. Every decision is documented. Every component has a traceable history. The regulatory framework is non-negotiable. That level of rigour exists because the consequences of getting it wrong are catastrophic. There is no git rollback for a landing gear failure.",
      },
      {
        type: "p",
        text: "As an Electronic Engineering and Computer Science student, this was a useful reminder that the discipline of engineering applies across domains. Careful documentation, systematic fault diagnosis and deep understanding of failure modes are the same skills regardless of whether you are debugging a microcontroller or planning a C-check.",
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "ol-links",
        items: [
          { text: "British Airways - official website", url: "https://www.britishairways.com" },
          { text: "Forage - virtual work experience platform where the BA programme was hosted", url: "https://www.theforage.com" },
          { text: "Wikipedia: Airbus A320 family - background on the aircraft type covered in the programme", url: "https://en.wikipedia.org/wiki/Airbus_A320_family" },
          { text: "Wikipedia: Maintenance, repair and overhaul (MRO) - industry context for aviation maintenance operations", url: "https://en.wikipedia.org/wiki/Maintenance,_repair_and_overhaul" },
        ],
      },
    ],
  }

export default _british_airways_engineering_simulation
