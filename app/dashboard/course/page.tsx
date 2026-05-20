import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"

export const metadata = { robots: "noindex, nofollow" }

const stage1 = [
  { code: "EI1EL1", title: "Electronics 1", credits: 15, condonable: "N" },
  { code: "EI1IME", title: "Introductory Mathematics for Engineering", credits: 15, condonable: "Y" },
  { code: "DG1IPE", title: "Introductory Programming for Engineering", credits: 15, condonable: "N" },
  { code: "EP1IDP", title: "Interdisciplinary Design Project", credits: 15, condonable: "N" },
  { code: "DG1AID", title: "Foundations of AI and Data Science", credits: 15, condonable: "Y" },
  { code: "EI1EL2", title: "Electronics 2", credits: 15, condonable: "Y(C)", note: "Co-req: EI1EL1" },
  { code: "DG1IAD", title: "Internet Applications and Databases", credits: 15, condonable: "Y" },
  { code: "EP1POS", title: "Power Skills", credits: 15, condonable: "N" },
]

const stage2 = [
  { code: "EI2APE", title: "Analogue and Power Electronics", credits: 15, condonable: "Y" },
  { code: "EI2ROC", title: "Robot Control", credits: 15, condonable: "Y", note: "Co-req: EI2ESC" },
  { code: "DG2OOP", title: "Data Structures, Algorithms and OOP", credits: 15, condonable: "Y", note: "Pre-req: DG1IPE" },
  { code: "EI2ETP", title: "Electronic Engineering Team Project", credits: 15, condonable: "N" },
  { code: "EI2COS", title: "Communications Systems Ethics, EDI and Sustainability", credits: 15, condonable: "N" },
  { code: "EI2ESC", title: "Embedded Systems and C", credits: 15, condonable: "N" },
  { code: "EI2DID", title: "Digital Design", credits: 15, condonable: "N" },
  { code: "DG2IAI", title: "Introduction to AI and Robotics", credits: 15, condonable: "Y" },
]

const stageF_core = [
  { code: "EI3IOT", title: "Internet of Things", credits: 15, condonable: "Y" },
  { code: "EI3DSD", title: "Digital Systems Design", credits: 15, condonable: "Y", note: "Pre-req: EI2DID" },
  { code: "EI3PEP", title: "Professional Engineering Practice", credits: 15, condonable: "N" },
  { code: "EI3EFP", title: "Final Year Project", credits: 45, condonable: "N" },
]

const stageF_sectionA = [
  { code: "EI3DSP", title: "Digital Signal Processing", credits: 15 },
  { code: "DG3ARN", title: "Autonomous Robotics and Navigation", credits: 15, note: "Pre-req: EI2ROC" },
  { code: "DG3CAN", title: "Computer Animation", credits: 15 },
  { code: "DG3SFT", title: "Software Testing", credits: 15 },
]

const stageF_sectionB = [
  { code: "EI3DSH", title: "Digital Systems Hardware", credits: 15, note: "Pre-req: EI2DID" },
  { code: "DG3ARS", title: "Adaptive and Intelligent Robotic Systems", credits: 15 },
  { code: "DG3DAM", title: "Data Mining", credits: 15 },
  { code: "DG3CCD", title: "Cloud Computing and DevOps", credits: 15 },
  { code: "DG3GAD", title: "Game Development", credits: 15 },
]

