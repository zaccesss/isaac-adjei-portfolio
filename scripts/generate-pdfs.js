#!/usr/bin/env node
// I generate role-specific PDFs from the HTML CVs using headless Chromium via Puppeteer.
// I do NOT regenerate Isaac_Adjei_CV.pdf - that is the main CV and is managed separately.
// Run: node scripts/generate-pdfs.js

const puppeteer = require("puppeteer")
const path = require("path")
const fs = require("fs")

const RESUME_DIR = path.join(__dirname, "..", "public", "resume")

const ROLES = ["software", "embedded", "data", "devops", "quant", "security"]

async function generatePdfs() {
  console.log("Launching headless Chromium...")
  // I add --no-sandbox for CI environments (GitHub Actions Ubuntu runner)
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  for (const role of ROLES) {
    const htmlFile = path.join(RESUME_DIR, `cv-${role}.html`)
    const pdfFile = path.join(RESUME_DIR, `cv-${role}.pdf`)

    if (!fs.existsSync(htmlFile)) {
      console.warn(`  Skipping ${role}: ${htmlFile} not found`)
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
    console.log(`  Generated cv-${role}.pdf`)
  }

  await browser.close()
  console.log("Done.")
}

generatePdfs().catch((err) => {
  console.error("PDF generation failed:", err)
  process.exit(1)
})
