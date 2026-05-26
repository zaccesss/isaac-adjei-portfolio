#!/usr/bin/env node
// I generate role-specific Word documents from cv.yml using the docx package.
// Each role gets its own .docx with only the relevant skills, projects and section order.
// Run: node scripts/generate-docx.js

const fs = require("fs")
const path = require("path")
const yaml = require("js-yaml")
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  UnderlineType,
  ExternalHyperlink,
  Header,
  Footer,
} = require("docx")

const DATA_DIR = path.join(__dirname, "..", "data")
const OUTPUT_DIR = path.join(__dirname, "..", "public", "resume")

const cv = yaml.load(fs.readFileSync(path.join(DATA_DIR, "cv.yml"), "utf8"))

// I map role tags to the skill keys in cv.yml
const ROLE_SKILL_KEYS = {
  software: ["languages", "frontend", "backend", "cloud_devops", "tools"],
  embedded: ["languages", "microcontrollers", "protocols", "hardware", "sensors"],
  data: ["languages", "ml_frameworks", "data_tools", "databases", "visualisation", "cloud"],
  devops: ["languages", "containers", "cloud", "iac", "cicd", "monitoring"],
  quant: ["languages", "math", "tools", "performance", "finance"],
  security: ["languages", "appsec", "crypto", "network", "tools", "compliance"],
}

// I map role tags to the nested skill object in cv.yml
const ROLE_SKILL_SECTION = {
  software: cv.skills.software,
  embedded: cv.skills.embedded,
  data: cv.skills.data_ai,
  devops: cv.skills.devops,
  quant: cv.skills.quant,
  security: cv.skills.security,
}

// I use these colours to keep the document clean and professional
const COLOURS = {
  dark: "0F172A",
  accent: "3B82F6",
  muted: "6B7280",
  rule: "E5E7EB",
  white: "FFFFFF",
}

const FONT = "Calibri"
const FONT_MONO = "Courier New"

function hRule() {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOURS.rule } },
    spacing: { after: 0 },
  })
}

function sectionHeading(text) {
  return new Paragraph({
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: 22,
        color: COLOURS.dark,
        font: FONT,
      }),
    ],
    spacing: { before: 240, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOURS.accent } },
  })
}

function bullet(text, indent = 360) {
  return new Paragraph({
    children: [new TextRun({ text, size: 20, font: FONT, color: COLOURS.dark })],
    bullet: { level: 0 },
    indent: { left: indent },
    spacing: { after: 40 },
  })
}

function buildHeader(personal) {
  return [
    new Paragraph({
      children: [
        new TextRun({
          text: personal.name,
          bold: true,
          size: 48,
          color: COLOURS.dark,
          font: FONT,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: personal.title, size: 22, color: COLOURS.muted, font: FONT }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `${personal.email}  |  `, size: 18, color: COLOURS.muted, font: FONT }),
        new TextRun({ text: `${personal.phone}  |  `, size: 18, color: COLOURS.muted, font: FONT }),
        new TextRun({ text: personal.location, size: 18, color: COLOURS.muted, font: FONT }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `${personal.website}  |  `, size: 18, color: COLOURS.accent, font: FONT }),
        new TextRun({ text: personal.linkedin, size: 18, color: COLOURS.accent, font: FONT }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
    }),
  ]
}

function buildProfile(role) {
  const profileText = cv.role_profiles[role]
  return [
    sectionHeading("Profile"),
    new Paragraph({
      children: [new TextRun({ text: profileText, size: 20, font: FONT, color: COLOURS.dark })],
      spacing: { after: 120 },
    }),
  ]
}

