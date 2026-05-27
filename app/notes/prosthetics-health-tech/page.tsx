import type { Metadata } from "next"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, ExternalLink } from "lucide-react"
import ShareButton from "@/components/shared/ShareButton"

export const metadata: Metadata = {
  title: "Prosthetics and Health Technology Research",
  description:
    "A personal research interest in ocular prosthetics, bionic vision and bio-integrated electronics, motivated by losing sight in one eye to retinoblastoma.",
  alternates: {
    canonical: "https://www.isaacadjei.me/notes/prosthetics-health-tech",
  },
  openGraph: {
    images: ["/api/og?title=Prosthetics%20%26%20Health%20Tech%20Research&description=A%20personal%20research%20interest%20in%20ocular%20prosthetics%2C%20bionic%20vision%20and%20bio-integrated%20electronics%2E"],
  },
}

const references = [
  {
    text: "NHS: Retinoblastoma - symptoms, diagnosis and treatment",
    url: "https://www.nhs.uk/conditions/retinoblastoma/",
  },
  {
    text: "Retinoblastoma UK - patient information, research and support",
    url: "https://www.retinoblastoma.org.uk",
  },
  {
    text: "PMC: Long-term outcomes and patient experiences with the Argus II retinal prosthesis system",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12496445/",
  },
  {
    text: "PMC: Five-year safety and performance results from the Argus II Retinal Prosthesis System clinical trial",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5035591/",
  },
  {
    text: "PMC: Can bionic eyes restore vision? Breakthroughs, challenges and future frontiers - a comprehensive review",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12659496/",
  },
  {
    text: "PMC: Advancements in ocular neuroprosthetics - bridging neuroscience and ICT for vision restoration",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11852115/",
  },
  {
    text: "National Eye Institute (NIH): Retinitis Pigmentosa - the condition Argus II targets",
    url: "https://www.nei.nih.gov/learn-about-eye-health/eye-conditions-and-diseases/retinitis-pigmentosa",
  },
  {
    text: "PubMed: Hydroxyapatite orbital implants - research literature",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=hydroxyapatite+orbital+implant+surgery&sort=date",
  },
  {
    text: "PubMed: Flexible electronics for neural interfaces - review literature",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=flexible+electronics+neural+interface+review&filter=pubt.review&sort=date",
  },
  {
    text: "IEEE Transactions on Neural Systems and Rehabilitation Engineering",
    url: "https://ieeexplore.ieee.org/xpl/RecentIssue.jsp?punumber=7333",
  },
]

