"use client"

type CVViewerProps = {
  cvHtml: string
}

export default function CVViewer({ cvHtml }: CVViewerProps) {
  const handlePrint = () => {
    const printWindow = window.open("/resume/cv.html?print=1", "_blank")
    if (!printWindow) {
      window.location.href = "/resume/cv.html?print=1"
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 md:px-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-2xl font-semibold tracking-tight">CV</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          View the live CV. Use the direct PDF download for the most reliable clickable links.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href="/api/cv-pdf"
            download="Isaac_Adjei_CV.pdf"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Download PDF (Recommended)
          </a>
          <button
            type="button"
            onClick={handlePrint}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Print / Save PDF
          </button>
          <a
            href="/resume/cv.html"
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Open Printable CV
          </a>
          <a
            href="/resume/cv.html"
            download="Isaac_Adjei_CV.html"
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Download HTML
          </a>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <iframe srcDoc={cvHtml} title="Isaac Adjei CV" className="h-[80vh] w-full bg-white" />
      </div>
    </div>
  )
}
