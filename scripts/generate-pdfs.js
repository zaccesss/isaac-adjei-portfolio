#!/usr/bin/env node
// I generate all CVs as PDFs from their HTML sources using headless Chromium via Puppeteer.
// Includes the main Isaac_Adjei_CV.pdf and all 6 role-specific PDFs.
// Run: node scripts/generate-pdfs.js

const puppeteer = require("puppeteer")
const path = require("path")
const fs = require("fs")

const RESUME_DIR = path.join(__dirname, "..", "public", "resume")

const FILES = [
  { html: "cv.html", pdf: "Isaac_Adjei_CV.pdf" },
  ...["software", "embedded", "data", "devops", "quant", "security"].map((r) => ({
    html: `cv-${r}.html`,
    pdf: `cv-${r}.pdf`,
  })),
  // I also generate PDFs for all 7 cover letters so they can be downloaded from /cv.
  ...["software", "embedded", "devops", "data", "quant", "security", "general"].map((r) => ({
    html: `cover-letter-${r}.html`,
    pdf: `cover-letter-${r}.pdf`,
  })),
]

async function generatePdfs() {
  console.log("Launching headless Chromium...")
  // I add --no-sandbox for CI environments (GitHub Actions Ubuntu runner)
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  for (const { html, pdf } of FILES) {
    const htmlFile = path.join(RESUME_DIR, html)
    const pdfFile = path.join(RESUME_DIR, pdf)

    if (!fs.existsSync(htmlFile)) {
      console.warn(`  Skipping ${html}: file not found`)
      continue
    }

    const page = await browser.newPage()
    await page.goto(`file://${htmlFile}`, { waitUntil: "networkidle0" })
    await page.pdf({
      path: pdfFile,
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    })
    await page.close()
    console.log(`  Generated ${pdf}`)
  }

  await browser.close()
  console.log("Done.")
}

generatePdfs().catch((err) => {
  console.error("PDF generation failed:", err)
  process.exit(1)
})