export default function ProstheticsHealthTechPage() {
  return (
    <div className="container max-w-3xl py-24 space-y-12">
      <div>
        <Link
          href="/notes"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to notes
        </Link>
        <div className="flex flex-wrap gap-2 mb-4">
          {["Prosthetics", "Health Tech", "Research", "Bioelectronics", "IoT"].map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-start gap-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Prosthetics and Health Technology Research
          </h1>
          <ShareButton title="Prosthetics & Health Tech Research — Isaac Adjei" />
        </div>
        <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
          This is not just a research interest. At age two I lost the sight in my right eye to
          retinoblastoma. I have lived with monocular vision my entire life. I want to understand
          where the science and engineering of ocular prosthetics actually stands and where the
          hardest problems remain unsolved.
        </p>
      </div>

      <Separator />

      <section className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-muted-foreground [&_h2]:text-foreground [&_h2]:font-bold [&_h2]:text-xl [&_h2]:mt-0 [&_p]:leading-relaxed [&_p]:text-[0.95rem]">
        <h2>Background</h2>
        <p>
          Retinoblastoma is a rare form of eye cancer that develops in the retina, most commonly
          in children under five. Treatment options depend on the stage and extent of the tumour.
          In cases where the cancer is too advanced to save the eye, enucleation (surgical removal
          of the eye) is performed to prevent the cancer spreading. This is the situation I was in
          at age two.
        </p>
        <p>
          After enucleation, the orbit (eye socket) is fitted with an orbital implant to maintain
          the shape of the socket. A prosthetic eye (ocular prosthesis) is then custom-made to sit
          in front of the implant. Modern prosthetic eyes are typically made from acrylic and are
          hand-painted to match the patient&apos;s other eye. They provide a cosmetic restoration but
          no visual function. That gap is what I find most interesting from an engineering
          perspective.
        </p>

        <h2>Where the technology stands</h2>
        <p>
          The current state of ocular prosthetics divides into two distinct categories:
        </p>

        <h2 className="text-base font-semibold text-foreground/80 !mt-2">Cosmetic prosthetics</h2>
        <p>
          These are the traditional prosthetic eyes most people picture. They are non-functional
          in terms of vision but have advanced considerably. Modern hydroxyapatite (HA) orbital
          implants are porous, which allows blood vessels to grow into the implant over time. This
          vascularisation means the implant integrates with surrounding tissue and can be connected
          to the eye muscles for better motility, meaning the prosthetic eye moves more naturally
          in response to the other eye. Some implant designs also include a peg system that
          mechanically connects the prosthetic to the implant to further improve movement
          coordination.
        </p>
        <p>
          Custom acrylic prosthetics are hand-crafted and painted by specialist ocularists.
          The quality of the cosmetic result depends heavily on the skill of the ocularist and the
          quality of fitting. Digital fabrication techniques including 3D scanning and digital
          painting are beginning to enter the field, with some studies showing comparable cosmetic
          outcomes and significantly reduced production time.
        </p>

        <h2 className="text-base font-semibold text-foreground/80 !mt-2">Visual prosthetics (bionic vision)</h2>
        <p>
          This is the frontier of the field. Visual prosthetics attempt to restore some form of
          functional vision by directly stimulating the visual pathway electrically. Several
          approaches are being investigated:
        </p>
        <ul className="list-none space-y-2">
          {[
            "Retinal prostheses: electrode arrays implanted on or near the retina that stimulate surviving retinal ganglion cells. The Argus II (Second Sight Medical Products) was the most widely implanted device, providing low-resolution light perception in patients with retinitis pigmentosa. It has since been discontinued commercially but remains a significant proof of concept. The resolution achievable is roughly equivalent to a very low-resolution dot matrix display.",
            "Cortical prostheses: bypass the eye and retina entirely by stimulating the visual cortex directly. The Gennaris system (Monash Vision Group, Australia) implants a grid of microelectrodes on the surface of the visual cortex, driven wirelessly by a camera mounted in a pair of glasses. This approach is relevant for patients who have lost both the eye and the optic nerve, where retinal stimulation is not possible.",
            "Optic nerve stimulation: electrodes placed around the optic nerve rather than the retina or cortex. Less invasive than cortical implants but the optic nerve carries approximately 1.2 million fibres, making selective stimulation technically very challenging.",
            "Subretinal implants: placed beneath the retina, where photovoltaic cells convert light into electrical current to stimulate remaining bipolar cells. The PRIMA system (Pixium Vision) uses this approach and has shown promising results in dry age-related macular degeneration patients.",
          ].map((item) => (
            <li key={item} className="flex gap-2 text-sm">
              <span className="text-primary shrink-0 mt-0.5">→</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <h2>The engineering challenges</h2>
        <p>
          The core problem in visual prosthetics is resolution. The human retina contains
          approximately 120 million photoreceptors. Even the most advanced implants currently
          stimulate on the order of a few hundred electrodes. The resulting visual percept is
          described by patients as sparse phosphenes (flashes of light) rather than coherent
          imagery. Bridging this gap requires either dramatically increasing electrode density or
          finding smarter stimulation strategies that exploit the remaining neural circuitry.
        </p>
        <p>
          Key engineering challenges in the field include:
        </p>
        <ul className="list-none space-y-2">
          {[
            "Biocompatibility: electrode materials must not trigger immune responses or corrode over years of implantation. Platinum and iridium oxide are current standards but research into flexible polymer-based arrays continues.",
            "Power delivery: implanted devices need power. Transcutaneous inductive coupling (wireless charging through skin) is the standard approach, but efficiency and safety constraints limit how much power can be delivered.",
            "Data bandwidth: transmitting enough information to drive hundreds or thousands of electrodes wirelessly in real time requires specialised RF protocols and compression strategies.",
            "Neural adaptation: the brain adapts to electrical stimulation over time, a phenomenon called perceptual fading, where constant stimulation becomes less effective. Stimulation patterns need to be varied to maintain perceptual quality.",
            "Miniaturisation: as electrode counts increase, the supporting electronics must shrink. Custom ASICs (application-specific integrated circuits) are typically required to fit within the strict size constraints of an ocular implant.",
          ].map((item) => (
            <li key={item} className="flex gap-2 text-sm">
              <span className="text-primary shrink-0 mt-0.5">→</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <h2>What I want to investigate</h2>
        <p>
          My immediate goal is to build a deep understanding of the field: what has been achieved,
          where the primary limitations lie and what the current research directions are. As someone
          with a background in embedded systems and electronics, the hardware side of this problem
          is what interests me most.
        </p>
        <p>
          Specifically, I want to investigate:
        </p>
        <ul className="list-none space-y-2">
          {[
            "The electrode-tissue interface: what materials and geometries minimise impedance and tissue damage over long implantation periods",
            "Flexible electronics for neural interfaces: PEDOT:PSS and other conductive polymers that can conform to curved biological surfaces",
            "Closed-loop stimulation: using recorded neural responses to adapt stimulation parameters in real time, rather than open-loop fixed patterns",
            "Smart prosthetic eyes: whether passive cosmetic prosthetics could be augmented with sensors or actuators to improve motility, integrate ambient light sensing or eventually feed into retinal stimulation",
            "IoT and connectivity: how implanted devices communicate securely with external processors, given the constraints on power, bandwidth and the requirement for long-term reliability",
          ].map((item) => (
            <li key={item} className="flex gap-2 text-sm">
              <span className="text-primary shrink-0 mt-0.5">→</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <h2>Where this might lead</h2>
        <p>
          I am realistic about the timescales involved. This is not a project I will complete in
          a summer. Research in neural interfaces takes years and requires multidisciplinary teams.
          But I want to build a serious understanding of the field at the level where I could
          eventually contribute to it, whether through research during a postgraduate degree,
          through a placement at a medical device company or through independent work.
        </p>
        <p>
          The starting point is a literature review: reading the key papers, understanding the
          state of the art and identifying the specific technical problems that seem most tractable
          from an electrical engineering perspective. I will document that process here as it
          develops.
        </p>
        <p>
          If my constraints contributed to the tools I build for myself, I see no reason why they
          cannot eventually contribute to tools that help other people in similar situations. That
          is the direction I want to move in.
        </p>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-xl font-bold">References and resources</h2>
        <ul className="space-y-3">
          {references.map((ref) => (
            <li key={ref.text}>
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-start gap-2 text-sm text-primary hover:underline group"
              >
                <ExternalLink className="h-3.5 w-3.5 shrink-0 mt-0.5 opacity-70 group-hover:opacity-100" />
                <span>{ref.text}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <Separator />

      <Link
        href="/notes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to notes
      </Link>
    </div>
  )
}
