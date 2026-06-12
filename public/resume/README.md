# public/resume/

CV and cover letter files. The master source is `cv.html`. All other CV files are auto-generated — do not edit them by hand.

## How CVs are generated

1. `scripts/generate-role-cvs.js` reads `cv.html` and assembles six role-specific HTML files (`cv-software.html`, `cv-embedded.html`, etc.), injecting role-specific experience ordering and cover letters.
2. `scripts/generate-pdfs.js` uses Puppeteer to render each HTML file to PDF.
3. `scripts/generate-docx.js` uses `html-to-docx` to convert each HTML file to DOCX.

The `cv-pdf.yml` GitHub Actions workflow runs steps 1–3 automatically whenever `cv.html` is pushed to main, then opens an auto-merge PR with the updated artefacts.

## To regenerate locally

```bash
node scripts/generate-role-cvs.js
npm run generate-pdfs
npm run generate-docx
```

## Files

| File | Auto-generated | Description |
| --- | --- | --- |
| `cv.html` | No | Master CV source — edit this to change content |
| `cv-software.html` | Yes | Software engineering role CV |
| `cv-embedded.html` | Yes | Embedded systems role CV |
| `cv-devops.html` | Yes | DevOps / infrastructure role CV |
| `cv-data.html` | Yes | Data engineering / ML role CV |
| `cv-quant.html` | Yes | Quantitative / finance role CV |
| `cv-security.html` | Yes | Security engineering role CV |
| `cover-letter-*.html` | No | Role-specific cover letters — edit directly |
| `Isaac_Adjei_CV.pdf` | Yes | Main CV PDF (used by the `/cv` download button) |
| `Isaac_Adjei_CV.docx` | Yes | Main CV DOCX |
| `cv-*.pdf` | Yes | Role-specific CV PDFs |
| `cv-*.docx` | Yes | Role-specific CV DOCX files |
