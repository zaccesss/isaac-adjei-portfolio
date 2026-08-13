import type { Project } from "../index"

const _cad_portfolio: Project = {
    id: "cad-portfolio",
    title: "CAD Engineering Design Portfolio",
    description:
      "Three AutoCAD projects covering 2D technical drawing, 3D solid modeling and full product design to BS 8888 standard",
    longDescription:
      "Completed a portfolio of three computer-aided design projects in AutoCAD during 2024-2025, spanning precision component drawing, mechanical assembly design and consumer product design. All drawings comply with BS 8888 (Technical Product Documentation), ISO 128 (General Principles of Representation) and ASME Y14.5 (GD&T), with proper title blocks, revision clouds and layer management throughout.\n\nWorking to these standards for the first time made clear how much information a well-constructed engineering drawing must communicate without ambiguity. Every tolerance zone, every surface finish symbol and every datum reference frame is a specification that a machinist or manufacturer will act on directly. Getting those details right - understanding the difference between bilateral and unilateral tolerances or why a datum reference frame must be chosen based on the functional requirements of the assembly rather than drawing convenience - was the core learning across all three projects.\n\nThe first project produced complete manufacturing documentation for a precision-machined mechanical component: three-view orthographic projections in first-angle projection with full dimensioning, bilateral and unilateral tolerances per ISO 286, geometric tolerancing (flatness, perpendicularity, concentricity) in feature control frames, surface finish symbols with Ra values and a 3D solid model created from base extrude/revolve operations with fillet, chamfer and circular pattern features, rendered with realistic material assignments and three-point lighting.\n\nThe second project covered the complete design cycle for a functional mechanical assembly, from functional and environmental specification through detailed drawings. It includes GD&T datum reference frames, form, orientation and location tolerances, material selection rationale (strength-to-weight, machinability, corrosion resistance), section views, an exploded assembly drawing with balloon callouts and a structured BOM with COTS and custom part identification. The third project was a full consumer product design for a hairdryer, covering injection moulding considerations (draft angles, uniform wall thickness, parting line positioning, snap-fit bosses), internal component layout with vibration isolation and thermal management, IEC 60335 safety compliance, exploded view documentation with hierarchical part numbering and step-by-step assembly instructions.",
    technologies: ["AutoCAD", "CAD", "GD&T", "BS 8888", "3D Modeling", "Technical Drawing"],
    category: "academic",
    featured: true,
    images: [
      "/images/projects/cad-portfolio/main.webp",
      "/images/projects/cad-portfolio/3d-model.webp",
      "/images/projects/cad-portfolio/assembly.webp",
    ],
    date: "2025",
    highlights: [
      "Three projects: precision component, mechanical assembly design cycle and hairdryer product design",
      "Full GD&T: datum reference frames, form, orientation and location tolerances, feature control frames",
      "Tolerancing per ISO 286 with surface finish symbols (Ra values) and machining callouts",
      "Assembly drawings with exploded views, balloon callouts, section views and structured BOM",
      "Consumer product design: injection molding DFM, IEC 60335 compliance, assembly sequence",
      "All drawings comply with BS 8888, ISO 128 and ASME Y14.5 with proper title blocks and revision control",
    ],
  }

export default _cad_portfolio