function buildSkills(role) {
  const skillSection = ROLE_SKILL_SECTION[role]
  const skillKeys = ROLE_SKILL_KEYS[role]
  if (!skillSection) return []

  const rows = []
  for (const key of skillKeys) {
    const values = skillSection[key]
    if (!values || values.length === 0) continue
    const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    rows.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${label}: `, bold: true, size: 20, font: FONT, color: COLOURS.dark }),
          new TextRun({ text: values.join(", "), size: 20, font: FONT, color: COLOURS.dark }),
        ],
        spacing: { after: 60 },
      })
    )
  }

  return [sectionHeading("Skills"), ...rows]
}

function buildProjects(role) {
  const relevant = cv.projects.filter((p) => p.role_tags.includes(role))
  if (relevant.length === 0) return []

  const items = []
  for (const project of relevant) {
    items.push(
      new Paragraph({
        children: [
          new TextRun({ text: project.name, bold: true, size: 22, font: FONT, color: COLOURS.dark }),
          new TextRun({ text: `  |  ${project.date}`, size: 18, font: FONT, color: COLOURS.muted }),
        ],
        spacing: { before: 120, after: 40 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `Tech: ${project.tech}`, size: 18, font: FONT, color: COLOURS.muted, italics: true }),
        ],
        spacing: { after: 60 },
      }),
      ...project.bullets.map((b) => bullet(b))
    )
  }

  return [sectionHeading("Projects"), ...items]
}

function buildEducation() {
  const items = []
  for (const edu of cv.education) {
    items.push(
      new Paragraph({
        children: [
          new TextRun({ text: edu.institution, bold: true, size: 22, font: FONT, color: COLOURS.dark }),
        ],
        spacing: { before: 120, after: 40 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `${edu.degree}  |  ${edu.duration}`, size: 20, font: FONT, color: COLOURS.dark }),
        ],
        spacing: { after: 40 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `Predicted: ${edu.predicted}`, size: 18, font: FONT, color: COLOURS.muted }),
        ],
        spacing: { after: 40 },
      })
    )
    if (edu.award) {
      items.push(
        new Paragraph({
          children: [new TextRun({ text: edu.award, size: 18, font: FONT, color: COLOURS.accent })],
          spacing: { after: 60 },
        })
      )
    }
    if (edu.modules && edu.modules.length > 0) {
      items.push(
        new Paragraph({
          children: [new TextRun({ text: "Relevant Modules:", bold: true, size: 18, font: FONT, color: COLOURS.dark })],
          spacing: { after: 40 },
        }),
        ...edu.modules.map((m) => bullet(m, 180))
      )
    }
  }
  return [sectionHeading("Education"), ...items]
}

function buildExperience(role) {
  const relevant = cv.experience.filter((e) => e.tags.includes(role))
  if (relevant.length === 0) return []

  const items = []
  for (const exp of relevant) {
    items.push(
      new Paragraph({
        children: [
          new TextRun({ text: exp.company, bold: true, size: 22, font: FONT, color: COLOURS.dark }),
          new TextRun({ text: `  |  ${exp.date}`, size: 18, font: FONT, color: COLOURS.muted }),
        ],
        spacing: { before: 120, after: 40 },
      }),
      new Paragraph({
        children: [new TextRun({ text: exp.role, size: 20, font: FONT, color: COLOURS.dark, italics: true })],
        spacing: { after: 60 },
      }),
      ...exp.bullets.map((b) => bullet(b))
    )
  }

  return [sectionHeading("Experience"), ...items]
}

function buildSections(role) {
  const order = cv.role_section_order[role]
  const sectionMap = {
    profile: () => buildProfile(role),
    skills: () => buildSkills(role),
    projects: () => buildProjects(role),
    education: buildEducation,
    experience: () => buildExperience(role),
  }

  const content = []
  for (const section of order) {
    if (sectionMap[section]) {
      content.push(...sectionMap[section]())
    }
  }
  return content
}

async function generateDocx() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  const roles = Object.keys(cv.role_profiles)
  for (const role of roles) {
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: { top: 720, right: 720, bottom: 720, left: 720 },
            },
          },
          children: [...buildHeader(cv.personal), ...buildSections(role)],
        },
      ],
    })

    const buffer = await Packer.toBuffer(doc)
    const outPath = path.join(OUTPUT_DIR, `cv-${role}.docx`)
    fs.writeFileSync(outPath, buffer)
    console.log(`  Generated cv-${role}.docx`)
  }

  console.log("Done.")
}

generateDocx().catch((err) => {
  console.error("DOCX generation failed:", err)
  process.exit(1)
})