function ModuleTable({ modules }: { modules: { code: string; title: string; credits: number; condonable?: string; note?: string }[] }) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30 text-xs text-muted-foreground">
            <th className="text-left py-2 px-3 font-normal">Code</th>
            <th className="text-left py-2 px-3 font-normal">Module</th>
            <th className="text-right py-2 px-3 font-normal">Credits</th>
            <th className="text-right py-2 px-3 font-normal">Condonable</th>
          </tr>
        </thead>
        <tbody>
          {modules.map((m) => (
            <tr key={m.code} className="border-b border-border/40 last:border-0">
              <td className="py-2.5 px-3 font-mono text-xs text-muted-foreground">{m.code}</td>
              <td className="py-2.5 px-3">
                <div>{m.title}</div>
                {m.note && <div className="text-xs text-muted-foreground">{m.note}</div>}
              </td>
              <td className="py-2.5 px-3 text-right">{m.credits}</td>
              <td className="py-2.5 px-3 text-right">
                {"condonable" in m ? (
                  <Badge className={`text-xs px-1.5 py-0 ${(m as { condonable?: string }).condonable?.startsWith("Y") ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-muted text-muted-foreground"}`}>
                    {(m as { condonable?: string }).condonable ?? "-"}
                  </Badge>
                ) : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function CoursePage() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold">Course</h1>
          <p className="text-sm text-muted-foreground mt-1">BEng Electronic Engineering and Computer Science - Aston University</p>
        </div>
        <a
          href="/eecs-programme-spec.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ExternalLink className="h-4 w-4" />
          Programme spec PDF
        </a>
      </div>

      {/* Course info */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "Programme", value: "BEng (Hons)" },
          { label: "Duration", value: "3 years (+ optional placement)" },
          { label: "Total credits", value: "360" },
          { label: "Start", value: "Sept 2024" },
          { label: "Expected end", value: "June 2028" },
          { label: "Accreditation", value: "IET" },
        ].map(({ label, value }) => (
          <div key={label} className="border border-border rounded-lg p-3 bg-card">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-medium text-sm mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* IET rules */}
      <div className="border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/10 rounded-lg p-4 flex flex-col gap-2">
        <p className="text-sm font-semibold">IET Rules</p>
        <ul className="text-sm text-muted-foreground flex flex-col gap-1 list-disc pl-4">
          <li>Pass mark: 40% overall per module</li>
          <li>Any component worth &gt;30% of a module must score ≥30% or it triggers a component fail</li>
          <li>Maximum 30 credits can be condoned across the whole BEng</li>
          <li>Condonation is at Board of Examiners&apos; discretion</li>
        </ul>
      </div>

      {/* Grade thresholds */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Grade thresholds</p>
        <div className="flex gap-2 flex-wrap">
          {[
            { label: "First", range: "≥80%", colour: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
            { label: "2:1", range: "60-79%", colour: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
            { label: "2:2", range: "40-59%", colour: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
            { label: "Fail", range: "<40%", colour: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
          ].map(({ label, range, colour }) => (
            <div key={label} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${colour}`}>{label} - {range}</div>
          ))}
        </div>
      </div>

      {/* Term dates */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Term dates 2025/26</p>
        <div className="flex flex-col gap-1 text-sm">
          <div className="flex gap-3"><span className="text-muted-foreground w-16">Term 1</span><span>22 Sept - 12 Dec 2025</span></div>
          <div className="flex gap-3"><span className="text-muted-foreground w-16">Term 2</span><span>5 Jan - 28 March 2026</span></div>
          <div className="flex gap-3"><span className="text-muted-foreground w-16">Term 3</span><span>23 April - 6 June 2026</span></div>
        </div>
      </div>

      {/* Stage 1 */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Stage 1 - Year 1 (Level 4, 120 credits)</p>
        <ModuleTable modules={stage1} />
      </div>

      {/* Stage 2 */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Stage 2 - Year 2 (Level 5, 120 credits)</p>
        <ModuleTable modules={stage2} />
      </div>

      {/* Placement */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Stage 3P - Placement Year (optional)</p>
        <div className="border border-border rounded-lg p-3 text-sm text-muted-foreground">
          EPSP01 - EPS Placement Year (120 credits, Level P)
        </div>
      </div>

      {/* Final year */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Stage F - Final Year (Level 6, 120 credits)</p>
        <p className="text-xs text-muted-foreground">Core (90 credits)</p>
        <ModuleTable modules={stageF_core} />
        <p className="text-xs text-muted-foreground mt-2">Section A - choose 15 credits from:</p>
        <ModuleTable modules={stageF_sectionA} />
        <p className="text-xs text-muted-foreground mt-2">Section B - choose 15 credits from:</p>
        <ModuleTable modules={stageF_sectionB} />
      </div>
    </div>
  )
}
