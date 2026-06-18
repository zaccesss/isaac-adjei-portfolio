import type { BlogPost } from "../index"

const _ocular_prosthetics_bionic_vision: BlogPost = {
    slug: "ocular-prosthetics-bionic-vision",
    title: "Bionic Vision and Ocular Prosthetics: Where the Science Actually Stands",
    date: "2026-05-20",
    type: "research",
    cover_image: "/images/blog/covers/ocular-prosthetics-bionic-vision.webp",
    description:
      "A technical survey of retinoblastoma, ocular prosthetics and bionic vision systems: what prosthetic eyes can and cannot do, how retinal implants work and where the engineering challenges in restoring functional vision lie.",
    tags: ["Health Tech", "Prosthetics", "Research", "Bioelectronics", "Vision"],
    published: true,
    featured: true,
    content: [
      {
        type: "p",
        text: "I lost sight in my right eye to retinoblastoma at age two. The treatment was enucleation - surgical removal of the eye - followed by fitting a prosthetic. I have worn an ocular prosthesis my entire life. This gives me a particular interest in the field that is not purely academic: I want to understand where the science and engineering actually stand, what is possible today and what the barriers are to restoring functional vision.",
      },
      {
        type: "p",
        text: "This post surveys the current state of retinoblastoma treatment, ocular prosthetics and bionic vision systems. It is a research post, not a medical opinion. Where I have cited specific figures and claims I have linked the source.",
      },
      {
        type: "h2",
        text: "Retinoblastoma: Background",
      },
      {
        type: "p",
        text: "Retinoblastoma is a malignant tumour of the retina arising from mutations in the RB1 gene, a tumour suppressor on chromosome 13q14. It is the most common primary intraocular malignancy in children, occurring in approximately 1 in 16,000 to 18,000 live births worldwide. About 40% of cases are hereditary (germline mutation, often bilateral) and 60% are non-hereditary (somatic mutation, typically unilateral). In the UK, around 50 new cases are diagnosed each year.",
      },
      {
        type: "p",
        text: "Treatment has improved significantly over the past three decades. Enucleation (eye removal) was once the standard for all but the smallest tumours. Today, intra-arterial chemotherapy (IAC) - delivering chemotherapy directly into the ophthalmic artery - achieves globe salvage rates above 80% for Group D eyes that would historically have required enucleation. For the smallest tumours, focal treatments including laser photocoagulation, cryotherapy and brachytherapy can preserve the eye and sometimes useful vision. Survival rates for intraocular retinoblastoma in high-income countries now exceed 98%.",
      },
      {
        type: "h2",
        text: "Ocular Prosthetics: What They Are",
      },
      {
        type: "p",
        text: "A conventional ocular prosthesis is a custom-painted acrylic or glass shell fitted over an orbital implant. After enucleation, a spherical implant (typically hydroxyapatite or porous polyethylene, 18-22mm diameter) is placed in the orbit and integrated with the extraocular muscles to allow movement. The prosthesis is a cosmetic shell placed in the socket in front of this implant. It provides a close cosmetic match to the fellow eye and moves partially through transmission from the implant, but provides no visual function whatsoever.",
      },
      {
        type: "p",
        text: "Custom prostheses are hand-painted by ocularists to match iris colour, blood vessel patterns and pupil size. A well-fitted custom prosthesis is almost indistinguishable from a natural eye in most lighting conditions. Digital printing technology is beginning to supplement hand-painting, enabling faster production and more consistent colour matching, though hand-painted prostheses from experienced ocularists remain the gold standard for cosmetic quality.",
      },
      {
        type: "h2",
        text: "The Gap Between Cosmetic and Functional",
      },
      {
        type: "p",
        text: "The fundamental limitation of conventional ocular prosthetics is that they restore appearance but not function. There is no connection to the visual pathway. No light is detected, no signals are sent to the brain. For patients who have lost an eye that previously had functional vision, this is a significant loss. For those who lost the eye in infancy, like me, the visual system in the affected hemisphere typically never develops the full cortical representations it would have with binocular input.",
      },
      {
        type: "p",
        text: "This is where bionic vision research becomes relevant. The goal is to restore some functional vision to people who have lost it - whether through retinal disease, optic nerve damage or, eventually, complete enucleation.",
      },
      {
        type: "h2",
        text: "Retinal Implants: Epiretinal and Subretinal",
      },
      {
        type: "p",
        text: "Retinal prostheses electrically stimulate the remaining retinal cells in patients with degenerative conditions such as retinitis pigmentosa or age-related macular degeneration, where the photoreceptors (rods and cones) are lost but the inner retinal neurons and ganglion cells are partially preserved. Two main approaches exist: epiretinal implants (placed on the inner retinal surface) and subretinal implants (placed beneath the retina between the photoreceptor layer and the retinal pigment epithelium).",
      },
      {
        type: "p",
        text: "The Argus II (Second Sight Medical Products) was the first retinal prosthesis to receive FDA approval (2013) and CE mark (2011). It consists of 60 electrodes on an epiretinal array, a glasses-mounted camera and a body-worn video processing unit. Clinical results showed that patients could detect light, perceive motion and in some cases read large-print text. However, the spatial resolution was very limited: 60 electrodes covers only a small portion of the visual field at low resolution. Second Sight ceased operations in 2022 and the Argus II is no longer actively supported.",
      },
      {
        type: "p",
        text: "The PRIMA system (Pixium Vision) takes a subretinal approach using wireless photovoltaic micro-chips powered by near-infrared light projected from augmented reality glasses. Early clinical results in patients with dry age-related macular degeneration showed improvements in visual acuity in the implanted area. PRIMA has received a CE mark as a humanitarian device for dry AMD. Pixium Vision was acquired by Science Corporation in 2024.",
      },
      {
        type: "h2",
        text: "Cortical Visual Prosthetics",
      },
      {
        type: "p",
        text: "For patients where the retina and optic nerve are non-functional (including enucleation cases), retinal implants are not applicable. Cortical visual prosthetics bypass the eye entirely and stimulate the visual cortex directly. The Orion system (Second Sight) and the ongoing research by the Beauchamp/Yoshor lab at Baylor College of Medicine using Utah arrays in V1 have demonstrated that patients with no light perception can perceive phosphenes (flashes of light) in spatially organised patterns corresponding to the electrode array.",
      },
      {
        type: "p",
        text: "The engineering challenges for cortical implants are substantial. The visual cortex is folded and heterogeneous: the spatial mapping between electrode position and perceived phosphene location is complex. Long-term biocompatibility of electrode arrays in brain tissue remains unsolved - the foreign body response degrades signal quality over months to years. Power and data telemetry through the skull require careful RF design. And the resolution of current arrays is far below what would be needed for practical visual function.",
      },
      {
        type: "h2",
        text: "Optogenetics and the Next Generation",
      },
      {
        type: "p",
        text: "Optogenetics offers a fundamentally different approach. Rather than stimulating neurons electrically, it genetically modifies them to express light-sensitive proteins (channelrhodopsins) that depolarise in response to specific wavelengths of light. In 2021, the first human case report was published in Nature Medicine: a patient with advanced retinitis pigmentosa received an intravitreal injection of an adeno-associated virus vector expressing channelrhodopsin, combined with light-stimulating goggles. The patient recovered partial vision in the treated eye - the first demonstration of optogenetic restoration of visual function in a human.",
      },
      {
        type: "p",
        text: "Optogenetics avoids the electrode array entirely: the light sensitivity is in the cells themselves. Resolution is limited only by the density of transduced cells and the optics of the stimulation system. The major barriers are the efficiency and safety of gene delivery, the intensity of light required and the long-term stability of channelrhodopsin expression.",
      },
      {
        type: "h2",
        text: "The Engineering Challenges That Remain",
      },
      {
        type: "ul",
        items: [
          "Resolution: current retinal implants have 60-1000 electrodes vs approximately 1.5 million ganglion cells in the human retina. Functional vision requires orders of magnitude more channels.",
          "Biocompatibility: all implanted electrodes trigger a foreign body response that degrades signal quality over time. Long-term stable neural interfaces remain an open problem.",
          "Power and data: wireless power transfer to implants deep in the eye or cortex, with sufficient bandwidth for high-resolution stimulation, requires miniaturised RF and power electronics at the limits of current technology.",
          "Cortical plasticity: the adult visual cortex has limited plasticity. Patients who lost vision in infancy (like retinoblastoma cases) may have different cortical representations that affect how well electrical stimulation translates to perceived images.",
          "Complete orbit reconstruction: for enucleated patients, restoring the full visual pathway requires both a functional light-capturing front end and integration with surviving visual cortex - currently far beyond clinical capability.",
        ],
      },
      {
        type: "quote",
        text: "The eye is not the organ of vision. The brain is.",
        source: "Neuroscience of vision principle",
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "ol-links",
        items: [
          { text: "The Children's Eye Cancer Trust: Retinoblastoma - epidemiology and treatment overview", url: "https://www.chect.org.uk/about-retinoblastoma/" },
          { text: "Wikipedia: Visual prosthesis (bionic eye) - overview of retinal and cortical implant technology", url: "https://en.wikipedia.org/wiki/Visual_prosthesis" },
          { text: "Wikipedia: Retinal prosthesis - technical background on epiretinal and subretinal devices", url: "https://en.wikipedia.org/wiki/Retinal_prosthesis" },
          { text: "NIH National Eye Institute: Vision restoration research", url: "https://www.nei.nih.gov" },
          { text: "Shields et al.: Intra-arterial chemotherapy for retinoblastoma globe salvage - search on PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/?term=shields+intra-arterial+chemotherapy+retinoblastoma+globe+salvage" },
          { text: "Humayun et al.: International trial of Second Sight Argus II visual prosthesis - search on PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/?term=humayun+argus+second+sight+visual+prosthesis+international+trial" },
          { text: "Palanker et al.: Photovoltaic restoration of central vision in AMD - PRIMA trial (Nature Medicine 2020) - search on PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/?term=palanker+photovoltaic+restoration+central+vision+AMD+prima" },
          { text: "Sahel et al.: Partial recovery of visual function after optogenetic therapy (Nature Medicine 2021) - search on PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/?term=sahel+partial+recovery+visual+function+optogenetic+therapy+blind" },
          { text: "Beauchamp et al.: Dynamic stimulation of visual cortex produces form vision in blind humans (Cell 2020) - search on PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/?term=beauchamp+dynamic+stimulation+visual+cortex+form+vision+sighted+blind" },
          { text: "NHS: Retinoblastoma - symptoms, diagnosis and treatment", url: "https://www.nhs.uk/conditions/retinoblastoma/" },
          { text: "NHS: Retinoblastoma - causes, including RB1 gene mutations", url: "https://www.nhs.uk/conditions/retinoblastoma/causes/" },
        ],
      },
    ],
  }

export default _ocular_prosthetics_bionic_vision
