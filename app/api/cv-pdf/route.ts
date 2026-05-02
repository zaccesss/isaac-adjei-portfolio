// API route that generates a PDF of my CV on the fly using Puppeteer.
// In production (Vercel), @sparticuz/chromium provides a compatible headless browser.
// Locally, it falls back to the standard puppeteer executable.
// If PDF generation fails entirely, the route serves the static Isaac_Adjei_CV.pdf
// from the public folder as a fallback so downloads never break.

import { readFileSync } from "fs"
import { join } from "path"
import chromium from "@sparticuz/chromium"
import puppeteer from "puppeteer-core"
import localPuppeteer from "puppeteer"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  let browser: Awaited<ReturnType<typeof localPuppeteer.launch>> | null = null

  try {
    const filePath = join(process.cwd(), "public", "resume", "cv.html")
    const rawHtml = readFileSync(filePath, "utf-8")
    const html = rawHtml.replace(/<script[\s\S]*?<\/script>/gi, "")

    try {
      browser = await localPuppeteer.launch({
        headless: true,
        executablePath: localPuppeteer.executablePath(),
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      })
    } catch {
      const executablePath = await chromium.executablePath()
      browser = await puppeteer.launch({
        args: chromium.args,
        executablePath,
        headless: true,
      })
    }

    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: "networkidle0" })

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "11mm",
        right: "14mm",
        bottom: "11mm",
        left: "14mm",
      },
    })

    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="Isaac_Adjei_CV.pdf"',
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("CV PDF generation failed, serving static fallback:", error)
    try {
      const fallbackPath = join(process.cwd(), "public", "resume", "Isaac_Adjei_CV.pdf")
      const fallbackPdf = readFileSync(fallbackPath)

      return new Response(fallbackPdf, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="Isaac_Adjei_CV.pdf"',
          "Cache-Control": "no-store",
        },
      })
    } catch (fallbackError) {
      console.error("CV PDF fallback failed:", fallbackError)
      return Response.json({ error: "Failed to generate CV PDF." }, { status: 500 })
    }
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}
