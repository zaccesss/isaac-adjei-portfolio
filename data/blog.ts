// All blog post data and the type definitions needed to work with it.
// PostType controls the coloured label shown on each post card.
// ContentBlock is a discriminated union - each object has a 'type' field that tells
// the renderer exactly how to display it (paragraph, heading, list, code block, etc.).

export type PostType = "blog" | "journal" | "research" | "notes" | "report" | "article" | "resources"

export type ContentBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "ol-links"; items: { text: string; url?: string }[] }
  | { type: "code"; lang: string; text: string }
  | { type: "quote"; text: string; source?: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "video"; youtubeId: string; title: string; description?: string }
  | { type: "spotify"; episodeId: string; title: string; description?: string }
  | { type: "divider" }

// A single blog post - slug is used for the URL, readingTime is shown on the card
export interface BlogPost {
  slug: string
  title: string
  date: string
  type: PostType
  description: string
  tags: string[]
  readingTime: number // minutes
  published: boolean
  content: ContentBlock[]
  projectSlug?: string
  // Optional hero image shown at the top of the post and as og:image for social sharing.
  cover_image?: string
  // I use series + seriesPart to group related posts. Both fields must be set together.
  series?: string
  seriesPart?: number
}

export const POST_TYPES: { label: string; value: PostType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Blog", value: "blog" },
  { label: "Journal", value: "journal" },
  { label: "Research", value: "research" },
  { label: "Report", value: "report" },
  { label: "Article", value: "article" },
  { label: "Notes", value: "notes" },
  { label: "Resources", value: "resources" },
]

export const posts: BlogPost[] = [
  // ── JOURNEY ──────────────────────────────────────────────────────────────────
  {
    slug: "my-journey-so-far",
    title: "My Journey So Far",
    date: "2024-06-01",
    type: "journal",
    cover_image: "https://images.unsplash.com/photo-1490133961212-53d0e60a1f73?w=1200&auto=format&fit=crop&q=80",
    description:
      "From losing sight in one eye at age two, to losing my father, to moving countries and rebuilding from scratch. The full story of how I got to where I am today.",
    tags: ["Personal", "Ghana", "Aston", "Journey", "Engineering", "Faith"],
    readingTime: 15,
    published: true,
    content: [
      {
        type: "h2",
        text: "Acknowledgements",
      },
      {
        type: "p",
        text: "Before anything else, I want to acknowledge the people who made this possible. To God, for every open door, every moment of clarity in difficulty and every grace that carried me further than I could carry myself. To my late father, whose hands built things and whose words, \"Always strive to make things better\", still guide everything I do. We hope you are proud, Dad. To my mum, who has had the single biggest impact on who I am. She has looked after us with everything she has, continuing to give, protect and pour into us even without our dad by her side. Her strength, sacrifice and love are behind every step I have taken. And to my siblings, who I carry with me in everything I do. This journey is for all of you.",
      },
      {
        type: "divider",
      },
      {
        type: "p",
        text: "I was not supposed to end up in engineering. Nobody sat me down and mapped a route. It happened gradually, shaped by a father who showed me what it meant to build things with your hands, by a school that demanded excellence and by a series of decisions I had to make on my own when the path was not obvious.",
      },
      {
        type: "p",
        text: "This is the full story. I am writing it because I think there are people who need to read it. If you are the first in your family to pursue this, if you have faced setbacks that made you question whether you belong here, if you have had to start over more than once, this one is for you.",
      },
      {
        type: "h2",
        text: "The beginning",
      },
      {
        type: "p",
        text: "I grew up in Ghana. At age two, I lost the sight in my right eye after surgery for suspected retinoblastoma, a rare childhood eye cancer. Because of the surgeries and recovery, I missed several early years of school. When I eventually returned, I was around six or seven years old while many of my classmates were already ahead. I had to catch up without anyone acknowledging how significant that gap was.",
      },
      {
        type: "p",
        text: "Growing up with monocular vision, I faced assumptions about what I could and could not do. For a long time, I dreamed of becoming a pilot. That dream was taken from me when I was told that monocular vision made it an impossible career path. I was young when I heard that, and it stung. But looking back, it was the first moment I had to redirect a dream rather than abandon it. It would not be the last.",
      },
      {
        type: "p",
        text: "I also faced bullying growing up. I struggled with confidence, with insecurity and with caring too much about what other people thought. There were periods that were genuinely dark. I am not going to give those periods more space than they deserve here, but I want to acknowledge them because honesty matters more than a polished story. What I learned, slowly and through repetition, is that the opinions of people who want to diminish you are not data. They are noise. Consistency beats cruelty every time.",
      },
      {
        type: "h2",
        text: "My father",
      },
      {
        type: "p",
        text: "My father was a mechanical and refrigeration engineer. During school holidays I would go to work with him and watch engineering happen in real time. He moved parts, diagnosed faults and fixed things that other people had given up on. I absorbed all of it without knowing that was what I was doing. He had a way of approaching problems that was calm and methodical, and it left a deep impression on me.",
      },
      {
        type: "p",
        text: "He used to say: always strive to make things better. I did not fully understand what that meant when I was young. I do now.",
      },
      {
        type: "p",
        text: "In 2021, I lost him. He passed away during a period that was already difficult. Losing him was one of the hardest moments of my life. But it also became a turning point. I decided I wanted to carry forward that problem-solving mindset. I wanted to choose engineering not just because I was interested in it but because it felt like honouring something he left behind.",
      },
      {
        type: "h2",
        text: "Adisadel College",
      },
      {
        type: "p",
        text: "I spent my senior high school years at Adisadel College in Cape Coast, one of the most prestigious boys' schools in Ghana, founded in 1910. The motto is Vel Primus, Vel Cum Primis: either the first, or with the first. That motto is not decorative. It is a standard the school actually holds you to.",
      },
      {
        type: "p",
        text: "I lived in Thomas Jonah House. I served as Dispensary Prefect, House Secretary of Thomas Jonah House and Vice President of APOSA, my church group. I was also active in the Robotics Club, Scripture Union, PENSA and the Debate Society. Those roles taught me leadership in a way that classrooms cannot: real responsibility, real accountability and real consequences when you let people down.",
      },
      {
        type: "p",
        text: "Adisadel shaped me in ways I am still discovering. It gave me a standard for what excellence looks like and a deep belief that where you start does not determine where you finish.",
      },
      {
        type: "h2",
        text: "Moving to the UK",
      },
      {
        type: "p",
        text: "In April 2022, my mother was posted to the UK for work and I came with her. Starting again in a new country and a completely new education system was harder than I expected. My academic background was in General Arts. I had no formal technical foundation. Engineering was the direction I wanted to go but I had to get there from a standing start.",
      },
      {
        type: "p",
        text: "I enrolled at Stanmore College in London on a business course. After two months I knew it was wrong. I approached the college, sat the necessary examinations to demonstrate my aptitude and transferred onto the engineering programme, joining two months after it had already started. I had to catch up again, this time in a subject I had never formally studied, while balancing part-time work and everything that comes with being new to a country.",
      },
      {
        type: "p",
        text: "That pattern, of arriving late and still succeeding, has repeated itself at almost every stage of my life. I do not say that to make it sound romantic. At the time it is stressful and disorienting. But it has taught me that late starts do not have to mean worse outcomes.",
      },
      {
        type: "p",
        text: "I graduated with D*DD: Distinction*, Distinction, Distinction in the Pearson BTEC Level 3 National Extended Diploma in Engineering. I was recognised as the Best and Most Hardworking Student at Stanmore College. Every day at that college I thought about my father and what he had built. He was my motivation.",
      },
      {
        type: "h2",
        text: "Limitations becoming solutions",
      },
      {
        type: "p",
        text: "Being partially sighted has shaped how I think about technology. During my studies I found that reading lecture slides and textbook pages was often difficult. So I built something to fix it.",
      },
      {
        type: "p",
        text: "The project is called Zaccess. It takes photos of lecture slides or textbook pages, uses OCR to extract the text and converts it into high-contrast large-text notes with text-to-speech support. It was built to help me study more comfortably. But something more interesting happened: I shared it with another visually impaired student, and he told me it saved him hours every week.",
      },
      {
        type: "p",
        text: "That moment changed how I think about my condition. The limitations I have lived with are not separate from the engineer I am becoming. They are part of why I build the things I build. Sometimes your constraints become your direction.",
      },
      {
        type: "h2",
        text: "Faith",
      },
      {
        type: "p",
        text: "Faith has been a constant throughout all of this. I am a Christian, and that is not a footnote to my story. It runs through it. There were moments where things could have gone very differently. Doors that opened when they logically should not have. The engineering transfer. The results. The university offers. The scholarship. Clearing working out. Surviving situations that could have ended differently.",
      },
      {
        type: "h2",
        text: "Aston University",
      },
      {
        type: "p",
        text: "I am now studying BEng Electronic Engineering and Computer Science at Aston University, Birmingham, working towards a First Class degree. The programme covers embedded systems, digital electronics, software development, engineering mathematics and more. It is demanding and I am exactly where I want to be.",
      },
      {
        type: "p",
        text: "I am a Student Representative at Aston Students Union, a Student Member of the [IET](https://www.theiet.org) and active in the Aston Ghana Society, Computing Society and Gaming Society. In 2026 I was named a Top 40 Finalist for the Black Heritage Undergraduate of the Year Award, run by TargetJobs and Sky. I completed the Cancer Research UK 10 Days of 5K Challenge, running more than 50 kilometres to raise funds for cancer research. I also completed a student judging role for the targetjobs National Graduate Recruitment Awards.",
      },
      {
        type: "h2",
        text: "Where things stand",
      },
      {
        type: "p",
        text: "I have worked as a Consular Intern and Administrative and Estates Intern at the Ghana High Commission in London. I have completed virtual engineering programmes with British Airways, analysing A320 maintenance schedules and producing material forecast reports, and with Yunex Traffic, exploring intelligent transport systems and air quality sensor networks. Between 2022 and 2025 I worked at Casa do Frango Piccadilly, developing communication and composure under pressure alongside my studies.",
      },
      {
        type: "p",
        text: "On the technical side: I have designed and built a [two-stage audio amplifier](/blog/two-stage-audio-amplifier) as a PCB from scratch, a 4x4x4 [NeoPixel LED Cube](/projects/led-cube) with adaptive brightness, a full-stack predictive maintenance platform called [Phaemos](/projects/phaemos) (ongoing), an open-source Git course with over 200 files and Zaccess, an ongoing accessibility tool that uses OCR and text-to-speech to convert lecture slides into readable notes. I work across bare-metal C for microcontrollers, full-stack web with Next.js and Python-based machine learning.",
      },
      {
        type: "p",
        text: "None of it is finished. That is the point. Engineering is not a destination. It is a commitment to keep improving, keep building and keep asking what else is possible. My father said it best: always strive to make things better.",
      },
      {
        type: "h2",
        text: "For whoever needs to hear this",
      },
      {
        type: "p",
        text: "If you are struggling academically, if you are living with a disability or medical trauma, if you are an immigrant adapting to a new system, if you are dealing with grief or battling insecurity, if you feel like you are behind: you are not out. You are in the middle of something. The starting point does not define the outcome. I am living proof of that.",
      },
    ],
  },

  // ── TWO-STAGE AUDIO AMPLIFIER REPORT ─────────────────────────────────────────
  {
    slug: "two-stage-audio-amplifier",
    title: "Designing and Building a Two-Stage Audio Amplifier from Scratch",
    date: "2026-03-01",
    type: "report",
    projectSlug: "audio-amplifier",
    cover_image: "/images/projects/audio-amplifier/pcb-angled.jpg",
    description:
      "Full technical report on the design, simulation, PCB fabrication and testing of a two-stage audio amplifier using a TL071 active band-pass filter and OPA551 unity-gain output buffer, optimised for an iPhone input and 8 ohm speaker load.",
    tags: ["Electronics", "PCB", "Op-Amp", "Audio", "Aston", "Proteus"],
    readingTime: 25,
    published: true,
    content: [
      {
        type: "h2",
        text: "Abstract",
      },
      {
        type: "p",
        text: "This report describes the design, simulation, testing and implementation of a two-stage audio amplifier optimised for an iPhone 14 Pro Max with a 0.872 Vpp input. A TL071 (Stage 1) performs stereo-to-mono summing, provides 10.67 dB gain and achieves a passband from 6.63 Hz to 28.54 kHz. An OPA551 (Stage 2) drives an 8 ohm speaker at 3 Vpp from a 9 V to 12 V single supply. The amplifier is implemented on a two-layer PCB mounted on an acrylic baseplate.",
      },
      {
        type: "h2",
        text: "1. Introduction",
      },
      {
        type: "p",
        text: "This report describes the design, simulation, testing and implementation of a two-stage audio amplifier (see also the [project page](/projects/audio-amplifier)) capable of accepting an audio input signal from a mobile phone and amplifying it to drive an external speaker. The amplifier was optimised for use with an iPhone 14 Pro Max, with a design input level of 0.872 Vpp at volume step 15 of 16, corresponding to 70% of the maximum measured output at 440 Hz. The target output is 3 Vpp across an 8 ohm speaker load. The system operates from either a 12 V DC power adapter or a 9 V PP3 battery, with an on/off switch and green LED indicator.",
      },
      {
        type: "p",
        text: "A two-stage architecture is employed because no single operational amplifier can simultaneously provide the required voltage gain with active band-pass filtering and the output current necessary to drive a low-impedance speaker load. The first stage uses a TL071 configured as an inverting summing active band-pass filter, combining the stereo left and right input channels into a mono signal, setting the voltage gain to 10.67 dB and defining the passband from 6.63 Hz to 28,540 Hz. The second stage uses an OPA551 configured as a unity-gain voltage follower to provide the current drive capability required to deliver 3 Vpp across the 8 ohm load whilst preserving the voltage established by the first stage.",
      },
      {
        type: "h2",
        text: "2. Technical Background",
      },
      {
        type: "h3",
        text: "2.1 Human Hearing Range and Stereo vs Mono Audio",
      },
      {
        type: "p",
        text: "The human auditory system can perceive sound across a frequency range of approximately 20 Hz to 20 kHz, although this range varies between individuals and typically narrows with age. Within this audible spectrum, different frequency bands contribute distinct perceptual qualities to sound reproduction. Frequencies in the lower portion of the spectrum, broadly from 20 Hz to approximately 300 Hz, are perceived as bass. The mid-range, spanning approximately 300 Hz to 4 kHz, contains the fundamental frequencies of the human voice and most melodic instruments. The upper portion, from approximately 4 kHz to 20 kHz, is perceived as treble, encompassing the high-frequency content responsible for clarity and brightness of audio.",
      },
      {
        type: "image",
        src: "/images/blog/audio-amplifier/human_hearing_range.png",
        alt: "Human hearing range showing the audible frequency spectrum from 20 Hz to 20 kHz",
        caption: "Human hearing range showing the audible frequency spectrum from 20 Hz to 20 kHz",
      },
      {
        type: "p",
        text: "Consumer audio devices produce stereo audio output consisting of two independent channels, left and right, which carry slightly different audio content. Where a stereo input is to be reproduced through a single mono loudspeaker, the two channels must be combined into a single mono signal. This process is referred to as stereo-to-mono summing and is commonly implemented using an inverting summing amplifier configuration, in which the left and right input signals are each connected to the inverting input of an operational amplifier through separate input resistors of equal value.",
      },
      {
        type: "h3",
        text: "2.2 Active Band-Pass Filters",
      },
      {
        type: "p",
        text: "A band-pass filter passes signals between a lower cut-off frequency fL and an upper cut-off frequency fH whilst attenuating all frequencies outside that range. The two cut-off frequencies are defined as the points at which the output signal power falls to half of its maximum value, corresponding to a reduction in voltage gain of 3 dB below the maximum passband gain.",
      },
      {
        type: "image",
        src: "/images/blog/audio-amplifier/Figure1_BPF.png",
        alt: "Frequency response of an ideal band-pass filter",
        caption: "Figure 1: Frequency response of an ideal band-pass filter",
      },
      {
        type: "p",
        text: "A passive band-pass filter constructed using only resistors and capacitors attenuates the signal within the passband as well as outside it, resulting in a voltage gain of less than unity. An active band-pass filter incorporates an operational amplifier, which provides gain within the passband and allows the overall voltage gain to be set to a value greater than unity. The operational amplifier also provides a low output impedance, isolating the filter from the load and preventing the load from affecting the frequency response.",
      },
      {
        type: "image",
        src: "/images/blog/audio-amplifier/Figure2_BPF_Circuit.png",
        alt: "Active band-pass filter circuit",
        caption: "Figure 2: Active band-pass filter circuit",
      },
      {
        type: "image",
        src: "/images/blog/audio-amplifier/Figure3_PassiveVsActive.png",
        alt: "Comparison of passive and active band-pass filter frequency responses",
        caption: "Figure 3: Comparison of passive and active band-pass filter frequency responses",
      },
      {
        type: "h3",
        text: "2.3 The TL071 Operational Amplifier",
      },
      {
        type: "p",
        text: "The TL071 is a general-purpose JFET-input operational amplifier. The JFET input stage provides a high input impedance and an extremely low input bias current, minimising the loading effect on preceding signal sources. The device is unity-gain stable and has a gain-bandwidth product of approximately 3 MHz and a slew rate of 13 V/us. The low input noise of 18 nV/sqrt(Hz) and total harmonic distortion of 0.003% are important parameters for high-fidelity audio reproduction. The TL071 operates from a supply voltage range of +/-2.25 V to +/-18 V, making it suitable for both dual-supply and single-supply configurations.",
      },
      {
        type: "image",
        src: "/images/blog/audio-amplifier/TL071_pinout_diagram.png",
        alt: "Pin configuration of the TL071 operational amplifier",
        caption: "Figure 4: Pin configuration of the TL071 operational amplifier",
      },
      {
        type: "h3",
        text: "2.4 The TL071 as an Inverting Summing Active Band-Pass Filter",
      },
      {
        type: "p",
        text: "The TL071 may be configured as an inverting summing amplifier by connecting multiple input signals to the inverting input terminal through separate input resistors of equal value. In this configuration, the output voltage is proportional to the inverted sum of all input signals, weighted by the ratio of the feedback resistance to the respective input resistance. This property is used in the present design to combine the left and right channels of a stereo audio signal into a single mono signal.",
      },
      {
        type: "h3",
        text: "2.5 The OPA551 Operational Amplifier",
      },
      {
        type: "p",
        text: "The OPA551 is a high-voltage, high-current operational amplifier designed for applications requiring large output current capability. It can supply a continuous output current of up to +/-200 mA, making it suitable for directly driving low-impedance loads such as loudspeakers without an additional discrete output stage. The OPA551 has a gain-bandwidth product of 3 MHz and a slew rate of +/-15 V/us. The device is unity-gain stable and operates from a supply voltage range of +/-4 V to +/-30 V.",
      },
      {
        type: "image",
        src: "/images/blog/audio-amplifier/OPA551_pinout_diagram.png",
        alt: "Pin configuration of the OPA551 operational amplifier",
        caption: "Figure 5: Pin configuration of the OPA551 operational amplifier",
      },
      {
        type: "h3",
        text: "2.6 Two-Stage Amplifier Architecture",
      },
      {
        type: "p",
        text: "The two-stage architecture arises from the differing electrical characteristics of the TL071 and OPA551. The TL071 is well suited to filtering and gain setting due to its low noise and JFET input stage, but its output current capability is limited to approximately +/-10 mA. This is insufficient to drive an 8 ohm loudspeaker at the required output voltage. The OPA551 addresses this limitation with an output current capability of up to +/-200 mA. By combining the TL071 as the signal processing stage with the OPA551 as the current amplification stage, the design exploits the complementary strengths of both devices.",
      },
      {
        type: "h2",
        text: "3. Design",
      },
      {
        type: "h3",
        text: "3.1 Technical Specifications",
      },
      {
        type: "ul",
        items: [
          "Input: 0.872 Vpp (iPhone 14 Pro Max, volume step 15 of 16 at 440 Hz)",
          "Supply voltage: 9 V PP3 battery or 12 V DC adapter",
          "Lower cut-off frequency: 6.63 Hz (target 5 Hz, limited by stock capacitor C2 = 1 uF)",
          "Upper cut-off frequency: 28.54 kHz (target 29 kHz, limited by stock capacitor C1 = 68 pF)",
          "Measured gain: 10.67 dB (3.42 V/V), R1 = 82 kOhm, R2 = 24 kOhm",
          "Target output voltage: 3 Vpp across 8 ohm speaker load",
          "Output power: 281 mW",
          "Key ICs: TL071CP (Stage 1 active filter) and OPA551PA (Stage 2 unity-gain buffer)",
          "PCB dimensions: 65 mm x 40 mm, two-layer design in Proteus",
        ],
      },
      {
        type: "h3",
        text: "3.2 System Overview",
      },
      {
        type: "p",
        text: "The system accepts a stereo audio input from a 3.5 mm jack socket connected to an iPhone 14 Pro Max and produces a mono amplified output for an 8 ohm speaker. Power is supplied via either a 9 V PP3 battery or a 12 V DC power adapter, passing through an on/off slide switch and a green power indicator LED before being distributed to both amplifier stages.",
      },
      {
        type: "image",
        src: "/images/blog/audio-amplifier/Main-AudioAmp-Block-Diagram.png",
        alt: "Top-level block diagram of the two-stage audio amplifier system",
        caption: "Figure 6: Top-level block diagram of the two-stage audio amplifier system",
      },
      {
        type: "h3",
        text: "3.3 Design Calculations",
      },
      {
        type: "p",
        text: "The iPhone 14 Pro Max was characterised by measuring the output voltage at 440 Hz across all 16 volume steps. A frequency of 440 Hz was selected as it corresponds to the international standard musical pitch A4, providing a consistent and reproducible test signal. The design input level was selected at 70% of the maximum measured output of 1.224 Vpp, giving a target of 0.857 Vpp. Volume step 15 of 16 produced an output of 0.872 Vpp, representing an error of 1.77% from the 70% target.",
      },
      {
        type: "image",
        src: "/images/blog/audio-amplifier/phone-characterisation-graph.png",
        alt: "iPhone 14 Pro Max output voltage versus volume step at 440 Hz",
        caption: "Figure 7: iPhone 14 Pro Max output voltage versus volume step at 440 Hz",
      },
      {
        type: "p",
        text: "The required voltage gain was calculated as Av = Vout / Vin = 3 / 0.872 = 3.44 V/V, equivalent to 20 x log10(3.44) = 10.73 dB. The feedback resistor R1 was given as a fixed value of 82 kOhm. The required input resistor R2 was calculated as R2 = R1 / Av = 82000 / 3.44 = 23.84 kOhm. The nearest preferred stock value of 24 kOhm was selected, giving an actual gain of R1/R2 = 82000/24000 = 3.42 V/V = 10.67 dB.",
      },
      {
        type: "p",
        text: "The lower cut-off frequency fL was given as 5 Hz. The required capacitance C2 = 1 / (2pi x R2 x fL) = 1.326 uF, rounded to 1 uF stock value, giving fL(actual) = 6.63 Hz. The upper cut-off frequency fH was selected as 29 kHz. C1 = 1 / (2pi x R1 x fH) = 66.93 pF, rounded to 68 pF stock value, giving fH(actual) = 28,542 Hz.",
      },
      {
        type: "h3",
        text: "3.4 PCB Design",
      },
      {
        type: "p",
        text: "The printed circuit board was designed in [Proteus](https://www.labcenter.com) PCB Layout with overall dimensions of 65 mm x 40 mm. Component placement followed the principle of signal flow from left to right, with the audio input jack socket J1 on the left edge, the power supply terminal block on the top right edge and the speaker output on the bottom right edge. Signal tracks were routed at 0.762 mm and power supply tracks at 1.016 mm. A copper pour was applied to the bottom layer to form a continuous ground plane, reducing ground return impedance and improving electromagnetic compatibility.",
      },
      {
        type: "image",
        src: "/images/blog/audio-amplifier/Figure10_PCB_Top.png",
        alt: "PCB top layer showing component placement and silk screen",
        caption: "Figure 10: PCB top layer showing component placement and silk screen",
      },
      {
        type: "image",
        src: "/images/blog/audio-amplifier/Figure11_PCB_Bottom.png",
        alt: "PCB bottom layer showing copper track routing and ground plane",
        caption: "Figure 11: PCB bottom layer showing copper track routing and ground plane",
      },
      {
        type: "image",
        src: "/images/blog/audio-amplifier/Figure12_3D_Model.png",
        alt: "Three-dimensional model of the PCB generated in Proteus 3D Visualiser",
        caption: "Figure 12: Three-dimensional model of the PCB generated in Proteus 3D Visualiser",
      },
      {
        type: "h2",
        text: "4. Results",
      },
      {
        type: "h3",
        text: "4.1 Breadboard Prototype Testing",
      },
      {
        type: "p",
        text: "The frequency response of the first amplifier stage was measured on breadboard with a dual +/-9 V power supply. The simulated and measured midband gain at 440 Hz were both 10.67 dB, demonstrating exact agreement. The measured lower cut-off frequency was approximately 7.2 Hz and the upper was approximately 26.0 kHz, both in close agreement with calculated values. Small discrepancies are attributable to component tolerances.",
      },
      {
        type: "image",
        src: "/images/blog/audio-amplifier/Figure13_DualSupply_Breadboard.png",
        alt: "Simulated and measured frequency response of Stage 1 on breadboard with dual supply",
        caption: "Figure 13: Simulated and measured frequency response of Stage 1 on breadboard with dual +/-9 V supply",
      },
      {
        type: "image",
        src: "/images/blog/audio-amplifier/Figure14_SingleSupply_Breadboard.png",
        alt: "Simulated and measured frequency response of the complete amplifier on breadboard with single 9 V supply",
        caption: "Figure 14: Simulated and measured frequency response of the complete amplifier on breadboard with single 9 V supply",
      },
      {
        type: "h3",
        text: "4.2 PCB Testing",
      },
      {
        type: "p",
        text: "The PCB was tested in stages. Prior to fitting any integrated circuits, a multimeter confirmed that the virtual ground bias voltage of approximately 4.5 V was present at pin 3 of U1. A full frequency sweep from 1 Hz to 100 kHz was performed at each stage. All measured values agreed with calculated and simulated results within acceptable tolerance.",
      },
      {
        type: "image",
        src: "/images/blog/audio-amplifier/Figure15_PCB_FreqResponse.png",
        alt: "Simulated and measured frequency response of the complete two-stage amplifier on the PCB",
        caption: "Figure 15: Simulated and measured frequency response of the complete two-stage amplifier on the PCB",
      },
      {
        type: "p",
        text: "Time-domain testing at 440 Hz: Stage 1 output was 3.000 Vpp for a 868 mVpp input (gain 10.77 dB). Stage 2 output was 2.980 Vpp for a 872 mVpp input (gain 10.67 dB), in exact agreement with the calculated value. All waveforms were clean, undistorted sinusoids confirming linear operation throughout.",
      },
      {
        type: "image",
        src: "/images/blog/audio-amplifier/Figure16c_PCB_Stage1_440Hz.png",
        alt: "Stage 1 oscilloscope output at 440 Hz on PCB",
        caption: "Figure 16(c): CH1 868 mVpp input, CH2 3.000 Vpp Stage 1 output on PCB",
      },
      {
        type: "image",
        src: "/images/blog/audio-amplifier/Figure16d_PCB_Stage2_440Hz.png",
        alt: "Stage 2 oscilloscope output at 440 Hz on PCB",
        caption: "Figure 16(d): CH1 872 mVpp input, CH2 2.980 Vpp Stage 2 output on PCB",
      },
      {
        type: "h3",
        text: "4.3 Final Assembly",
      },
      {
        type: "p",
        text: "The completed PCB measures 65 mm x 40 mm with a purple solder mask finish, mounted onto a 3 mm acrylic baseplate using four M3 nylon standoffs. U1 and U2 are seated in DIP IC sockets to allow removal and replacement without desoldering. The completed assembly produced an audible 440 Hz tone from the speaker when driven from the iPhone 14 Pro Max at 70% of maximum volume, confirming that the mechanical and electrical assembly is functional.",
      },
      {
        type: "image",
        src: "/images/blog/audio-amplifier/Figure17a_PCB_TopView.jpg",
        alt: "PCB top view with all components soldered",
        caption: "Figure 17(a): Top view with all components soldered",
      },
      {
        type: "image",
        src: "/images/blog/audio-amplifier/Figure17b_PCB_WithSpeaker.jpg",
        alt: "Complete system connected to the 8 ohm speaker",
        caption: "Figure 17(b): Complete system connected to the 8 ohm speaker",
      },
      {
        type: "image",
        src: "/images/blog/audio-amplifier/Figure17c_PCB_Angled.jpg",
        alt: "Angled view with LED D1 illuminated",
        caption: "Figure 17(c): Angled view with LED D1 illuminated",
      },
      {
        type: "image",
        src: "/images/blog/audio-amplifier/Figure17d_PCB_Underside.jpg",
        alt: "Underside showing M3 nylon standoffs and acrylic baseplate",
        caption: "Figure 17(d): Underside showing M3 nylon standoffs and acrylic baseplate",
      },
      {
        type: "h3",
        text: "4.4 Evaluation and Conclusions",
      },
      {
        type: "p",
        text: "The design met all key performance targets across simulation and hardware testing. The voltage gain was consistent throughout, measuring approximately 10.67 dB on PCB Stage 2, within 0.14 dB of the calculated value. The 3 Vpp output target was met, with Stage 2 delivering 2.980 Vpp at 440 Hz, agreeing to within 0.67% of the design target.",
      },
      {
        type: "p",
        text: "Possible improvements for future iterations include replacing the screw terminal power input with a dedicated DC barrel jack, designing a dedicated enclosure with a speaker grille, applying conformal coating for moisture resistance and replacing the 3.5 mm jack input with a Bluetooth audio receiver module.",
      },
      {
        type: "h2",
        text: "5. Full Circuit Schematic",
      },
      {
        type: "image",
        src: "/images/blog/audio-amplifier/schematic.png",
        alt: "Full circuit schematic of the two-stage audio amplifier exported from Proteus",
        caption: "Figure 18: Full circuit schematic of the two-stage audio amplifier exported from Proteus",
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "ol-links",
        items: [
          { text: "Texas Instruments, TL071 JFET-Input Operational Amplifiers, SLOS080L, 2014.", url: "https://www.ti.com/lit/ds/symlink/tl071.pdf" },
          { text: "Texas Instruments, OPA551 High-Voltage High-Current Operational Amplifier, SBOS100A, 2004.", url: "https://www.ti.com/lit/ds/symlink/opa551.pdf" },
          { text: "N. Storey, Electronics: A Systems Approach, 6th ed. Harlow: Pearson, 2017.", url: "https://www.pearson.com/en-gb/subject-catalog/p/electronics-a-systems-approach/P200000004958" },
          { text: "P. Horowitz and W. Hill, The Art of Electronics, 3rd ed. Cambridge University Press, 2015.", url: "https://www.amazon.co.uk/Art-Electronics-Paul-Horowitz/dp/0521809266" },
          { text: "P. Scherz and S. Monk, Practical Electronics for Inventors, 4th ed. McGraw-Hill, 2016.", url: "https://www.amazon.co.uk/Practical-Electronics-Inventors-Fourth-Scherz/dp/1259587541" },
          { text: "H. Zumbahlen, Ed., Linear Circuit Design Handbook. Newnes/Elsevier, 2008.", url: "https://www.analog.com/en/resources/technical-books/linear-circuit-design-handbook.html" },
          { text: "Texas Instruments, Handbook of Operational Amplifier Applications, SBOA092B, 2016.", url: "https://www.ti.com/lit/an/sboa092b/sboa092b.pdf" },
          { text: "Texas Instruments, A Single-Supply Op-Amp Circuit Collection, SLOA058, 2000.", url: "https://www.ti.com/lit/an/sloa058/sloa058.pdf" },
          { text: "R. Mancini, Ed., Op Amps for Everyone, SLOD006B, Texas Instruments, 2002.", url: "https://www.ti.com/lit/an/slod006b/slod006b.pdf" },
          { text: "Texas Instruments, Audio Amplifier Design, SLOA030, 1999.", url: "https://www.ti.com/lit/an/sloa030/sloa030.pdf" },
          { text: "O. Bishop, Electronics, 3rd ed. Newnes/Elsevier, 2003." },
          { text: "K. Brindley, Starting Electronics, 4th ed. Newnes/Elsevier, 2011." },
          { text: "J. O. Bird, Engineering Mathematics, 8th ed. Routledge, 2021." },
        ],
      },
    ],
  },

  // ── AVR BARE METAL ────────────────────────────────────────────────────────────
  {
    slug: "avr-bare-metal-atmega644p",
    title: "Bare Metal AVR: Building a Nine-Mode State Machine Without Any Framework",
    date: "2026-04-01",
    type: "blog",
    projectSlug: "avr-zac",
    cover_image: "https://images.unsplash.com/photo-1562408590-e32931084e23?w=1200&auto=format&fit=crop&q=80",
    description:
      "How I built a nine-mode state machine on an ATmega644P from scratch using bare metal C, writing directly to hardware registers with no framework, no HAL and no shortcuts. Still ongoing.",
    tags: ["Embedded", "AVR", "C", "Microcontroller", "Aston"],
    readingTime: 8,
    published: true,
    content: [
      {
        type: "p",
        text: "Bare-metal programming means writing code that runs directly on the microcontroller hardware with no operating system between your code and the chip. Every register access, every timing decision and every peripheral configuration is yours to write explicitly. Most embedded tutorials hide this behind a framework.",
      },
      {
        type: "p",
        text: "Arduino, HAL and CubeMX abstract away the hardware so you can get an LED blinking in five minutes without understanding a single register. That is fine for prototyping. It is not fine for learning. This project was a deliberate choice to do the opposite: write directly to hardware registers on an ATmega644P microcontroller with no library in between. To understand not just what the code does but what the silicon does when the code runs. The full source is in the [avr-zac](https://github.com/zaccesss/avr-zac) repository.",
      },
      {
        type: "h2",
        text: "The Hardware",
      },
      {
        type: "image",
        src: "/images/atmelavr.png",
        alt: "ATmega AVR microcontroller",
        caption: "The AVR architecture - the foundation of the ATmega644P used in this project",
      },
      {
        type: "p",
        text: "The ATmega644P is a DIP-40 AVR microcontroller running at 20 MHz on an external crystal. The PCB was designed by Richard Reeves, a lab technician at Aston University, who also provided components and guidance throughout this project. The board includes an LM317T voltage regulator and ten-way headers breaking out all 32 I/O pins. A Pololu USB AVR Programmer v2.1 handles flashing via STK500v2.",
      },
      {
        type: "p",
        text: "The breadboard components used for testing were: five LEDs, one button and one active buzzer. These changed between sessions as I progressed through the project.",
      },
      {
        type: "h2",
        text: "Why Bare Metal?",
      },
      {
        type: "p",
        text: "When you use Arduino or a HAL, the framework handles the register configuration for you. You call digitalWrite() and the library writes to the correct DDRx and PORTx registers on your behalf. This is convenient but it means you never actually learn what those registers do or why. When something breaks you have no mental model to debug from.",
      },
      {
        type: "p",
        text: "Bare metal forces you to read the datasheet. Every single thing the microcontroller can do is described in the ATmega644P datasheet. You learn to navigate it. You learn that DDRB controls the data direction of Port B, that setting a bit high makes that pin an output and that PORTB controls the output state. That knowledge transfers to any microcontroller you ever touch.",
      },
      {
        type: "h2",
        text: "The Project Progression",
      },
      {
        type: "p",
        text: "I worked through a structured set of learning projects before building the final state machine:",
      },
      {
        type: "ol",
        items: [
          "Fuse configuration and restoration reference",
          "Double blink on PB0 using DDRB, PORTB and _delay_ms",
          "Five LEDs cycling sequentially using bit shifting",
          "Button driving a buzzer via polling using PIND",
          "Button driving a buzzer via interrupt using ISR, EICRA and EIMSK",
          "Four-mode state machine using enum, ISR and software debounce",
          "Nine-mode state machine: the final build",
        ],
      },
      {
        type: "h2",
        text: "The Nine-Mode State Machine",
      },
      {
        type: "p",
        text: "The final project is a state machine that cycles through nine modes on each button press. The mode state is held in a volatile variable updated inside an INT0 interrupt service routine with software debounce.",
      },
      {
        type: "ul",
        items: [
          "Mode 0 - Chase: LEDs light one by one in sequence",
          "Mode 1 - Blink All: all five LEDs blink together",
          "Mode 2 - Alternate: odd and even LEDs alternate",
          "Mode 3 - PWM Fade: all LEDs fade in and out via software PWM",
          "Mode 4 - Knight Rider: single LED sweeps left to right and back",
          "Mode 5 - Binary Counter: LEDs count 0 to 31 in binary",
          "Mode 6 - Random: LEDs display random patterns seeded by ADC noise",
          "Mode 7 - Reaction Game: press button when green LED lights to win",
          "Mode 8 - Tetris Melody: Tetris theme plays with LEDs synced to each note",
        ],
      },
      {
        type: "h2",
        text: "Key Concepts I Learned",
      },
      {
        type: "p",
        text: "Interrupt service routines: the ISR keyword in AVR-libc defines a function that executes when a specific interrupt fires. The INT0 interrupt fires on a button press edge. Without debounce the button would register multiple presses from a single physical press, so I implemented a software debounce delay inside the ISR.",
      },
      {
        type: "p",
        text: "Software PWM: hardware PWM uses the timer compare match output automatically. Software PWM manually toggles the pin in a tight loop using precise timing. It is less efficient but teaches you exactly what PWM means at the signal level.",
      },
      {
        type: "p",
        text: "ADC noise as a random seed: the ATmega644P's ADC reading from an unconnected pin produces noise. This noise is unpredictable enough to seed a pseudo-random number generator, which I used for the random LED mode.",
      },
      {
        type: "p",
        text: "The Tetris melody mode was the most satisfying to build. Each note requires a specific frequency and duration. The buzzer is driven by toggling a pin at the required frequency using timer overflow interrupts. Getting the note timings right took several iterations of measuring against a reference.",
      },
      {
        type: "h2",
        text: "Key Hardware Concepts Learned",
      },
      {
        type: "p",
        text: "Software PWM: hardware PWM uses the timer compare match output to toggle a pin automatically. Software PWM manually toggles the pin in a tight timing loop. It works but ties up the CPU, blocking other operations. For the PWM fade mode this meant the button interrupt still fires (interrupts preempt the main loop) but the timing-sensitive parts of the fade had to be handled carefully. Understanding this limitation pushed me to read the timer chapter of the datasheet properly.",
      },
      {
        type: "p",
        text: "ADC noise as a random seed: a floating (unconnected) ADC input picks up electrical noise from the environment. This noise is unpredictable enough to serve as a seed for a pseudo-random number generator. In practice I read the ADC from an unused pin on startup, use the least significant bits as the seed for avr-libc's random() and get different random patterns every power cycle without needing an external RTC or EEPROM.",
      },
      {
        type: "code",
        lang: "c",
        text: `// Seed PRNG from ADC noise on floating pin
ADMUX = (1 << REFS0) | 0x07;  // AVcc ref, ADC7
ADCSRA = (1 << ADEN) | (1 << ADSC) | 0x07;
while (ADCSRA & (1 << ADSC));
srandom(ADC);`,
      },
      {
        type: "h2",
        text: "The Tetris Melody",
      },
      {
        type: "p",
        text: "The Tetris melody mode was the most satisfying to build. The Korobeiniki theme has 30 notes across two phrases. Each note requires a specific frequency and duration. The buzzer is driven by toggling a GPIO pin at the note frequency using timer overflow interrupts, with the LED pattern updating between notes to sync visually. Getting the note timings accurate required measuring against a reference recording and adjusting the tempo constant until it matched. The result is recognisable from several metres away.",
      },
      {
        type: "h2",
        text: "What I Would Do Differently",
      },
      {
        type: "p",
        text: "Hardware PWM from the start rather than software PWM for the fade modes. Hardware PWM offloads the timing entirely to the timer peripheral so the CPU is free for other work. I would also add UART serial output in session one rather than session six. Seeing register values and state transitions in a serial monitor would have accelerated debugging every session significantly.",
      },
      {
        type: "quote",
        text: "Reading the datasheet is not optional. It is the job.",
        source: "Something I understood about halfway through this project",
      },
      {
        type: "p",
        text: "Thanks to Richard Reeves for designing the PCB, providing components and offering guidance throughout this project.",
      },
      {
        type: "divider",
      },
      {
        type: "p",
        text: "This project is still ongoing. The nine-mode state machine documented here is the current milestone. Future sessions will add UART transmission, ADC reception and more advanced timing patterns. I will update this post as the project progresses.",
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "ol-links",
        items: [
          { text: "ATmega644P datasheet - Microchip Technology (the primary reference for all register configuration in this project)", url: "https://www.microchip.com/en-us/product/atmega644p" },
          { text: "avr-zac repository - full source code for the nine-mode state machine project", url: "https://github.com/zaccesss/avr-zac" },
          { text: "AVR-GCC documentation - compiler documentation for the AVR toolchain", url: "https://gcc.gnu.org/wiki/avr-gcc" },
          { text: "Wikipedia: AVR microcontrollers - architecture overview and history", url: "https://en.wikipedia.org/wiki/AVR_microcontrollers" },
          { text: "Microchip Studio - the official IDE for AVR and SAM microcontrollers (formerly Atmel Studio)", url: "https://www.microchip.com/en-us/tools-resources/develop/microchip-studio" },
          { text: "AVR-libc reference manual - standard C library for AVR devices", url: "https://www.nongnu.org/avr-libc/user-manual/index.html" },
        ],
      },
    ],
  },

  // ── NEOPIXEL LED CUBE ────────────────────────────────────────────────────────
  {
    slug: "neopixel-led-cube",
    title: "64 LEDs, One Cube: How I Built a 4x4x4 NeoPixel LED Cube with Adaptive Brightness",
    date: "2025-12-01",
    type: "blog",
    projectSlug: "led-cube",
    cover_image: "/images/projects/led-cube/final-setup.jpeg",
    description:
      "A walkthrough of building a 4x4x4 NeoPixel LED Cube with four animation modes and automatic brightness adjustment via an LDR sensor, using Arduino and bare C++.",
    tags: ["Arduino", "C++", "LED", "Hardware", "IoT"],
    readingTime: 6,
    published: true,
    content: [
      {
        type: "image",
        src: "/images/projects/led-cube/neopixel-main.jpg",
        alt: "4x4x4 NeoPixel LED Cube showing an active animation",
        caption: "The finished 4x4x4 NeoPixel LED Cube - 64 WS2812B LEDs hand-soldered into a matrix",
      },
      {
        type: "p",
        text: "A WS2812B is an addressable RGB LED: each one contains a tiny built-in controller chip that lets you set its colour independently using a single data wire. You chain them together and send a 24-bit colour value for each LED in sequence. The chip handles the rest.",
      },
      {
        type: "p",
        text: "The [NeoPixel LED Cube](/projects/led-cube) started as a university assignment and turned into something I am genuinely proud of. 64 individually addressable WS2812B LEDs, hand-soldered into a 4x4x4 matrix, controlled by an [Arduino](https://www.arduino.cc) Uno with adaptive brightness and physical button controls. No pre-made cube kit. Built from scratch.",
      },
      {
        type: "h2",
        text: "The Hardware",
      },
      {
        type: "p",
        text: "The cube uses 64 WS2812B LEDs arranged in four horizontal layers of 16 LEDs each. All 64 LEDs are chained on a single data line controlled by the Arduino Uno's digital output. The WS2812B is a self-contained RGB LED with an integrated driver chip, which means each LED only needs a single data wire in addition to power and ground. You send a 24-bit colour value for each LED in the chain and the chain self-propagates the data.",
      },
      {
        type: "ul",
        items: [
          "64 WS2812B addressable LEDs in a 4x4x4 layout",
          "Arduino Uno (ATmega328P)",
          "LDR (light-dependent resistor) for ambient brightness sensing",
          "Two physical buttons: power toggle and mode cycle",
          "5V DC power supply at 2A or above (required for full brightness)",
          "Adafruit NeoPixel library for LED control",
        ],
      },
      {
        type: "h2",
        text: "Power Budgeting",
      },
      {
        type: "p",
        text: "Power budgeting was one of the most important design decisions. Each WS2812B LED draws up to 60 mA at full white brightness. With 64 LEDs that is potentially 3.84 A. Running all LEDs at full white would require a substantial power supply and would generate significant heat. The solution was to cap brightness in software using the [Adafruit NeoPixel library](https://learn.adafruit.com/adafruit-neopixel-uberguide) and never display full white on all LEDs simultaneously. In practice the cube draws well under 2 A during normal operation.",
      },
      {
        type: "h2",
        text: "Animation Modes",
      },
      {
        type: "p",
        text: "The firmware implements four animation modes, cycled through using a physical button:",
      },
      {
        type: "ul",
        items: [
          "Colour Wipe: fills the cube LED by LED from bottom to top, cycling through colours",
          "Smooth RGB Fade: all 64 LEDs smoothly transition through the full RGB spectrum simultaneously",
          "Fire Effect: simulates a flame using randomised warm colours with upward propagation through the layers",
          "Rainbow Cycle: each LED is offset in the colour wheel so the whole cube displays a rolling rainbow pattern",
        ],
      },
      {
        type: "h2",
        text: "Adaptive Brightness with the LDR",
      },
      {
        type: "p",
        text: "The LDR reads ambient light via the Arduino's ADC on an analogue pin. The raw reading is mapped to a brightness value using Arduino's map() function. In bright environments the cube runs at higher brightness. In dim or dark environments it automatically reduces brightness to avoid being blinding. This runs in a non-blocking loop, sampling the LDR and updating the NeoPixel brightness value at regular intervals without interrupting the animation.",
      },
      {
        type: "h2",
        text: "Serial Diagnostics",
      },
      {
        type: "p",
        text: "The firmware outputs real-time debug information over serial at 9600 baud: current animation mode, current brightness value and LDR reading. This was invaluable during development and makes it straightforward to verify the brightness scaling is working as expected.",
      },
      {
        type: "h2",
        text: "The Fire Effect Algorithm",
      },
      {
        type: "p",
        text: "The fire effect was the most technically interesting animation to implement. It uses a two-dimensional heat array representing temperature at each LED position. Each frame, heat propagates upward with random variation and decays at a configurable rate. The heat value maps to a colour: deep red at low heat, orange in the mid range, bright yellow-white at maximum. The result is a convincing upward flame despite the algorithm being under 30 lines of C++.",
      },
      {
        type: "code",
        lang: "cpp",
        text: `// Heat propagation - simplified
for (int layer = LAYERS - 1; layer > 0; layer--) {
  for (int i = 0; i < LEDS_PER_LAYER; i++) {
    heat[layer][i] = (heat[layer-1][i]
      + heat[layer-1][(i+1) % LEDS_PER_LAYER]
      + heat[layer-1][(i-1+LEDS_PER_LAYER) % LEDS_PER_LAYER]) / 3;
    heat[layer][i] = max(0, heat[layer][i] - random(0, COOLING));
  }
}`,
      },
      {
        type: "h2",
        text: "Power Budget",
      },
      {
        type: "p",
        text: "Power budgeting was critical. Each WS2812B draws up to 60mA at full white. 64 LEDs at full brightness would draw 3.84A, far more than a USB port can supply and enough to cause visible flickering and colour shift. The solution was to cap brightness in software using the Adafruit NeoPixel setBrightness() function and to never run all LEDs at full white simultaneously. In practice during normal operation the cube draws well under 2A at 5V.",
      },
      {
        type: "p",
        text: "A 1000uF electrolytic capacitor across the 5V power rail is essential. Without it, the sudden current draw when LEDs switch state causes voltage spikes that can corrupt the WS2812B data line and produce random colour flashes. This is one of those details that is not in beginner tutorials but matters the moment you scale past a handful of LEDs.",
      },
      {
        type: "h2",
        text: "What I Learned",
      },
      {
        type: "p",
        text: "Hand-soldering 64 LEDs into a 3D matrix is significantly harder than it looks. The physical construction took more time than the firmware. The main lessons: use flux, keep your iron tip clean and solder each joint fully before moving to the next. Cold joints on LEDs in the middle of the chain are very difficult to diagnose because the entire section after the fault goes dark. Testing each layer with continuity checks before stacking them saved significant rework time.",
      },
      {
        type: "p",
        text: "The WS2812B protocol is unforgiving of timing. The data signal uses specific high and low pulse widths measured in hundreds of nanoseconds. On an Arduino running at 16MHz this works reliably, but any interrupt that disrupts the timing mid-frame corrupts the entire frame. Disabling interrupts during LED updates was necessary for stable output.",
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "ol-links",
        items: [
          { text: "WS2812B datasheet - LED and driver integrated light source (WorldSemi)", url: "https://cdn-shop.adafruit.com/datasheets/WS2812B.pdf" },
          { text: "Adafruit NeoPixel Uberguide - comprehensive guide to wiring, power and programming NeoPixels", url: "https://learn.adafruit.com/adafruit-neopixel-uberguide" },
          { text: "Arduino Reference - language and library documentation", url: "https://www.arduino.cc/reference/en/" },
          { text: "Wikipedia: LED cube - background on LED matrix displays", url: "https://en.wikipedia.org/wiki/LED_cube" },
          { text: "NeoPixel LED Cube - project page on this site", url: "/projects/led-cube" },
          { text: "Adafruit NeoPixel library - GitHub repository and API reference", url: "https://github.com/adafruit/Adafruit_NeoPixel" },
        ],
      },
    ],
  },

  // ── PHAEMOS ───────────────────────────────────────────────────────────────────
  {
    slug: "phaemos-predictive-maintenance",
    title: "Phaemos: Building a Predictive Maintenance Platform from Firmware to Dashboard",
    date: "2026-05-14",
    type: "blog",
    projectSlug: "phaemos",
    cover_image: "/images/projects/phaemos/main.svg",
    description:
      "How I am building Phaemos - a full-stack predictive maintenance platform with four hardware nodes (ESP32, STM32 Black Pill, Arduino Nano, Raspberry Pi Pico 2W), 11 sensors, a FastAPI backend, Isolation Forest ML and a live Next.js dashboard.",
    tags: ["FastAPI", "Next.js", "ESP32", "STM32", "ML", "IoT", "Python", "MicroPython"],
    readingTime: 10,
    published: true,
    content: [
      {
        type: "p",
        text: "[Phaemos](/projects/phaemos) is a smart maintenance platform I am actively building. The name comes from Ancient Greek roots meaning an ordered system that reveals. The tagline is: reveal before failure. That is exactly what it does: collects real-time sensor data from hardware nodes, scores every reading with a machine learning model and raises alerts before a fault becomes visible to the naked eye.",
      },
      {
        type: "h2",
        text: "Why Predictive Maintenance?",
      },
      {
        type: "p",
        text: "Industrial equipment fails. The question is whether you find out before or after it does. Reactive maintenance waits for failure then repairs. Preventive maintenance follows a fixed schedule, replacing parts whether or not they actually need replacing. Predictive maintenance uses real sensor data to intervene only when the data suggests something is genuinely wrong.",
      },
      {
        type: "p",
        text: "The third approach is more efficient, less expensive and far more interesting to build. It requires sensors, connectivity, a reliable data pipeline, a machine learning model and a usable interface for the people who act on the alerts. Phaemos is all of that.",
      },
      {
        type: "h2",
        text: "Hardware Layer",
      },
      {
        type: "p",
        text: "The updated hardware architecture uses four nodes. The ESP32 is the primary IoT gateway, consolidating 11 sensors over I2C and analogue inputs and POSTing consolidated JSON telemetry to the backend every 5 seconds. The sensors include BME280 (temperature, humidity, pressure), MPU6050 (vibration and acceleration), INA219 (current and voltage monitoring), MLX90614 (contactless IR surface temperature), VL53L0X (distance), MQ-2 (gas and smoke detection), AS5600 (shaft RPM via magnetic encoding), DS18B20 (contact temperature), MAX4466 (microphone/acoustic level), LDR (ambient light) and FC-28 (water ingress detection). Output components on the ESP32 include a SSD1306 OLED, WS2812B RGB LED strip, passive buzzer and a 4-channel relay module for triggering external actuators.",
      },
      {
        type: "p",
        text: "The STM32 Black Pill F411CEU6 is the vibration specialist node. It samples an MPU6050 at 100Hz over I2C in bare HAL C, accumulates one second of acceleration data, runs a short-window FFT and transmits the peak vibration frequency and magnitude over UART to the ESP32. Rather than sending raw acceleration values, the single peak frequency gives the ML model a far richer vibration signal - bearing wear, imbalance and cavitation produce characteristic resonant frequencies that raw acceleration cannot distinguish.",
      },
      {
        type: "p",
        text: "The Arduino Nano is the secondary sensor node. It reads a BME280, LDR and FC-28 moisture sensor and relays formatted CSV strings to the ESP32 over serial every 2 seconds. The Raspberry Pi Pico 2W is the ambient node, running MicroPython. It reads a BME280 and LDR, displays locally on a SSD1306 OLED and POSTs its own telemetry payload to the API independently over Wi-Fi, operating completely standalone from the ESP32.",
      },
      {
        type: "h2",
        text: "Backend: FastAPI and PostgreSQL",
      },
      {
        type: "p",
        text: "The backend is a [FastAPI](https://fastapi.tiangolo.com) application in Python 3.11, backed by PostgreSQL 15 and Redis. On every incoming telemetry POST it: validates the device API key, stores the reading, evaluates all alert rules for that device, scores the reading through the ML model, updates the device status and last-seen timestamp and returns a 200 response. The target is under 200ms end to end.",
      },
      {
        type: "p",
        text: "Every significant action writes to an immutable audit log: who triggered it, when, what changed. The API uses JWT authentication with bcrypt password hashing and three role levels: admin (full access), technician (can create and update tickets) and viewer (read only). Role enforcement happens at both the API route level and the frontend route level so neither side trusts the other alone.",
      },
      {
        type: "h2",
        text: "The ML Pipeline: Isolation Forest",
      },
      {
        type: "p",
        text: "The anomaly detection model is a scikit-learn Isolation Forest. It is unsupervised: it needs no labelled fault data to train. It learns the normal operating envelope from real baseline telemetry and scores each new reading from 0 to 1. Scores above 0.7 trigger an alert and auto-generate a maintenance ticket. Scores above 0.85 attach a diagnostic recommendation string to that ticket.",
      },
      {
        type: "p",
        text: "The feature vector for each reading includes raw sensor values, rolling means and standard deviations over the last 10 readings, total vibration magnitude and time-of-day encoding. The rolling statistics are critical: a single spike is noise, but a sustained drift in the rolling mean for temperature or vibration frequency is a genuine signal. Time-of-day encoding captures the fact that thermal behaviour differs significantly between startup, steady state and shutdown.",
      },
      {
        type: "h2",
        text: "Frontend: Next.js Live Dashboard",
      },
      {
        type: "p",
        text: "The Next.js frontend polls the API every 5 seconds and renders live Recharts line charts for each sensor metric. Anomalous readings are highlighted red on the chart in real time as they arrive. Device cards show current status (online, warning, fault, offline) with colour coding. The ticket system lets technicians acknowledge alerts, add notes, update status and close resolved issues. All views are role-gated at the UI level.",
      },
      {
        type: "h2",
        text: "Infrastructure and Security",
      },
      {
        type: "p",
        text: "The full stack runs with Docker Compose locally and deploys to [Vercel](https://vercel.com) (frontend) and Render (backend and database). The CHANGELOG tracks every version: what was added, what changed, what security issue was addressed. The most recent unreleased version added GitHub Actions CI (backend linting and frontend type-checking), gitleaks secret scanning, Dependabot for automated dependency updates and a biweekly workflow that opens a security issue automatically if npm audit reports production vulnerabilities.",
      },
      {
        type: "h2",
        text: "What Building This Taught Me",
      },
      {
        type: "p",
        text: "The interesting problems were all at the boundaries. Making the ESP32 reliably deliver data over Wi-Fi under noisy conditions. Ensuring the FastAPI ingest endpoint handled concurrent posts without dropping readings. Keeping the Next.js dashboard live without hammering the backend. Designing the feature vector so the Isolation Forest actually learned useful patterns rather than memorising noise.",
      },
      {
        type: "p",
        text: "Building a system that spans embedded firmware, a REST API, a machine learning pipeline and a production frontend taught me more than any single-layer project could. Each layer has its own failure modes and its own debugging tools. Getting them to work together reliably is a different class of problem from getting any one of them to work in isolation.",
      },
      {
        type: "quote",
        text: "The most expensive sensor is the one you did not install before the machine failed.",
        source: "Predictive maintenance principle",
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "ol-links",
        items: [
          { text: "Phaemos project page - full hardware and software overview", url: "/projects/phaemos" },
          { text: "FastAPI documentation - the Python framework powering the Phaemos backend", url: "https://fastapi.tiangolo.com" },
          { text: "scikit-learn: IsolationForest - API reference and algorithm details", url: "https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.IsolationForest.html" },
          { text: "MQTT specification - the messaging protocol designed for IoT sensor networks", url: "https://mqtt.org/mqtt-specification/" },
          { text: "Wikipedia: Predictive maintenance - background, methods and industry applications", url: "https://en.wikipedia.org/wiki/Predictive_maintenance" },
          { text: "FreeRTOS - the RTOS kernel used on the STM32 vibration node", url: "https://www.freertos.org" },
          { text: "Wikipedia: Isolation forest - explanation of the anomaly detection algorithm", url: "https://en.wikipedia.org/wiki/Isolation_forest" },
        ],
      },
    ],
  },

  // ── GIT-UNLOCKED ─────────────────────────────────────────────────────────────
  {
    slug: "git-unlocked-open-source-course",
    title: "Why I Built a Free Git Course with 217 Files and No Paywall",
    date: "2026-04-21",
    type: "blog",
    projectSlug: "git-unlocked",
    cover_image: "/images/projects/git-unlocked/octocat-laptop.jpg",
    description:
      "The motivation behind git-unlocked, an open-source Git and version control course spanning 12 sections and every major platform, and what writing 217 files taught me about technical communication.",
    tags: ["Git", "Open Source", "Teaching", "GitHub"],
    readingTime: 6,
    published: true,
    content: [
      {
        type: "p",
        text: "Git is one of the most important tools in software development. It is also one of the most poorly taught. Most tutorials cover git init, git add, git commit and git push, then stop. They leave out branches, rebasing, conflict resolution, platform differences, real-world workflows and everything else that actually matters when you join a team or contribute to open source.",
      },
      {
        type: "p",
        text: "[git-unlocked](https://github.com/zaccesss/git-unlocked) is my attempt to fix that. It is a free, open-source Git and version control course covering everything from absolute zero to professional-level knowledge. 217 files. 12 sections. MIT licensed. No paywall.",
      },
      {
        type: "h2",
        text: "What the Course Covers",
      },
      {
        type: "ul",
        items: [
          "Section 01: Introduction - concepts, setup and how to navigate the course",
          "Section 02: Git - everything from git init to internals (29 files)",
          "Section 03: GitHub - full platform coverage (28 files)",
          "Section 04: GitLab - full platform coverage (16 files)",
          "Section 05: Other platforms - Bitbucket, Azure DevOps, Gitea, Forgejo and Codeberg (62 files)",
          "Section 06: IDEs and editors - VS Code, JetBrains, Neovim, Cursor and Zed",
          "Section 07: Terminal - shell setup, lazygit, delta, fzf and more",
          "Section 08: Real world - open source contribution, GitOps, monorepos and disaster recovery",
          "Section 09: Reference - cheatsheet, glossary, common mistakes and security",
          "Section 10: Resources - 120+ curated books, videos, tools and communities",
          "Section 11: First contribution - make your first open source pull request here",
        ],
      },
      {
        type: "p",
        text: "Every file covers Windows, Mac and Linux side by side. Nothing is assumed. Nothing is skipped.",
      },
      {
        type: "h2",
        text: "Why I Built It",
      },
      {
        type: "p",
        text: "I was frustrated with existing resources. Most are either too shallow or paywalled or platform-specific. I wanted something that a complete beginner could start from the beginning and an experienced developer could jump into at any section. I also wanted something that covered all the platforms people actually use, not just GitHub.",
      },
      {
        type: "p",
        text: "Teaching is also one of the best ways to learn. Writing 217 files about Git forced me to understand everything at a depth I would not have reached by just using it. When you write a glossary definition for every Git term you realise quickly which concepts you only half understand.",
      },
      {
        type: "h2",
        text: "What the CHANGELOG Shows",
      },
      {
        type: "p",
        text: "The CHANGELOG is one of the things I am most proud of in this project. Every version documents what was added, what was updated and what was fixed. Version 1.2.0 added the entire real-world section covering GitOps with ArgoCD and Flux, monorepo patterns using Nx and Turborepo, disaster recovery from force push accidents and a security reference covering gitleaks and supply chain attacks.",
      },
      {
        type: "p",
        text: "Reading the changelog from v0.1.0 to v1.2.0 tells the story of how a course outline became a comprehensive reference. It also shows that good documentation is not written once. It is maintained.",
      },
      {
        type: "h2",
        text: "What Is Still to Come",
      },
      {
        type: "ul",
        items: [
          "A GitHub Pages site at [zaccesss.github.io/git-unlocked](https://zaccesss.github.io/git-unlocked)",
          "Interactive HTML quiz pages with instant answer checking",
          "Animated SVG diagrams for key Git concepts",
          "Accessibility review",
        ],
      },
      {
        type: "quote",
        text: "If you understand Git, you understand collaboration. That is worth teaching properly.",
        source: "My reason for starting this project",
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "ol-links",
        items: [
          { text: "git-unlocked repository - the full course, MIT licensed and free", url: "https://github.com/zaccesss/git-unlocked" },
          { text: "GitHub Docs - official documentation for GitHub features, workflows and CLI", url: "https://docs.github.com" },
          { text: "Pro Git - Scott Chacon and Ben Straub (free online) - the most complete Git reference available", url: "https://git-scm.com/book/en/v2" },
          { text: "Open Source Guides - how to contribute to and maintain open source projects", url: "https://opensource.guide" },
          { text: "Conventional Commits specification - a lightweight commit message convention for structured changelogs", url: "https://www.conventionalcommits.org" },
        ],
      },
    ],
  },

  // ── BRITISH AIRWAYS ENGINEERING ───────────────────────────────────────────────
  {
    slug: "british-airways-engineering-simulation",
    title: "Inside British Airways Engineering: What a Maintenance Simulation Taught Me",
    date: "2025-10-01",
    type: "journal",
    cover_image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&auto=format&fit=crop&q=80",
    description:
      "Reflections on the British Airways Engineering Virtual Experience on Forage, covering A320 maintenance planning, C-check operations and what aviation engineering looks like from the inside.",
    tags: ["British Airways", "Aviation", "Engineering", "Maintenance", "Career"],
    readingTime: 5,
    published: true,
    content: [
      {
        type: "p",
        text: "In October 2025 I completed the [British Airways](https://www.britishairways.com) Engineering Virtual Experience on [Forage](https://www.theforage.com). It was a structured simulation of real maintenance and supply-chain operations, and it gave me a genuinely different perspective on what engineering looks like at scale.",
      },
      {
        type: "h2",
        text: "What the Programme Involved",
      },
      {
        type: "p",
        text: "The simulation was built around Airbus A320 aircraft maintenance. The A320 is one of the most common commercial aircraft in the world and British Airways operates a significant fleet. The programme asked participants to think like an engineering operations planner: analyse maintenance schedules, forecast material requirements and identify risk factors.",
      },
      {
        type: "ul",
        items: [
          "Analysed A320 maintenance schedules and identified components approaching their service limits",
          "Built a Material Forecast and Planning Report covering six A320 aircraft",
          "Diagnosed component faults and produced professional Work Request (WREQ) reports",
          "Proposed risk-mitigation strategies for long-lead parts using data-driven forecasting",
          "Applied EASA and CAA compliance requirements to maintenance planning decisions",
          "Integrated sustainable solutions including recycled components and consolidated logistics",
        ],
      },
      {
        type: "h2",
        text: "What a C-Check Is",
      },
      {
        type: "p",
        text: "Commercial aircraft undergo structured maintenance checks at increasing intervals and depth. A C-check is a heavy maintenance visit, typically occurring every 18 to 24 months depending on the operator's programme. The aircraft is partially disassembled, systems are inspected in detail and many components are replaced on a schedule rather than waiting for failure. The planning for a C-check is complex because many parts have long lead times and a delay in a single component can ground the aircraft beyond its planned return-to-service date.",
      },
      {
        type: "p",
        text: "The WREQ report was the most interesting part for me. A Work Request is the formal document that initiates a maintenance action. It needs to specify the fault, the required corrective action, the parts needed and the technical reference. Writing one properly requires understanding the systems involved and the regulatory framework governing the work.",
      },
      {
        type: "h2",
        text: "Material Forecasting Under Uncertainty",
      },
      {
        type: "p",
        text: "The most technically demanding part of the programme was building the Material Forecast and Planning Report across six A320 aircraft. Each aircraft has a different accumulated flight hours and cycles. Long-lead components like landing gear actuators or engine control units may have lead times of 6 to 18 months. If a component approaches its replacement limit and is not on order in time, the aircraft is grounded.",
      },
      {
        type: "p",
        text: "The exercise required identifying which components across all six aircraft were approaching limits within the C-check window, calculating the probability of a part arriving on time given historical lead times and proposing risk mitigation strategies: buffer stock for critical items, consolidated logistics to reduce costs and sustainable options like certified refurbished components where available.",
      },
      {
        type: "h2",
        text: "What a WREQ Report Actually Contains",
      },
      {
        type: "p",
        text: "A Work Request (WREQ) is the formal document that initiates a maintenance action. It must specify the fault description with reference to the relevant AMM (Aircraft Maintenance Manual) chapter, the required corrective action and the applicable airworthiness directive or service bulletin if relevant, the parts needed by part number and quantity and the skilled labour required including licensing category. Writing one properly requires understanding the systems involved, the regulatory references and the traceability requirements of EASA Part 145 approved maintenance organisations.",
      },
      {
        type: "h2",
        text: "What I Took From It",
      },
      {
        type: "p",
        text: "Aviation engineering is rigorous in a way that most engineering contexts are not. Every decision is documented. Every component has a traceable history. The regulatory framework is non-negotiable. That level of rigour exists because the consequences of getting it wrong are catastrophic. There is no git rollback for a landing gear failure.",
      },
      {
        type: "p",
        text: "As an Electronic Engineering and Computer Science student, this was a useful reminder that the discipline of engineering applies across domains. Careful documentation, systematic fault diagnosis and deep understanding of failure modes are the same skills regardless of whether you are debugging a microcontroller or planning a C-check.",
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "ol-links",
        items: [
          { text: "British Airways - official website", url: "https://www.britishairways.com" },
          { text: "Forage - virtual work experience platform where the BA programme was hosted", url: "https://www.theforage.com" },
          { text: "Wikipedia: Airbus A320 family - background on the aircraft type covered in the programme", url: "https://en.wikipedia.org/wiki/Airbus_A320_family" },
          { text: "Wikipedia: Maintenance, repair and overhaul (MRO) - industry context for aviation maintenance operations", url: "https://en.wikipedia.org/wiki/Maintenance,_repair_and_overhaul" },
        ],
      },
    ],
  },

  // ── YUNEX TRAFFIC ────────────────────────────────────────────────────────────
  {
    slug: "yunex-traffic-virtual-experience",
    title: "Smart Cities and Clean Air: What I Learned at Yunex Traffic",
    date: "2025-08-20",
    type: "journal",
    cover_image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&auto=format&fit=crop&q=80",
    description:
      "Reflections on the Yunex Traffic Smart Mobility and Environmental Sustainability virtual work experience, covering intelligent transport systems, Zephyr air quality sensors and what the engineers behind smart cities actually do.",
    tags: ["Yunex", "IoT", "Transport", "Smart Cities", "Virtual"],
    readingTime: 4,
    published: true,
    content: [
      {
        type: "p",
        text: "In August 2025 I completed [Yunex Traffic](https://www.yunextraffic.com)'s Smart Mobility and Environmental Sustainability virtual work experience via Springpod. Yunex Traffic is one of the largest providers of [intelligent transport systems](https://en.wikipedia.org/wiki/Intelligent_transportation_system) in the world. The programme explored how digital technology improves urban air quality and traffic efficiency.",
      },
      {
        type: "h2",
        text: "What Yunex Traffic Does",
      },
      {
        type: "p",
        text: "Yunex Traffic designs and operates intelligent transport systems (ITS). This includes traffic signal controllers, adaptive signal control software, vehicle detection sensors and urban traffic management centres. Their systems are deployed across hundreds of cities and directly influence how millions of road users move every day.",
      },
      {
        type: "p",
        text: "The connection to IoT is direct: sensors collect data at intersections, cameras detect vehicle types and counts and software makes real-time decisions to optimise traffic flow. Modern traffic management is a distributed IoT system operating at city scale.",
      },
      {
        type: "h2",
        text: "Zephyr Air Quality Sensors",
      },
      {
        type: "p",
        text: "The most technically interesting part of the programme was the Zephyr air quality monitoring system. Zephyr sensors measure nitrogen dioxide (NO2), ozone (O3) and particulate matter (PM10) in real time. These pollutants are directly linked to respiratory health and are regulated under UK and EU air quality standards.",
      },
      {
        type: "p",
        text: "For the programme I created an infographic demonstrating how Zephyr sensors are deployed in urban environments to monitor pollution hotspots, how the data is transmitted and how local authorities use it to make decisions about traffic management and emission reduction schemes.",
      },
      {
        type: "h2",
        text: "Engineering and Project Management Roles",
      },
      {
        type: "p",
        text: "The programme gave insight into different career paths within a company like Yunex Traffic. Software engineers build the traffic management platforms. Electrical and systems engineers design and maintain sensor hardware. Project managers coordinate deployments that span multiple local authorities and contractors. The collaboration between these roles is what makes a city-scale system actually work.",
      },
      {
        type: "h2",
        text: "The Infographic Project",
      },
      {
        type: "p",
        text: "The main deliverable for the programme was an infographic explaining how Zephyr air quality sensors work in an urban environment. The Zephyr sensor measures nitrogen dioxide (NO2), ozone (O3) and particulate matter (PM10) using electrochemical and optical methods. The data transmits in near real time to a cloud platform where it is visualised on maps, compared against air quality index thresholds and used to trigger adaptive traffic management responses.",
      },
      {
        type: "p",
        text: "Building the infographic forced me to understand the full data pipeline from sensor reading to policy action. A sensor reading below a threshold is just a number. Connected to traffic signal timing algorithms, it becomes a tool for reducing vehicle idling at junctions and improving air quality in school zones. That connection between hardware sensing and public health outcome is exactly the kind of system I want to work on.",
      },
      {
        type: "h2",
        text: "The Engineering Roles",
      },
      {
        type: "p",
        text: "The programme gave insight into different career paths within Yunex Traffic. Software engineers build the traffic management platforms and the adaptive control algorithms. Electrical and systems engineers design and qualify sensor hardware for outdoor deployment across all weather conditions. Project managers coordinate city-scale deployments spanning multiple local authorities, contractors and certification bodies. The collaboration between these roles is what makes a system that operates 24/7 in a real city actually work reliably.",
      },
      {
        type: "h2",
        text: "What I Took From It",
      },
      {
        type: "p",
        text: "Smart city technology is not abstract. It is physical infrastructure that directly affects air quality, journey times and road safety for real people every day. The engineering that goes into a traffic signal controller or an air quality sensor network is not glamorous in the way a consumer product might be, but the scale and impact are significant.",
      },
      {
        type: "p",
        text: "This programme confirmed my interest in IoT at scale: systems where sensors, connectivity, real-time data processing and measurable real-world outcomes are all connected in a continuous feedback loop. That is the kind of engineering I want to build.",
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "ol-links",
        items: [
          { text: "Yunex Traffic - official website for the intelligent transport systems provider", url: "https://www.yunextraffic.com" },
          { text: "Wikipedia: Intelligent transportation system - overview of ITS technologies and applications", url: "https://en.wikipedia.org/wiki/Intelligent_transportation_system" },
          { text: "IET - Institution of Engineering and Technology", url: "https://www.theiet.org" },
          { text: "Springpod - the virtual work experience platform used for this programme", url: "https://www.springpod.com" },
        ],
      },
    ],
  },

  // ── BUSINESS ANALYTICS ───────────────────────────────────────────────────────
  {
    slug: "business-analytics-data-to-decisions",
    title: "Learning Business Analytics: From Probability to Machine Learning",
    date: "2026-05-01",
    type: "notes",
    cover_image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
    description:
      "Notes from working through a structured executive education business analytics course, covering probability, statistics, Python, descriptive analytics, predictive ML and prescriptive optimisation.",
    tags: ["Data Science", "Python", "ML", "Analytics", "Learning"],
    readingTime: 6,
    published: true,
    content: [
      {
        type: "p",
        text: "I have been working through a business analytics course covering the journey from mathematical foundations to machine learning and prescriptive optimisation. My motivation was twofold: to deepen my own understanding of analytics on the data science side of my studies and to be able to explain these concepts clearly to someone learning them for the first time.",
      },
      {
        type: "p",
        text: "Teaching is one of the most effective ways to learn. When you have to explain something clearly enough for someone else to understand it, you quickly discover which parts of your own understanding are incomplete.",
      },
      {
        type: "h2",
        text: "The Five Phases",
      },
      {
        type: "p",
        text: "The course follows a logical progression through five phases:",
      },
      {
        type: "ol",
        items: [
          "Phase 1 - Maths primer: probability, statistics, distributions and variation",
          "Phase 2 - [Python](https://www.python.org) primer: syntax, data structures, functions and flow control",
          "Phase 3 - Descriptive analytics: summarising data, estimators, outliers and correlation",
          "Phase 4 - Predictive analytics: machine learning, classification, decision trees and support vector machines",
          "Phase 5 - Prescriptive analytics: linear programming, integer programming and optimisation",
        ],
      },
      {
        type: "h2",
        text: "What Phase 1 Actually Teaches",
      },
      {
        type: "p",
        text: "Probability is about reasoning under uncertainty. The Monty Hall problem is a perfect teaching example here: your intuition says switching doors makes no difference. The mathematics says switching wins two-thirds of the time. The lesson is that intuition can be wrong in systematic ways and that a framework for reasoning corrects for this.",
      },
      {
        type: "p",
        text: "Statistics in Phase 2 covers how to describe variation in data. Standard deviation is not just a formula to memorise. It is a measure of how spread out values are and it has rules: roughly 68% of values in a normal distribution fall within one standard deviation of the mean, 95% within two. Those rules matter when you are making decisions based on data and need to know how confident you can be.",
      },
      {
        type: "h2",
        text: "Machine Learning in Phase 4",
      },
      {
        type: "p",
        text: "The predictive analytics phase covers supervised learning: classification algorithms including logistic regression, k-nearest neighbours and decision trees, then support vector machines. The thread connecting all of them is the same: given labelled historical data, build a model that predicts the label for new unseen inputs.",
      },
      {
        type: "p",
        text: "Decision trees are particularly satisfying to study because they are interpretable. You can trace exactly why the model made a decision. This matters in business contexts where stakeholders need to understand and trust a model's output, not just use it.",
      },
      {
        type: "h2",
        text: "Building Alongside Learning",
      },
      {
        type: "p",
        text: "Alongside working through the course content I have been building a learning site that publishes notes and interactive tools for each module. The act of converting lecture notes into clear, teachable pages forces a level of understanding that passive reading does not. You cannot explain something clearly if you do not understand it clearly.",
      },
      {
        type: "p",
        text: "The capstone task is a production optimisation problem: determine the optimal weekly production mix of two medical devices given constraints on labour, materials and capacity. This requires everything from the course: probability to quantify uncertainty, statistics to describe historical data, Python to run the calculations and linear programming to find the optimal decision.",
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "ol-links",
        items: [
          { text: "Wikipedia: Business analytics - overview, methods and applications", url: "https://en.wikipedia.org/wiki/Business_analytics" },
          { text: "pandas documentation - the primary Python data analysis library", url: "https://pandas.pydata.org/docs/" },
          { text: "Kaggle - datasets and notebooks for applied data science practice", url: "https://www.kaggle.com" },
          { text: "Google Data Analytics Certificate on Coursera - structured data analytics curriculum", url: "https://www.coursera.org/professional-certificates/google-data-analytics" },
          { text: "scikit-learn documentation - machine learning tools used in the predictive analytics phase", url: "https://scikit-learn.org/stable/" },
        ],
      },
    ],
  },

  // ── EXISTING POSTS ───────────────────────────────────────────────────────────
  {
    slug: "building-my-portfolio",
    title: "Building My Portfolio: Decisions, Stack and What I Learned",
    date: "2025-09-01",
    type: "blog",
    cover_image: "/images/projects/zacess-pages/main.png",
    description:
      "How I rebuilt my portfolio from scratch and kept building it: Next.js App Router, TypeScript, Tailwind CSS, Upstash Redis, Vercel, Python daemons for live device status, a custom PS5 OAuth v2 Cloudflare Worker, 5-tier GPC game detection with IGDB cover art, Discord presence via Lanyard and Spotify now-playing - and what shipping something personal actually teaches you.",
    tags: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Redis", "Vercel", "Python"],
    readingTime: 15,
    published: true,
    content: [
      {
        type: "p",
        text: "For a while my portfolio was a terminal-style single-page HTML file at zacess.com. It worked, it was fun and I was genuinely proud of it at the time. Looking back, it was mostly vibe-coded: I built it by piecing together things I had found online without deeply understanding what I was doing. It loaded fast, looked interesting and told you almost nothing about my actual work. No project pages. No blog. No way to see anything beyond a blinking cursor and a few hardcoded text responses. The current version lives at [isaacadjei.me](https://www.isaacadjei.me).",
      },
      {
        type: "image",
        src: "/images/projects/zacess-pages/terminal.png",
        alt: "The original zacess.com terminal-style portfolio",
        caption: "The original zacess.com - a terminal interface that looked great and showed almost nothing",
      },
      {
        type: "p",
        text: "I kept it live for longer than I should have. Then I rebuilt from scratch. This post covers the full tech stack, the decisions behind it and what building something real - rather than something impressive - actually required.",
      },
      {
        type: "h2",
        text: "The full tech stack",
      },
      {
        type: "p",
        text: "Before getting into the why, here is what the site is built with:",
      },
      {
        type: "ul",
        items: [
          "Next.js 15 (App Router): the framework. Server components, file-based routing, layout nesting and built-in image optimisation",
          "React 19: UI component library underpinning everything Next.js renders",
          "TypeScript: typed throughout. Every component, data file and API route is fully typed",
          "Tailwind CSS v4: utility-first CSS framework. Every style is a class, nothing is global except the base reset",
          "Node.js: the runtime Next.js runs on, also used for the build step and API routes",
          "shadcn/ui: unstyled, accessible base components (buttons, separators, cards) that I style with Tailwind rather than fighting someone else's design system",
          "Geist Sans and Geist Mono: Vercel's typefaces, used for body text and monospace labels respectively",
          "Lucide React: icon library, lightweight and consistent",
          "[Vercel](https://vercel.com): deployment platform with automatic deploys on every push to main",
          "Cloudflare: DNS provider routing isaacadjei.me",
          "GitHub Actions: CI pipeline running lint and build checks on every pull request",
          "Resend: API for the contact form email delivery",
          "Beehiiv: newsletter subscription management",
          "Cloudflare Turnstile: CAPTCHA on the contact form, privacy-respecting alternative to reCAPTCHA",
          "[Upstash](https://upstash.com) Redis: serverless rate limiting on the contact form API route",
          "Google Analytics 4: traffic analytics via Next.js Script with afterInteractive strategy",
        ],
      },
      {
        type: "h2",
        text: "Why Next.js and not something simpler?",
      },
      {
        type: "p",
        text: "A portfolio could be a static HTML file. Many are and they work fine. But I wanted something I could grow: add project detail pages, a full blog, a newsletter, a contact form with proper validation and rate limiting. A static file stops scaling the moment you need server-side logic or multiple pages.",
      },
      {
        type: "p",
        text: "Next.js with the App Router gave me everything I needed in one place: file-based routing where adding a new page is just adding a new folder, server components that run on the server and send HTML to the browser without shipping any JavaScript for purely static content, API routes for the contact form and newsletter subscription endpoints and automatic static generation for pages that do not change at runtime.",
      },
      {
        type: "p",
        text: "I had already used Next.js on [Phaemos](/projects/phaemos) and the zacess.com terminal site, so the learning curve was not the reason to choose it. The reason was that it was genuinely the right tool for what I wanted to build.",
      },
      {
        type: "h2",
        text: "TypeScript everywhere",
      },
      {
        type: "p",
        text: "Every file in this project is TypeScript. The blog post data is typed with a BlogPost interface and a ContentBlock discriminated union. The project data is typed with a Project interface. Every API route has typed request and response shapes.",
      },
      {
        type: "p",
        text: "The benefit became obvious when I added new features. When I extended the ContentBlock type to add image and divider block types, TypeScript immediately told me which renderer cases I had not handled yet. When I added the projectSlug field to blog posts, it told me which existing posts were missing it. The compiler catches entire categories of bugs before the page even loads.",
      },
      {
        type: "h2",
        text: "Tailwind CSS: why utility classes",
      },
      {
        type: "p",
        text: "I had used traditional CSS on [AstonCV](/projects/astoncv) (pure custom CSS, no frameworks) and Tailwind on Phaemos. The comparison is instructive. With traditional CSS, naming things is genuinely hard. What do you call the container that wraps the project card header? How do you avoid naming collisions as the stylesheet grows? BEM helps but adds verbosity.",
      },
      {
        type: "p",
        text: "With Tailwind, there are no names to invent. Every style is a class that does exactly what it says: flex, items-center, gap-4, text-sm, text-muted-foreground. The component file and the styles are in the same place. When a component is deleted, its styles are deleted with it automatically. No orphaned CSS.",
      },
      {
        type: "p",
        text: "The trade-off is that class lists get long on complex components. I use cn() (from clsx and tailwind-merge) to conditionally apply classes without duplicates or conflicts, and break components into smaller pieces when the class list becomes unreadable.",
      },
      {
        type: "h2",
        text: "The blog system",
      },
      {
        type: "p",
        text: "The blog is built without a CMS or database. All posts live in data/blog.ts as TypeScript objects with a typed content array. Each content block has a type field (p, h2, h3, ul, ol, code, quote, image, divider) that the renderer uses to produce the right HTML. Adding a post is just adding an object to the array.",
      },
      {
        type: "p",
        text: "This was a deliberate choice. A CMS adds infrastructure, credentials, an API dependency and a rate limit to worry about. For a personal portfolio where I am the only author, those costs outweigh the benefits. The trade-off is that editing requires a code change and a deploy, which takes three to five minutes. I am fine with that.",
      },
      {
        type: "h2",
        text: "The contact form and API routes",
      },
      {
        type: "p",
        text: "The contact form submits to a Next.js API route at /api/contact. The route validates the Turnstile CAPTCHA token against Cloudflare's siteverify endpoint, checks the rate limit via Upstash Redis (five requests per hour per IP), validates the input fields and sends the email via Resend. All of this happens server-side, so the Resend API key and Redis credentials are never exposed to the browser.",
      },
      {
        type: "p",
        text: "The newsletter signup hits /api/newsletter, which validates the email format and calls the Beehiiv subscriptions API. Again, the API key lives in an environment variable and never touches the client.",
      },
      {
        type: "h2",
        text: "Deployment and CI",
      },
      {
        type: "p",
        text: "The site deploys automatically on every push to the main branch via [Vercel](https://vercel.com)'s GitHub integration. The main branch has branch protection: every change must go through a pull request and pass the Lint and Build GitHub Actions check before merging. This means broken code never reaches production.",
      },
      {
        type: "p",
        text: "Environment variables (API keys for Resend, Beehiiv, Upstash, Turnstile and Google Analytics) are stored in Vercel project settings and injected at build time. A .env.example file in the repo documents every variable with placeholder values so the setup is reproducible.",
      },
      {
        type: "h2",
        text: "Design decisions",
      },
      {
        type: "p",
        text: "The visual identity came from the original terminal site. I wanted to keep the monospace feel without making the new site look like a gimmick. The result is a clean, readable layout that uses GeistMono for code and labels but GeistSans for everything else, with a royal blue primary accent colour that is distinctive without being loud.",
      },
      {
        type: "ul",
        items: [
          "Dark mode by default with system preference detection via next-themes",
          "CSS animations (fade-up, fade-in) on page load: subtle and fast, never blocking",
          "shadcn/ui components for accessible, consistent UI elements without reinventing every component",
          "A command menu (Ctrl/Cmd+I) for keyboard navigation between pages",
          "An interactive terminal on /lab that reuses the same vocabulary as the zacess.com terminal",
          "No hero animations that make the user wait before they can read anything",
        ],
      },
      {
        type: "h2",
        text: "What I learned",
      },
      {
        type: "p",
        text: "Shipping something personal is harder than shipping coursework. With coursework there is a spec, a deadline and a grade. Here the only constraint is: does this represent me well? That is surprisingly difficult to answer and easy to overthink.",
      },
      {
        type: "p",
        text: "The most useful thing I did was to write the projects section as problem, solution and learnings rather than a list of technologies used. That framing forced me to articulate why I built things, not just what I used. A list of tech stacks tells you nothing. The decisions behind them tell you everything.",
      },
      {
        type: "p",
        text: "The other lesson was about scope. A portfolio site can expand indefinitely: add more pages, more features, more integrations. At some point you have to decide it is done enough to show people. The discipline is not in building more. It is in knowing when what you have already built is enough.",
      },
      {
        type: "quote",
        text: "Do not list what you used. Explain the decision you made and what it cost you.",
        source: "Something I told myself halfway through",
      },
      {
        type: "h2",
        text: "This post was written in October 2025. The site has grown considerably since then.",
      },
      {
        type: "p",
        text: "The original post covered the base stack: Next.js, TypeScript, Tailwind CSS, Vercel, a contact form and a blog. Since then I have built a live device status system, a full private dashboard with authentication, a job scraper that runs automatically every morning and a set of Python daemons that push real-time data from my devices. What follows covers those additions.",
      },
      {
        type: "h2",
        text: "The Live Status System",
      },
      {
        type: "p",
        text: "The /notes and /now pages show a live widget with the current state of all my devices. This is not a gimmick. It is a genuinely useful window into what is happening across my hardware at any given moment.",
      },
      {
        type: "p",
        text: "The system works through a set of Python daemons. The MacBook daemon runs via launchd on macOS and writes battery percentage, charging state, timezone and weather data to an [Upstash](https://upstash.com) Redis key every 30 seconds with a 600-second TTL. If the daemon stops running the key expires and the card shows the last-known state. The Lenovo and Gaming PC daemons run as Windows services via NSSM and report battery, CPU and GPU usage. The Gaming PC daemon uses pynvml to read NVIDIA GPU utilisation directly.",
      },
      {
        type: "p",
        text: "Weather data comes from Open-Meteo, a free API powered by the European Centre for Medium-Range Weather Forecasts (ECMWF) model. The daemon uses CoreLocationCLI to get GPS coordinates from macOS Location Services, giving street-level precision instead of the city-level IP geolocation I used originally. No API key is needed for Open-Meteo.",
      },
      {
        type: "p",
        text: "Discord presence comes from the Lanyard API, which reads my Discord Rich Presence in real time. When I am coding in VS Code, PreMiD is active or a game is running, the widget shows it. The Lanyard WebSocket connection means updates appear within seconds. The PS5 card uses a [Cloudflare Worker](https://workers.cloudflare.com) that polls the PlayStation Network API every 60 seconds using an NPSSO session token stored in Cloudflare secrets, writing the result to the same Redis instance.",
      },
      {
        type: "h2",
        text: "The Private Dashboard",
      },
      {
        type: "p",
        text: "Behind authentication there is a set of private tools I actually use day-to-day. The authentication layer uses bcrypt hashing with a Redis-backed rate limiter. Building the private side of the site turned out to teach me as much as the public side - the constraints are different when the user is you and the data is real. I will not detail the specifics here since it is private by design, but the technical patterns (authenticated layouts, server actions, Supabase as the data layer) are the same ones that show up in any production application.",
      },
      {
        type: "h2",
        text: "Supabase as the Data Layer",
      },
      {
        type: "p",
        text: "I chose [Supabase](https://supabase.com) (hosted PostgreSQL) for the dashboard data layer. The alternative was a flat file store, which would have been simpler but would not support the query patterns I needed: filtering applications by status, sorting by date, searching across all inventory items. PostgreSQL gives me a proper relational model with indexes where they matter.",
      },
      {
        type: "p",
        text: "Supabase's auto-generated REST API means I can call supabase.from('applications').select() from a server action and get a typed result without writing any SQL for the common cases. For more complex queries like the weekly digest aggregation I drop into raw SQL. The free tier is generous enough for personal use and the connection pooling handles the serverless Next.js deployment well.",
      },
      {
        type: "h2",
        text: "Security and CI Improvements",
      },
      {
        type: "p",
        text: "The CI pipeline has expanded beyond lint and build. Gitleaks runs on every pull request to scan for accidentally committed secrets. This caught a test commit where I had included a real API key in a comment. The main branch has tag protection in addition to branch protection: releases can only be created from main.",
      },
      {
        type: "p",
        text: "The Content Security Policy header in next.config.mjs is now explicit and restrictive: every domain that the site fetches from must be listed in connect-src, img-src or frame-src. This means adding a new API integration requires a deliberate CSP change, which surfaces any accidental third-party requests. The policy blocks inline scripts and eval by default.",
      },
      {
        type: "p",
        text: "Environment variables are documented in .env.example with a comment for each variable explaining what it does and where to get it. The deployment workflow is branch-first: every change goes through a pull request, CI must pass and the branch is deleted after merge. Nothing is committed directly to main.",
      },
      {
        type: "h2",
        text: "The Colophon",
      },
      {
        type: "p",
        text: "The /colophon page documents how the site is built: every tool, API, service and data source with a short explanation of what it does and why I chose it. It is useful for me as a reference when I have forgotten which Redis key stores what, and useful for anyone who wants to understand the architecture without reading the source code. It is updated whenever a new integration is added.",
      },
      {
        type: "h2",
        text: "What the Site Is Now",
      },
      {
        type: "p",
        text: "The site started as a portfolio. It is now a personal operating system. The public pages show work, writing and presence. The private dashboard manages applications, credentials, inventory and notes. The live widget shows what I am doing right now across six devices. The job scraper runs every morning without me touching it. The expiry alerts tell me when something needs attention.",
      },
      {
        type: "p",
        text: "The most surprising outcome is that building the infrastructure to support all of this has taught me more than any single project in it. Making a distributed system reliable when parts of it are always offline, a daemon has crashed or an API rate limit has been hit is a different class of problem from building a feature in isolation. That is the thing a portfolio site built this way forces you to care about.",
      },
    ],
  },

  // ── ASTONCV ──────────────────────────────────────────────────────────────────
  {
    slug: "astoncv-full-stack-cv-database",
    title: "Building AstonCV: A Full-Stack CV Database with PHP, MySQL and Zero Frameworks",
    date: "2026-05-13",
    type: "blog",
    projectSlug: "astoncv",
    cover_image: "/images/projects/astoncv/main.png",
    description:
      "How I built a full-stack CV database website from scratch using pure PHP 8.2 and MySQL for a university module, with eleven security measures, PDF export via mPDF and a complete UI redesign across four versions.",
    tags: ["PHP", "MySQL", "Security", "Full-Stack", "Aston", "Web Dev"],
    readingTime: 10,
    published: true,
    content: [
      {
        type: "p",
        text: "For DG1IAD Portfolio 3 at Aston University, the brief was to build a full-stack web application. The constraint that made it interesting: no frameworks. No Laravel. No Symfony. No Bootstrap. Pure PHP 8.2, MySQL, CSS3 and JavaScript, built from scratch.",
      },
      {
        type: "p",
        text: "[AstonCV](/projects/astoncv) is a CV database where anyone can browse and search student CVs publicly, register an account, manage their own CV once logged in and download any CV as a professionally formatted PDF. The site is deployed live on Aston University's internal Apache server and accessible via a custom Cloudflare domain redirect at astoncv.zacess.com.",
      },
      {
        type: "image",
        src: "/images/projects/astoncv/main.png",
        alt: "AstonCV homepage showing the CV browse and search interface",
        caption: "The AstonCV homepage - public CV browsing with search and filter, no account required",
      },
      {
        type: "h2",
        text: "Why no frameworks?",
      },
      {
        type: "p",
        text: "The constraint was deliberate. When you use a framework, you are using someone else's solutions to problems you have not yet encountered. You learn the framework's patterns rather than the underlying mechanics. Building without a framework forces you to understand what the framework would have done for you: database connections, prepared statements, session management, CSRF protection. Every one of those things has to be written explicitly and understood completely.",
      },
      {
        type: "p",
        text: "I had used Next.js on [Phaemos](/projects/phaemos) and this portfolio. Those projects gave me the framework experience. AstonCV was an opportunity to work at a lower level and understand what is actually happening when a form submits, a session is validated or a query hits the database.",
      },
      {
        type: "h2",
        text: "The build: v1.0.0",
      },
      {
        type: "p",
        text: "Version 1.0.0 launched on 7 March 2026. The core structure was eight PHP files: index.php (the browse page), cv.php (individual CV detail), register.php, login.php, update.php, dashboard.php, logout.php and contact_handler.php. Each protected page checks $_SESSION['user_id'] at the top and redirects to login.php if the session is not active.",
      },
      {
        type: "p",
        text: "The database connection lives in db.php: a single PDO connection with error mode set to exceptions, returned as a singleton. Every query in every file uses this connection with prepared statements, so no query anywhere in the codebase builds SQL by string concatenation.",
      },
      {
        type: "p",
        text: "On the same day, v1.1.0 added PDF export via mPDF v8.2, installed with Composer. export_cv.php builds the PDF server-side from the stored CV data and streams it to the browser as a download. No client-side PDF generation, no external service, no watermark.",
      },
      {
        type: "h2",
        text: "The security layer",
      },
      {
        type: "p",
        text: "Security was not an afterthought. I implemented eleven specific measures before the v2.0.0 release:",
      },
      {
        type: "ol",
        items: [
          "XSS prevention: every piece of user-supplied content rendered to the page goes through htmlspecialchars(). No exceptions",
          "SQL injection prevention: every query uses PDO prepared statements with parameter binding. No string concatenation in SQL anywhere",
          "Password hashing: bcrypt via password_hash() on registration, password_verify() on login",
          "Session authentication: every protected page checks the session variable at the top and redirects immediately if it is missing",
          "Authorisation: the edit button on a CV detail page only appears if the logged-in user owns that CV, enforced server-side not just in the UI",
          "Server-side validation: all form inputs are validated in PHP before any database write, regardless of what client-side validation may have run",
          "CSRF protection: a hidden token generated per session is included in every POST form and validated on submission",
          "Brute-force lockout: five failed login attempts triggers a 15-minute account lockout, tracked in the database",
          "File upload validation: profile picture uploads are checked for MIME type against a whitelist and capped at 2 MB before being moved to the uploads directory",
          "Honeypot: the contact form includes a hidden field that is invisible to users but bots fill in automatically. Any submission with the honeypot field populated is silently discarded",
          "POST-only enforcement: contact_handler.php rejects any request that is not a POST, preventing direct GET access to the form processor",
        ],
      },
      {
        type: "p",
        text: "The brute-force lockout was the most interesting to implement. Rather than using a cache or Redis (both of which would add infrastructure), I added login_attempts and lockout_until columns to the users table. On each failed login, the attempt count increments. If it reaches five, lockout_until is set to now plus 15 minutes. On each login attempt, the route first checks whether lockout_until is in the future before validating the password.",
      },
      {
        type: "h2",
        text: "The v2.0.0 redesign",
      },
      {
        type: "p",
        text: "Version 2.0.0 launched on 20 March 2026 with a complete UI redesign. The original version was functional but sparse. The redesign introduced:",
      },
      {
        type: "ul",
        items: [
          "Aston University purple (#5c2d82) as the primary brand colour throughout",
          "Space Grotesk for headings and DM Sans for body text, both loaded via Google Fonts",
          "Real Aston University campus photography on every page: hero image on index, login, register, update and dashboard",
          "Animated stats bar with counting numbers (total CVs, registered users, total downloads)",
          "CSS marquee strip below the hero",
          "Scroll reveal animations on CV cards using IntersectionObserver",
          "Preloader on first page load",
          "Sticky dark navbar with backdrop blur on scroll",
          "Profile picture upload with avatar display across all pages",
          "Dashboard with CV completeness score, view statistics and account management",
          "View counter on each CV profile page",
        ],
      },
      {
        type: "p",
        text: "The live filter and sort on the browse page required some care. Filtering by programming language and sorting by name or view count both needed to work without a page reload. The approach was straightforward: JavaScript reads the filter and sort values from the dropdowns and the search field, then iterates the CV cards in the DOM, hiding any that do not match. No fetch calls, no API, no re-render. The DOM manipulation was fast enough that there was no perceived delay even with a full list of CVs.",
      },
      {
        type: "h2",
        text: "Deployment",
      },
      {
        type: "p",
        text: "The site runs on Aston University's internal Apache server. Local development used XAMPP (Apache and MySQL) on Windows, with the project directory mapped to localhost/astoncv. config.php holds the database credentials and is gitignored. config.example.php with placeholder values is committed instead, so anyone cloning the repo knows exactly what to create.",
      },
      {
        type: "p",
        text: "The Cloudflare domain redirect was a simple CNAME and Page Rule configuration: astoncv.zacess.com CNAME to the Aston server, with a forwarding rule handling the URL rewrite. This meant the site was accessible at both the full Aston URL and the short link without changing anything on the server.",
      },
      {
        type: "h2",
        text: "Version history and lessons",
      },
      {
        type: "p",
        text: "The project shipped four versions between March and May 2026. v2.1.0 and v2.2.0 were cleanup releases: updating contact email addresses throughout the codebase, adding standard repository files (CHANGELOG, SECURITY, ROADMAP, MIT licence), setting up a GitHub Actions CI workflow for PHP syntax checking on every push and adding the Aston University SVG favicon to every page.",
      },
      {
        type: "p",
        text: "The main lessons came from working without a framework. Every problem that frameworks solve invisibly becomes explicit. Session management, CSRF, prepared statements, output escaping: you have to think about all of them, deliberately, every time you write a new page. That is slower but it is also far more instructive. I left this project understanding web security at a level that using a framework would not have given me.",
      },
      {
        type: "p",
        text: "The other lesson was about scope. The brief did not require a dashboard, animated stats or campus photography. Those came from wanting to build something I was proud of rather than something that just met the minimum criteria. The extra scope cost time but the result was a site that looked like a real product rather than a coursework submission.",
      },
      {
        type: "quote",
        text: "When the constraint is no frameworks, every feature you add teaches you something a framework would have hidden.",
        source: "Something I understood about halfway through the build",
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "ol-links",
        items: [
          { text: "AstonCV project page", url: "/projects/astoncv" },
          { text: "PHP 8 documentation - official language reference", url: "https://www.php.net/manual/en/" },
          { text: "MySQL 8 documentation - official reference for the database used in AstonCV", url: "https://dev.mysql.com/doc/" },
          { text: "mPDF library - PHP library for generating PDF files from HTML", url: "https://mpdf.github.io" },
          { text: "OWASP PHP Security Cheat Sheet - security best practices for PHP web applications", url: "https://cheatsheetseries.owasp.org/cheatsheets/PHP_Security_Cheat_Sheet.html" },
          { text: "Wikipedia: SQL injection - attack vector defended against in AstonCV with prepared statements", url: "https://en.wikipedia.org/wiki/SQL_injection" },
        ],
      },
    ],
  },

  {
    slug: "week-1-aston",
    title: "Week 1 at Aston: What Second Year Actually Feels Like",
    date: "2025-09-22",
    type: "journal",
    cover_image: "/images/projects/astoncv/aston-skyline.jpg",
    description:
      "A journal entry I will write properly once second year officially begins. Check back soon.",
    tags: ["University", "EECS", "Year 2"],
    readingTime: 3,
    published: false,
    series: "life-at-aston",
    seriesPart: 1,
    content: [
      {
        type: "p",
        text: "This is a placeholder. I will rewrite this properly once I have had enough of second year to say something real about it. The structure below is a rough outline of what I want to cover. The images are from campus and will stay wherever they make sense once the content is written.",
      },
      {
        type: "image",
        src: "/images/projects/astoncv/campus-hero.jpg",
        alt: "Aston University campus",
        caption: "Aston University, Birmingham.",
      },
      {
        type: "h2",
        text: "Back at Aston",
      },
      {
        type: "p",
        text: "Second year started on 22 September 2025. I remember standing at the main entrance that first morning thinking it felt both completely familiar and completely different at the same time. Year 1 was survival. Year 2 already felt like something else: less time to figure things out, more expectation that you already have.",
      },
      {
        type: "image",
        src: "/images/projects/astoncv/campus-aerial.jpg",
        alt: "Aerial view of Aston University campus",
        caption: "Aston University from above. Birmingham city centre is a ten-minute walk.",
      },
      {
        type: "h2",
        text: "The Module Load",
      },
      {
        type: "p",
        text: "Second year modules are noticeably harder than first year. Digital Systems Design, Embedded Software Engineering, Advanced Programming and Signals and Systems are the ones I am most interested in. A lot of overlap with things I have been building outside coursework, which either means I will find it easier or I will be bored in the lectures. Probably both, depending on the week.",
      },
      {
        type: "image",
        src: "/images/projects/astoncv/campus-main.jpg",
        alt: "Aston University main building",
        caption: "The main building. I spend more time in the labs than I do in lecture theatres.",
      },
      {
        type: "h2",
        text: "PAL Leadership",
      },
      {
        type: "p",
        text: "This year I am also running Peer Assisted Learning sessions as a PAL Leader for first year EECS students. I did not expect to enjoy it as much as I do. Explaining something you understand well is a different skill from just understanding it. You find out quickly which parts of your knowledge are actually solid and which parts you have been faking.",
      },
      {
        type: "image",
        src: "/images/projects/astoncv/campus-library.jpg",
        alt: "Aston University library",
        caption: "The library. Good for deep work when the labs are full.",
      },
      {
        type: "h2",
        text: "Projects Running in Parallel",
      },
      {
        type: "p",
        text: "PHAEMOS is still going. The AVR bare metal state machine is ongoing. I also want to push more blog posts before the semester fully ramps up. Balancing coursework with personal projects is the thing I have not figured out yet. Year 1 taught me that leaving everything to the last minute works until it suddenly does not.",
      },
      {
        type: "image",
        src: "/images/projects/astoncv/campus-lake.jpg",
        alt: "Aston University lake",
        caption: "The lake on campus. Good place to think on the walk in each morning.",
      },
      {
        type: "h2",
        text: "What I Actually Want from This Year",
      },
      {
        type: "p",
        text: "More depth. Last year I was covering ground: getting used to the environment, the people, the workload. This year I want to go deeper on the things that actually matter: embedded systems, software architecture, building things that last longer than a coursework deadline. I want to leave second year with two or three projects I am genuinely proud of and a clearer picture of what kind of engineer I am becoming.",
      },
    ],
  },

  // ── ARTICLE ──────────────────────────────────────────────────────────────────
  {
    slug: "why-software-engineers-should-understand-hardware",
    title: "Why Every Software Engineer Should Understand Hardware",
    date: "2026-03-10",
    type: "article",
    cover_image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80",
    description:
      "An argument for why understanding hardware - registers, memory, timing, power - makes you a significantly better software engineer, regardless of whether you ever write firmware.",
    tags: ["Opinion", "Embedded", "Software Engineering", "Career"],
    readingTime: 7,
    published: true,
    content: [
      {
        type: "p",
        text: "There is a common split in engineering education between software and hardware. Software engineers learn data structures, algorithms, systems design and distributed computing. Hardware engineers learn circuits, signal processing, digital logic and microarchitecture. The two disciplines have different curricula, different job titles and, increasingly, different cultures. This split is artificial and the software engineers who cross it are meaningfully better at their jobs.",
      },
      {
        type: "p",
        text: "I study Electronic Engineering and Computer Science, which means I do not have the option of staying on one side. I have spent semesters writing bare metal C on a custom PCB and semesters building full-stack web applications with [TypeScript](https://www.typescriptlang.org) and [React](https://react.dev). The crossover has changed how I think about software in ways that are hard to explain but easy to demonstrate.",
      },
      {
        type: "h2",
        text: "Abstraction Has a Cost",
      },
      {
        type: "p",
        text: "Every layer of abstraction hides complexity from the layer above it. The CPU hides transistors. The operating system hides the CPU. The programming language hides the operating system. The framework hides the language. This is useful. It is what allows a web developer to build a product without understanding MOSFET physics. But it creates engineers who have no mental model of what is happening below their level and no ability to reason about performance, reliability or correctness when something breaks through the abstraction.",
      },
      {
        type: "p",
        text: "A software engineer who understands memory allocation, cache behaviour and system call overhead writes fundamentally different code than one who does not. Not because they are manually optimising every line, but because their intuitions about what is expensive, what is safe and what will fail under load are calibrated to reality rather than to the abstraction. They know when a mutex is necessary and when it is not. They know why a tight loop that polls a flag can spin a CPU core to 100% even when the workload is minimal. They know why memory-mapped I/O is not the same as regular memory.",
      },
      {
        type: "h2",
        text: "Debugging Goes One Layer Deeper",
      },
      {
        type: "p",
        text: "The most useful debugging skill is the ability to go one layer deeper than the problem. If your web application has a memory leak, the framework is not lying to you: something in your code is holding a reference. If your system call is taking 40ms instead of 4ms, the OS is not broken: your process is probably being preempted or your data is causing a page fault. If your network request is timing out intermittently, the protocol is not at fault: your retry logic is probably not handling the connection reset correctly.",
      },
      {
        type: "p",
        text: "Hardware engineers develop this instinct early because they have to. If an LED is not lighting up, the register configuration, the clock source, the power supply and the physical connection are all plausible causes. You cannot use printf debugging when your firmware crashes before the UART initialises. You learn to think systematically about what layer the problem is at and what evidence would distinguish between them. That discipline transfers directly to software debugging.",
      },
      {
        type: "h2",
        text: "Performance Is Not Magic",
      },
      {
        type: "p",
        text: "Performance optimisation in software is often treated as a specialised skill: something you do after the product is built, handled by engineers with specific expertise. This framing is backwards. Most performance problems are caused by design decisions made early in development by people who did not have a clear model of what was expensive. Fixing them later is significantly harder than making better decisions initially.",
      },
      {
        type: "p",
        text: "Understanding hardware makes the costs visible. A function call crosses a cache line boundary? A context switch happens on every lock acquisition? A string comparison reads character by character when a hash would be O(1)? None of these are hardware problems. But they are visible as hardware problems to someone who thinks in terms of memory hierarchies, CPU pipelines and branch prediction. The abstraction did not remove the cost. It hid it.",
      },
      {
        type: "h2",
        text: "The Argument for Full-Stack Engineering",
      },
      {
        type: "p",
        text: "The most impactful engineers I have encountered in the literature are not specialists who know one thing deeply. They are people who can reason comfortably across levels of abstraction: from the silicon up to the application and back down again. They designed systems that worked because they understood the constraints at every layer, not just the layer they were working in.",
      },
      {
        type: "p",
        text: "You do not need to design PCBs to benefit from understanding hardware. You need to understand what a CPU actually does when it executes your code, what the operating system does when it runs your process and what the network stack does when you make a request. That knowledge is available in textbooks, datasheets and open source implementations. It is not esoteric. It is foundational.",
      },
      {
        type: "quote",
        text: "The programmer, like the poet, works only slightly removed from pure thought-stuff. He builds his castles in the air, from air, creating by exertion of the imagination.",
        source: "Frederick P. Brooks Jr., The Mythical Man-Month (1975)",
      },
      {
        type: "p",
        text: "The castles are real. The foundations matter. Know what yours are built on.",
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "ol-links",
        items: [
          { text: "PHAEMOS project - the predictive maintenance platform referenced in this article", url: "/projects/phaemos" },
          { text: "avr-zac repository - bare-metal AVR programming referenced in this article", url: "https://github.com/zaccesss/avr-zac" },
          { text: "Embedded.fm podcast - long-running podcast on embedded engineering, career and hardware", url: "https://embedded.fm" },
          { text: "The Hardware/Software Interface - Coursera course (University of Washington)", url: "https://www.coursera.org/learn/hardware-software-interface" },
          { text: "Wikipedia: Computer architecture - overview of the abstractions between hardware and software", url: "https://en.wikipedia.org/wiki/Computer_architecture" },
          { text: "Computer Systems: A Programmer's Perspective - Bryant and O'Hallaron - the best single book on how software meets hardware", url: "https://csapp.cs.cmu.edu/" },
        ],
      },
    ],
  },

  // ── RESOURCES ────────────────────────────────────────────────────────────────
  {
    slug: "resources-engineering-and-technology",
    title: "Resources for Engineering and Technology",
    date: "2026-02-20",
    type: "resources",
    cover_image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&auto=format&fit=crop&q=80",
    description:
      "A curated list of books, courses, documentation, tools and videos I have found genuinely useful for learning embedded systems, software engineering, computer science and the craft of building things. Updated as I find new things worth recommending.",
    tags: ["Resources", "Embedded", "Software Engineering", "Learning", "Tools"],
    readingTime: 8,
    published: true,
    content: [
      {
        type: "p",
        text: "These are resources I have actually used, not lists compiled from other lists. Each one is here because it changed how I understood something or how I work. I have grouped them by area with a short note on why each one is worth your time. For a broader view of what I am currently reading and watching, check the consumed page on this site.",
      },
      {
        type: "h2",
        text: "Embedded Systems and Hardware",
      },
      {
        type: "ol-links",
        items: [
          { text: "The Art of Electronics - Horowitz and Hill (3rd ed.) - the definitive electronics reference. Dense but readable. Buy it.", url: "https://www.amazon.co.uk/Art-Electronics-Paul-Horowitz/dp/0521809266" },
          { text: "Microchip AVR datasheets - reading a real datasheet is the best embedded systems education available. Free.", url: "https://ww1.microchip.com/downloads/en/DeviceDoc/ATmega644P-Datasheet.pdf" },
          { text: "FreeRTOS: Mastering the FreeRTOS Real Time Kernel - the official FreeRTOS book. Free PDF, genuinely good.", url: "https://www.freertos.org/Documentation/RTOS_book.html" },
          { text: "Making Embedded Systems - Elecia White - practical and well-written. Better than most university courses on the topic.", url: "https://www.oreilly.com/library/view/making-embedded-systems/9781449308889/" },
          { text: "Embedded.fm podcast - long-running show covering embedded engineering professionally. Good while soldering.", url: "https://embedded.fm" },
          { text: "NXP I2C specification UM10204 - the definitive I2C protocol reference. Free PDF.", url: "https://www.nxp.com/docs/en/user-guide/UM10204.pdf" },
          { text: "Compiler Explorer (Godbolt) - paste C/C++ and see the assembly output. Invaluable for understanding what the compiler actually does.", url: "https://godbolt.org/" },
        ],
      },
      {
        type: "h2",
        text: "Computer Science Fundamentals",
      },
      {
        type: "ol-links",
        items: [
          { text: "Computer Systems: A Programmer's Perspective - Bryant and O'Hallaron - the best single book on how computers actually work. Covers memory, caching, linking, concurrency.", url: "https://csapp.cs.cmu.edu/" },
          { text: "Structure and Interpretation of Computer Programs (SICP) - Abelson and Sussman - builds real conceptual foundations. Free online.", url: "https://mitp-content-server.mit.edu/books/content/sectbyfn/books_pres_0/6515/sicp.zip/full-text/book/book.html" },
          { text: "The Algorithm Design Manual - Skiena - practical algorithms with real problems, not just theory. Better than Cormen for most engineers.", url: "https://www.algorist.com/" },
          { text: "MIT OpenCourseWare 6.004: Computation Structures - digital logic to a working processor from first principles. Free.", url: "https://ocw.mit.edu/courses/6-004-computation-structures-spring-2017/" },
          { text: "Nand2Tetris - build a computer from logic gates to a working OS. One of the best learning experiences available online. Free.", url: "https://www.nand2tetris.org/" },
        ],
      },
      {
        type: "h2",
        text: "Software Engineering and Systems Design",
      },
      {
        type: "ol-links",
        items: [
          { text: "Designing Data-Intensive Applications - Martin Kleppmann - essential reading for understanding distributed systems. Dense with substance.", url: "https://dataintensive.net/" },
          { text: "The Pragmatic Programmer - Hunt and Thomas - timeless engineering philosophy more than a technical manual. Re-read it every year.", url: "https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/" },
          { text: "High Performance Browser Networking - Grigorik - the most useful reference for understanding the web's underlying protocols. Free online.", url: "https://hpbn.co/" },
          { text: "TypeScript Handbook - official documentation, well written and comprehensive. Free.", url: "https://www.typescriptlang.org/docs/handbook/intro.html" },
          { text: "ByteByteGo newsletter and YouTube channel - system design breakdowns that are both accurate and approachable.", url: "https://bytebytego.com/" },
          { text: "Total TypeScript - Matt Pocock - the best TypeScript learning resource available. Goes far beyond the basics.", url: "https://www.totaltypescript.com/" },
        ],
      },
      {
        type: "h2",
        text: "Security",
      },
      {
        type: "ol-links",
        items: [
          { text: "OWASP Top 10 - the standard reference for web application security vulnerabilities. Free.", url: "https://owasp.org/www-project-top-ten/" },
          { text: "OWASP IoT Top 10 - same rigour applied to connected devices. Free.", url: "https://owasp.org/www-project-internet-of-things/" },
          { text: "Cryptopals crypto challenges - learn cryptography by breaking intentionally weak implementations. Free and genuinely fun.", url: "https://cryptopals.com/" },
          { text: "LiveOverflow (YouTube) - security concepts explained with real CTF challenges. One of the best security educators on the platform.", url: "https://www.youtube.com/@LiveOverflow" },
        ],
      },
      {
        type: "h2",
        text: "YouTube Channels Worth Your Time",
      },
      {
        type: "ol-links",
        items: [
          { text: "3Blue1Brown - mathematics visualised better than any textbook. Essence of Linear Algebra and Calculus series are essential.", url: "https://www.youtube.com/@3blue1brown" },
          { text: "Fireship - short, dense tech explainers and news. Good for staying across what is happening in the industry.", url: "https://www.youtube.com/@Fireship" },
          { text: "Theo (t3.gg) - web engineering opinions, TypeScript, Next.js and the full-stack JavaScript ecosystem.", url: "https://www.youtube.com/@t3dotgg" },
          { text: "TechLead - ByteByteGo YouTube channel on system design at scale. Architecture decisions explained clearly.", url: "https://www.youtube.com/@ByteByteGo" },
          { text: "Low Level TV - embedded systems, C programming, memory and how hardware-adjacent software actually works.", url: "https://www.youtube.com/@LowLevelTV" },
          { text: "Computerphile - academic computer science concepts made accessible. Good depth without oversimplifying.", url: "https://www.youtube.com/@Computerphile" },
          { text: "Reducible - algorithms and CS theory with some of the best visual explanations anywhere online.", url: "https://www.youtube.com/@Reducible" },
        ],
      },
      {
        type: "h2",
        text: "Tools I Use and Recommend",
      },
      {
        type: "ol-links",
        items: [
          { text: "VS Code - primary editor for most projects. Fast, extensible, excellent TypeScript support.", url: "https://code.visualstudio.com" },
          { text: "JetBrains IDEs - IntelliJ for Java, PyCharm for Python, CLion for C/C++. Better refactoring than VS Code for large codebases.", url: "https://www.jetbrains.com" },
          { text: "Obsidian - local-first notes with bidirectional linking. My second brain for research and learning logs.", url: "https://obsidian.md" },
          { text: "Notion - project planning, meeting notes and anything collaborative. Good for structured reference material.", url: "https://notion.so" },
          { text: "Figma - wireframing and UI design before writing frontend code. Thinking visually before committing saves time.", url: "https://figma.com" },
          { text: "Excalidraw - fast whiteboard diagrams for system design sketches. No account needed.", url: "https://excalidraw.com/" },
          { text: "Regex101 - build and test regular expressions with step-by-step explanation of each match.", url: "https://regex101.com/" },
          { text: "Codeforces - competitive programming practice. Consistent practice here builds algorithm intuition faster than anything else.", url: "https://codeforces.com/" },
          { text: "MDN Web Docs - the authoritative web platform reference. Go here before Stack Overflow.", url: "https://developer.mozilla.org/" },
        ],
      },
      {
        type: "p",
        text: "For a broader view of what I am currently reading, watching and working through, visit the consumed page.",
      },
      {
        type: "ol-links",
        items: [
          { text: "Consumed - what I am currently reading, watching and working through", url: "/consumed" },
        ],
      },
      {
        type: "h2",
        text: "Must Watch",
      },
      {
        type: "video",
        youtubeId: "iE7YRHxwoDs",
        title: "From Nand to Tetris - Shimon Schocken (TED)",
        description: "Building a computer from first principles - logic gates to a working OS. The best introduction to how computers actually work.",
      },
      {
        type: "video",
        youtubeId: "UF8uR6Z6KLc",
        title: "Stay Hungry, Stay Foolish - Steve Jobs Stanford 2005",
        description: "The most important 15 minutes of career advice ever given. Watch this when you need reminding why you build things.",
      },
    ],
  },

  // ── DRAFTS ────────────────────────────────────────────────────────────────────
  {
    slug: "iot-security-gaps",
    title: "Security Gaps in Consumer IoT: A Survey of Common Attack Vectors",
    date: "2025-11-30",
    type: "research",
    cover_image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80",
    description:
      "A technical review of the most common vulnerabilities in consumer IoT devices: hardcoded credentials, unencrypted traffic, insufficient update mechanisms and insecure interfaces, with reference to real incidents, CVEs and regulatory standards.",
    tags: ["IoT", "Security", "Research", "Embedded", "Networking"],
    readingTime: 14,
    published: true,
    content: [
      {
        type: "p",
        text: "The Internet of Things (IoT) refers to the billions of physical devices connected to the internet: smart speakers, thermostats, security cameras, industrial sensors and medical monitors, all sending and receiving data without direct human interaction. Consumer IoT devices are everywhere and most of them are insecure by design. In 2022 there were over 14 billion connected IoT devices globally, a number that will exceed 25 billion by 2030 according to Statista. Each of those devices is a potential entry point. The security research community has documented the same categories of vulnerability repeatedly for a decade. The problems persist not because they are hard to fix but because market incentives do not reward fixing them.",
      },
      {
        type: "p",
        text: "This post surveys the most common vulnerability classes in consumer IoT, with reference to real incidents and concrete examples. It is not a penetration testing guide. It is a record of what goes wrong, why it keeps going wrong and what the engineering looks like when it is done correctly.",
      },
      {
        type: "h2",
        text: "Hardcoded Credentials",
      },
      {
        type: "p",
        text: "The most common and embarrassing vulnerability in consumer IoT is the hardcoded default credential. A router, IP camera or smart plug ships with a default username and password that is identical across every unit of that model. The Mirai botnet, discovered in 2016, exploited exactly this. It scanned the public IPv4 address space for Telnet on port 23, attempted login with 61 known default username-password pairs compiled from device manuals and firmware dumps and infected approximately 600,000 devices within weeks. The resulting botnet conducted DDoS attacks that peaked at 1.1 Tbps against DNS provider Dyn, taking down Twitter, Spotify, Reddit and dozens of other major services for several hours.",
      },
      {
        type: "p",
        text: "The vulnerability is trivially discoverable. [Shodan](https://www.shodan.io), a search engine that indexes internet-connected devices, returns results for default credentials with simple queries. Researchers at Symantec found in 2019 that 98% of IoT traffic was unencrypted and that the most attacked device types were routers and IP cameras, both categories notorious for unchanged default credentials. The fix is not technically difficult: force credential change at first boot, generate a unique random password per unit or use device-specific secrets derived from hardware identifiers. The reason it does not happen is that it adds friction to unboxing, which affects return rates.",
      },
      {
        type: "h2",
        text: "Unencrypted Traffic",
      },
      {
        type: "p",
        text: "Many IoT devices transmit data in plaintext. Sensor readings, authentication tokens, control commands and firmware update payloads travel over the network without encryption. On an unprotected Wi-Fi network this means any nearby observer can capture and read the traffic with a passive packet capture tool. On the public internet it means any network device between the client and server can inspect or modify the data.",
      },
      {
        type: "p",
        text: "The consequences range from privacy violations to active compromise. A smart thermostat that sends occupancy data in plaintext leaks home presence patterns. An IP camera that streams over unencrypted RTSP exposes live video to anyone on the local network. A smart lock that sends unlock commands without authentication or encryption can be trivially replayed: capture one valid command and you can unlock the door indefinitely.",
      },
      {
        type: "p",
        text: "The KRACK attack (Key Reinstallation Attack, CVE-2017-13077 through 13088) demonstrated that even WPA2 Wi-Fi encryption offers no protection if the device implementation has flaws in the four-way handshake. Devices that relied on Wi-Fi encryption alone and transmitted application data in plaintext remained vulnerable even with encryption nominally in place. The lesson is that transport-layer encryption must be implemented at the application level, not assumed from the network layer.",
      },
      {
        type: "h2",
        text: "Insufficient Update Mechanisms",
      },
      {
        type: "p",
        text: "Firmware vulnerabilities are discovered regularly throughout the lifetime of a product. A device with no OTA update capability remains vulnerable to every vulnerability found after it ships. A 2018 study by Armis found that 48% of IoT devices ran outdated operating system versions and that the average time between vulnerability disclosure and patching on IoT devices was 12 months, compared to 3 days for enterprise software.",
      },
      {
        type: "p",
        text: "The Ripple20 disclosure in 2020 (19 CVEs in the Treck TCP/IP library) affected hundreds of millions of devices including medical equipment, industrial controllers and consumer routers. Many of the affected devices had no update mechanism. Some that did had mechanisms that accepted unsigned firmware, meaning an attacker who could intercept the update delivery could substitute a malicious image. CVE-2020-11896, the most severe Ripple20 vulnerability with a CVSS score of 10.0, allowed unauthenticated remote code execution on affected devices via crafted IPv4 packets.",
      },
      {
        type: "p",
        text: "A secure OTA update mechanism requires: TLS for the download connection, cryptographic signature verification of the firmware binary before applying, rollback protection so a device cannot be downgraded to a known-vulnerable version and a fallback image so a failed update does not brick the device. Each of these adds cost and complexity. None of them are optional for a device with a multi-year expected lifetime.",
      },
      {
        type: "h2",
        text: "Insecure Network Services",
      },
      {
        type: "p",
        text: "Many consumer IoT devices expose network services that serve no user-facing purpose: Telnet on port 23, SSH with a root account and a known password, HTTP management interfaces on port 80 or 8080 with no authentication, UPnP endpoints that can be queried and manipulated from the local network. The attack surface of a device is directly proportional to the number of services it exposes.",
      },
      {
        type: "p",
        text: "The Shodan IoT report consistently finds hundreds of thousands of devices with exposed Telnet, FTP and HTTP management interfaces. In 2021, security researcher Paul Marrapese discovered a vulnerability in Kalay, a cloud platform used by tens of millions of IoT devices including baby monitors and security cameras (CVE-2021-28372). The flaw allowed an attacker who knew a device's UID to intercept authentication and gain live audio and video access. The root cause was an authentication protocol that was designed for ease of setup rather than security.",
      },
      {
        type: "h2",
        text: "Physical Access and Debug Interfaces",
      },
      {
        type: "p",
        text: "Many IoT devices ship with UART debug consoles, JTAG headers or SWD pads populated on the PCB. These are left in production firmware because disabling them requires effort and test infrastructure changes. An attacker with physical access to the device can connect to the UART console and interact with a root shell, read flash memory over JTAG or extract firmware for offline analysis.",
      },
      {
        type: "p",
        text: "The teardown community has documented this extensively. Cheap IP cameras from Aliexpress commonly expose a UART console on unpopulated pads that gives immediate root access. The Ubiquiti EdgeRouter in 2019 was found to have an accessible UART shell that required no authentication. Physical access attacks are not theoretical: they are how most IoT firmware gets dumped for vulnerability research, and they are how attackers gain a persistent foothold on devices they can physically reach.",
      },
      {
        type: "h2",
        text: "The Regulatory Response",
      },
      {
        type: "p",
        text: "Regulation has started to address the worst practices. ETSI EN 303 645, published in 2020, defines a baseline cybersecurity standard for consumer IoT. The 13 provisions include: no universal default passwords, a means to manage reports of vulnerabilities, software should be kept updated, credentials and security-sensitive data shall be stored securely and communication security shall be used. The UK Product Security and Telecommunications Infrastructure Act 2022 made ETSI EN 303 645 compliance a legal requirement for consumer connectable products sold in the UK from April 2024.",
      },
      {
        type: "p",
        text: "The [OWASP](https://owasp.org) IoT Top 10 (2018 edition) provides a complementary checklist of the most critical vulnerability categories: weak passwords, insecure network services, insecure ecosystem interfaces, lack of secure update mechanism, use of insecure or outdated components, insufficient privacy protection, insecure data transfer and storage, lack of device management, insecure default settings and lack of physical hardening.",
      },
      {
        type: "h2",
        text: "What Better Design Looks Like",
      },
      {
        type: "ul",
        items: [
          "Force unique credentials at first boot with a minimum entropy requirement - no shared defaults across units",
          "Encrypt all communications: TLS 1.2 or higher for HTTP and [MQTT](https://mqtt.org), DTLS for constrained devices using CoAP",
          "Sign all firmware images with an asymmetric key pair, verify the signature before applying any update",
          "Implement a secure boot chain: the bootloader verifies the firmware hash before execution",
          "Add rollback protection: a monotonic counter in OTP memory prevents downgrades to known-vulnerable versions",
          "Disable all debug interfaces (UART, JTAG, SWD) in production builds and lock fuse bits where available",
          "Expose only services the device genuinely needs: close every other port and disable every other protocol",
          "Rate-limit authentication attempts and lock accounts after repeated failures",
          "Log security events to a remote syslog or cloud endpoint so anomalies are detectable",
          "Implement certificate pinning for cloud connections so a compromised CA cannot enable man-in-the-middle attacks",
        ],
      },
      {
        type: "quote",
        text: "Security is not a feature you add at the end. It is a constraint you design around from the beginning.",
        source: "Commonly attributed to Bruce Schneier, security researcher",
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "ol-links",
        items: [
          { text: "Krebs on Security: KrebsOnSecurity Hit With Record DDoS (Mirai, 2016)", url: "https://krebsonsecurity.com/2016/09/krebsonsecurity-hit-with-record-ddos/" },
          { text: "Wikipedia: Mirai (malware) - the botnet that exploited default credentials on IoT devices", url: "https://en.wikipedia.org/wiki/Mirai_(malware)" },
          { text: "OWASP IoT Top 10 - the standard vulnerability checklist for connected devices", url: "https://owasp.org/www-project-internet-of-things/" },
          { text: "NIST Cybersecurity for IoT Program - guidance, frameworks and research", url: "https://www.nist.gov/programs-projects/nist-cybersecurity-iot-program" },
          { text: "Wikipedia: Internet of things - Security section covering attack surfaces and regulatory response", url: "https://en.wikipedia.org/wiki/Internet_of_things#Security" },
          { text: "Shodan - the search engine for internet-connected devices", url: "https://www.shodan.io" },
          { text: "Cloudflare DDoS coverage and incident analysis", url: "https://blog.cloudflare.com/tag/ddos/" },
          { text: "JSOF Research: Ripple20 - 19 Zero-Day Vulnerabilities (2020)", url: "https://www.jsof-tech.com/disclosures/ripple20/" },
          { text: "Vanhoef, M. & Piessens, F.: Key Reinstallation Attacks (KRACK) - ACM CCS 2017", url: "https://papers.mathyvanhoef.com/ccs2017.pdf" },
          { text: "NVD: CVE-2021-28372 Kalay Platform vulnerability", url: "https://nvd.nist.gov/vuln/detail/CVE-2021-28372" },
          { text: "ETSI EN 303 645: Cyber Security for Consumer IoT baseline requirements", url: "https://www.etsi.org/committee/1372-cyber" },
          { text: "UK Product Security and Telecommunications Infrastructure Act 2022", url: "https://www.legislation.gov.uk/ukpga/2022/46/contents" },
          { text: "Armis Security Research", url: "https://www.armis.com/research/" },
        ],
      },
    ],
  },
  {
    slug: "spi-vs-i2c",
    title: "SPI vs I2C: When to Use Which",
    date: "2026-01-14",
    type: "research",
    cover_image: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=1200&auto=format&fit=crop&q=80",
    description:
      "A detailed technical comparison of SPI and I2C for embedded projects: signalling, timing, addressing, clock modes, pull-ups, edge cases and when the choice actually matters.",
    tags: ["SPI", "I2C", "Embedded", "Notes", "Protocols"],
    readingTime: 10,
    published: true,
    content: [
      {
        type: "p",
        text: "SPI and I2C are the two serial protocols you will encounter in almost every embedded project. Both transfer data between a microcontroller and peripherals. They solve the same problem in fundamentally different ways and the choice between them has real consequences for speed, pin count, reliability and debugging complexity.",
      },
      {
        type: "p",
        text: "Most tutorials treat this as a simple trade-off: SPI is fast, I2C saves pins. That is true but incomplete. The details matter when a bus locks up at 3am, when two sensors share the same I2C address or when your SPI display stops responding because you chose the wrong clock polarity. This post covers both protocols in enough depth to make those problems understandable.",
      },
      {
        type: "h2",
        text: "SPI: Serial Peripheral Interface",
      },
      {
        type: "image",
        src: "https://upload.wikimedia.org/wikipedia/commons/6/6b/SPI_timing_diagram2.svg",
        alt: "SPI timing diagram showing MOSI, MISO, SCLK and CS signal lines",
        caption: "SPI timing diagram - MOSI and MISO transfer simultaneously on each clock edge. Source: Wikimedia Commons (CC BY-SA 3.0)",
      },
      {
        type: "p",
        text: "SPI was developed by Motorola in the 1980s and is now ubiquitous in embedded systems. It uses four signal lines: MOSI (master out, slave in), MISO (master in, slave out), SCLK (serial clock) and CS (chip select, active low, one per device). The master generates the clock and drives CS low to select a specific slave. Data is shifted out on MOSI and in on MISO simultaneously on every clock edge. This is full-duplex operation: both sides send and receive at the same time.",
      },
      {
        type: "p",
        text: "There is no addressing on the bus itself. The CS line is how you address devices. This keeps the protocol extremely simple but means each additional device requires one additional GPIO pin on the master. With five SPI devices you need five CS pins. Some designs use a daisy-chain topology to share CS but this complicates firmware and is rarely worth the effort.",
      },
      {
        type: "h2",
        text: "SPI Clock Modes",
      },
      {
        type: "p",
        text: "SPI has four clock modes defined by two bits: CPOL (clock polarity) and CPHA (clock phase). CPOL determines the idle state of the clock: 0 means idle low, 1 means idle high. CPHA determines on which clock edge data is sampled: 0 means the leading edge, 1 means the trailing edge. The four combinations are modes 0 through 3.",
      },
      {
        type: "ul",
        items: [
          "Mode 0 (CPOL=0, CPHA=0): clock idle low, data sampled on rising edge - most common",
          "Mode 1 (CPOL=0, CPHA=1): clock idle low, data sampled on falling edge",
          "Mode 2 (CPOL=1, CPHA=0): clock idle high, data sampled on falling edge",
          "Mode 3 (CPOL=1, CPHA=1): clock idle high, data sampled on rising edge",
        ],
      },
      {
        type: "p",
        text: "The mode must match between master and slave. If you configure SPI Mode 0 on your microcontroller and the peripheral expects Mode 3, the data will be garbage and the device will appear to not respond. Always check the peripheral's datasheet. The SD card spec, for example, requires Mode 0. The MAX7219 LED driver works in Mode 0. The BME280 environmental sensor works in both Mode 0 and Mode 3. Getting this wrong is one of the most common causes of SPI not working on a first attempt.",
      },
      {
        type: "code",
        lang: "c",
        text: `// ATmega644P SPI master initialisation - Mode 0, fosc/16
void spi_init(void) {
    // I set MOSI, SCK and SS as outputs; MISO is input by hardware
    DDRB |= (1 << PB5) | (1 << PB7) | (1 << PB4);
    // I enable SPI as master with fosc/16 clock (1.25 MHz at 20 MHz crystal)
    SPCR = (1 << SPE) | (1 << MSTR) | (1 << SPR0);
}

uint8_t spi_transfer(uint8_t data) {
    SPDR = data;
    // I wait for transmission complete flag
    while (!(SPSR & (1 << SPIF)));
    return SPDR;
}`,
      },
      {
        type: "h2",
        text: "I2C: Inter-Integrated Circuit",
      },
      {
        type: "image",
        src: "https://upload.wikimedia.org/wikipedia/commons/3/3e/I2C.svg",
        alt: "I2C bus showing master, multiple slaves, SDA and SCL lines with pull-up resistors",
        caption: "I2C bus topology - multiple devices share two wires with unique 7-bit addresses. Source: Wikimedia Commons (CC BY-SA 3.0)",
      },
      {
        type: "p",
        text: "I2C was designed by Philips Semiconductor (now NXP) in 1982 for connecting low-speed peripherals on a motherboard. It uses two open-drain signal lines: SDA (serial data) and SCL (serial clock). Open-drain means each device can pull the line low but cannot actively drive it high - the lines are pulled high by external resistors, typically 4.7 kΩ for standard mode or 2.2 kΩ for fast mode. This design allows multiple masters and multiple slaves on the same two wires.",
      },
      {
        type: "p",
        text: "Every transaction starts with a START condition (SDA pulled low while SCL is high), followed by a 7-bit device address and a read/write bit. The addressed slave responds with an ACK (pulling SDA low during the ninth clock pulse). Data bytes follow, each acknowledged by the receiver. A STOP condition (SDA released high while SCL is high) ends the transaction. This handshake overhead is why I2C is slower than SPI even at the same clock frequency.",
      },
      {
        type: "h2",
        text: "I2C Address Conflicts",
      },
      {
        type: "p",
        text: "The 7-bit address space allows 128 addresses but 16 are reserved, leaving 112 usable. This is often enough, but address conflicts are a genuine problem. The MPU6050 IMU defaults to address 0x68 and can be moved to 0x69 by pulling its AD0 pin high. The BMP280 pressure sensor defaults to 0x76 or 0x77 depending on a pin. If you need two identical sensors on the same bus, you are limited to two instances at most unless the device supports address selection beyond a single pin.",
      },
      {
        type: "p",
        text: "When debugging I2C address conflicts, an I2C scanner is essential. The following snippet is standard practice on any new board bring-up:",
      },
      {
        type: "code",
        lang: "c",
        text: `// I2C scanner for ATmega: probes all 128 addresses and prints which respond
#include <util/twi.h>

void i2c_scan(void) {
    for (uint8_t addr = 1; addr < 128; addr++) {
        TWBR = 72;  // 100 kHz at 16 MHz
        TWCR = (1 << TWINT) | (1 << TWSTA) | (1 << TWEN);
        while (!(TWCR & (1 << TWINT)));
        if ((TWSR & 0xF8) != TW_START) continue;

        TWDR = (addr << 1) | TW_WRITE;
        TWCR = (1 << TWINT) | (1 << TWEN);
        while (!(TWCR & (1 << TWINT)));

        if ((TWSR & 0xF8) == TW_MT_SLA_ACK) {
            printf("Device at 0x%02X\\r\\n", addr);
        }
        TWCR = (1 << TWINT) | (1 << TWEN) | (1 << TWSTO);
    }
}`,
      },
      {
        type: "h2",
        text: "Clock Stretching and Bus Hangs",
      },
      {
        type: "p",
        text: "I2C slaves are permitted to hold SCL low to pause a transaction while they prepare data. This is called clock stretching. Most microcontroller I2C peripherals handle it automatically. The problem arises when a slave stretches the clock indefinitely - usually because a transaction was interrupted mid-way, leaving the slave in an indeterminate state. The bus hangs and neither master nor slave can reset it through normal means.",
      },
      {
        type: "p",
        text: "The standard recovery procedure is to manually toggle SCL nine times with SDA held high, then issue a STOP condition. This forces any stuck slave to release SDA. On microcontrollers without hardware support for this, you need to bit-bang the recovery sequence in software before reinitialising the I2C peripheral. This is a known issue with the STM32 HAL I2C driver and was a documented errata item on several STM32 families for years.",
      },
      {
        type: "h2",
        text: "Pull-up Resistors",
      },
      {
        type: "p",
        text: "I2C requires pull-up resistors on both SDA and SCL. The correct value depends on bus capacitance and clock speed. The I2C specification defines the maximum rise time as 1000 ns for standard mode (100 kHz) and 300 ns for fast mode (400 kHz). Bus capacitance includes PCB trace capacitance, device pin capacitance and cable capacitance if applicable.",
      },
      {
        type: "p",
        text: "For a typical short PCB trace with two or three devices, 4.7 kΩ works reliably at 100 kHz. For fast mode or longer buses, reduce to 2.2 kΩ or 1 kΩ. Pull-ups that are too weak (too high resistance) cause slow rise times and unreliable ACKs. Pull-ups that are too strong (too low resistance) increase power consumption and can violate device input voltage specs. Most I2C development boards include 4.7 kΩ pull-ups on the bus lines, which is why breadboard I2C usually just works.",
      },
      {
        type: "h2",
        text: "Comparison Table",
      },
      {
        type: "ul",
        items: [
          "SPI wires: 4 minimum (MOSI, MISO, SCLK, CS) plus one CS per additional device",
          "I2C wires: 2 (SDA, SCL) regardless of device count",
          "SPI speed: 1-50+ MHz depending on devices and layout",
          "I2C speed: 100 kHz standard, 400 kHz fast, 1 MHz fast-plus, 3.4 MHz high-speed",
          "SPI duplex: full - read and write simultaneously",
          "I2C duplex: half - one direction at a time",
          "SPI addressing: via CS pin (hardware select)",
          "I2C addressing: via 7-bit address in protocol (software select)",
          "SPI ACK: none - no confirmation of receipt",
          "I2C ACK: every byte acknowledged by receiver",
          "SPI use cases: displays, SD cards, high-speed ADCs, flash memory",
          "I2C use cases: temperature sensors, IMUs, EEPROMs, RTCs, DACs",
        ],
      },
      {
        type: "h2",
        text: "How to Choose",
      },
      {
        type: "p",
        text: "Use SPI when throughput matters. Streaming data from a display, logging to an SD card or reading a high-speed ADC all demand the bandwidth SPI provides. Use I2C when you have several low-bandwidth configuration or sensor devices and pin count is a constraint. A typical node in a [Phaemos](/projects/phaemos) sensor board uses I2C for the BME280 environmental sensor and the DS3231 RTC (three devices, two wires total) and SPI for the W25Q flash memory (high-speed writes, full-duplex).",
      },
      {
        type: "p",
        text: "If a device is available in both, choose based on the application. Identical devices on the same bus favour SPI because you are not constrained by address space. High pin-count microcontrollers with many SPI peripherals available lean towards SPI for simplicity. Battery-powered systems sometimes prefer I2C because the open-drain bus can be powered down more cleanly.",
      },
      {
        type: "quote",
        text: "The best protocol is the one that does not hang at 3am.",
        source: "Practical embedded engineering lesson",
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "ol-links",
        items: [
          { text: "NXP I2C-bus specification and user manual UM10204 Rev 7.0 (2021)", url: "https://www.nxp.com/docs/en/user-guide/UM10204.pdf" },
          { text: "Wikipedia: Serial Peripheral Interface (SPI) - protocol overview, timing diagrams and variants", url: "https://en.wikipedia.org/wiki/Serial_Peripheral_Interface" },
          { text: "Wikipedia: I2C - protocol history, addressing and electrical characteristics", url: "https://en.wikipedia.org/wiki/I%C2%B2C" },
          { text: "SparkFun: Serial Peripheral Interface (SPI) tutorial", url: "https://learn.sparkfun.com/tutorials/serial-peripheral-interface-spi" },
          { text: "SparkFun: I2C tutorial - wiring, pull-ups and addressing", url: "https://learn.sparkfun.com/tutorials/i2c" },
          { text: "AVR151: Setup and Use of the SPI - Microchip application note", url: "https://ww1.microchip.com/downloads/en/AppNotes/Atmel-2585-Setup-and-Use-of-the-SPI_ApplicationNote_AVR151.pdf" },
          { text: "AVR315: Using the TWI Module as I2C Master - Microchip application note", url: "https://ww1.microchip.com/downloads/en/AppNotes/doc2564.pdf" },
          { text: "Analog Devices tutorials and application notes - I2C and SPI reference material", url: "https://www.analog.com/en/resources/technical-articles.html" },
          { text: "ATmega644P datasheet - USART and SPI sections", url: "https://ww1.microchip.com/downloads/en/DeviceDoc/ATmega644P-Datasheet.pdf" },
        ],
      },
    ],
  },

  // ── DRAFT: UART ──────────────────────────────────────────────────────────────
  {
    slug: "uart-bare-metal",
    title: "UART From Scratch: Serial Communication Without a Library",
    date: "2026-06-01",
    type: "research",
    cover_image: "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=1200&auto=format&fit=crop&q=80",
    description:
      "How to set up UART on an AVR microcontroller using bare metal C, configure baud rate registers, transmit and receive bytes and debug embedded systems over a serial monitor.",
    tags: ["UART", "Embedded", "AVR", "C", "Serial"],
    readingTime: 13,
    published: true,
    content: [
      {
        type: "p",
        text: "UART (Universal Asynchronous Receiver-Transmitter) is the oldest and most universally supported serial communication protocol in embedded systems. Every microcontroller has at least one UART peripheral. It requires only two wires: TX (transmit) and RX (receive). And once you have it working, debugging embedded firmware becomes dramatically easier because you can print register values, state machine transitions and error codes to a serial monitor in real time.",
      },
      {
        type: "p",
        text: "This post covers setting up UART on an ATmega644P from scratch using bare metal C with no framework. The same principles apply to any AVR and, with minor register name differences, to most other microcontroller families.",
      },
      {
        type: "h2",
        text: "How UART Works",
      },
      {
        type: "p",
        text: "UART is asynchronous: there is no shared clock signal between sender and receiver. Instead both sides agree on a baud rate (bits per second) in advance and each uses its own internal clock to time the bit periods. A standard UART frame consists of a start bit (logic low), 5-8 data bits (LSB first by default), an optional parity bit and one or two stop bits (logic high). The most common configuration is 8N1: eight data bits, no parity, one stop bit.",
      },
      {
        type: "p",
        text: "The start bit is how the receiver knows a frame has begun: the line is normally held high (idle) and a falling edge signals the start of transmission. The receiver samples each data bit at the midpoint of its bit period. Getting the baud rate right is critical: even a 2% error in baud rate can cause the receiver to sample at the wrong point and corrupt data, especially at higher baud rates or over longer bit sequences.",
      },
      {
        type: "h2",
        text: "Baud Rate Calculation",
      },
      {
        type: "p",
        text: "The ATmega644P UART baud rate is set by loading the UBRR (USART Baud Rate Register) with a value derived from the system clock and the desired baud rate. In normal speed mode (U2X = 0), the formula is: UBRR = (F_CPU / (16 * BAUD)) - 1. At 20 MHz and 9600 baud this gives 129.2, rounding to 129 for a 0.2% error. At 115200 baud it gives 9.85, rounding to 10 for a 1.4% error. The ATmega644P datasheet includes a table of UBRR values for common baud rates and crystal frequencies with the resulting error percentage.",
      },
      {
        type: "code",
        lang: "c",
        text: `#define F_CPU 20000000UL
#define BAUD  9600
#define UBRR_VAL ((F_CPU / (16UL * BAUD)) - 1)

void uart_init(void) {
    // I load the baud rate register (split across two 8-bit registers)
    UBRR0H = (uint8_t)(UBRR_VAL >> 8);
    UBRR0L = (uint8_t)(UBRR_VAL);
    // I enable transmitter and receiver
    UCSR0B = (1 << TXEN0) | (1 << RXEN0);
    // I set frame format: 8 data bits, 1 stop bit, no parity (8N1)
    UCSR0C = (1 << UCSZ01) | (1 << UCSZ00);
}`,
      },
      {
        type: "h2",
        text: "Transmitting and Receiving",
      },
      {
        type: "p",
        text: "Transmitting a byte requires waiting for the transmit buffer to be empty (UDRE0 flag in UCSR0A), then writing the byte to UDR0. Receiving a byte requires waiting for the receive complete flag (RXC0) to be set, then reading from UDR0. Both operations can be done by polling (blocking until ready) or by interrupt (the USART fires an interrupt when the buffer is ready).",
      },
      {
        type: "code",
        lang: "c",
        text: `void uart_tx(uint8_t byte) {
    // I wait until the transmit buffer is empty before loading the next byte
    while (!(UCSR0A & (1 << UDRE0)));
    UDR0 = byte;
}

uint8_t uart_rx(void) {
    // I wait for the receive complete flag then read the received byte
    while (!(UCSR0A & (1 << RXC0)));
    return UDR0;
}

// I wrap uart_tx for printf compatibility via stdout stream
int uart_putchar(char c, FILE *stream) {
    (void)stream;
    if (c == '\\n') uart_tx('\\r');
    uart_tx((uint8_t)c);
    return 0;
}`,
      },
      {
        type: "h2",
        text: "Connecting printf to UART",
      },
      {
        type: "p",
        text: "AVR-libc supports redirecting stdout to a custom stream, which allows printf to output over UART. This is invaluable for debugging. The fdev_setup_stream macro creates a FILE struct backed by a custom putchar function.",
      },
      {
        type: "code",
        lang: "c",
        text: `#include <stdio.h>

FILE uart_stdout = FDEV_SETUP_STREAM(uart_putchar, NULL, _FDEV_SETUP_WRITE);

int main(void) {
    uart_init();
    stdout = &uart_stdout;
    // I can now use printf directly over UART
    printf("ATmega644P UART ready at %lu baud\\r\\n", (unsigned long)BAUD);
    // ...
}`,
      },
      {
        type: "h2",
        text: "Common Problems",
      },
      {
        type: "ul",
        items: [
          "Garbage output: baud rate mismatch between device and terminal - check F_CPU matches your crystal and BAUD matches your terminal setting",
          "Nothing received: TX and RX wires swapped - the device TX connects to the USB-UART adapter RX and vice versa",
          "Missing characters at high baud rates: interrupt-driven RX is safer than polling for rates above 9600 if the main loop is slow",
          "Floating RX pin: if the RX pin is unconnected, pull it to VCC with a resistor to prevent spurious characters from electrical noise",
          "UART conflicts with bootloader: some bootloaders use UART for programming - ensure they have finished before your application claims the peripheral",
        ],
      },
      {
        type: "h2",
        text: "Interrupt-Driven Receive",
      },
      {
        type: "p",
        text: "Polling for received bytes blocks the CPU. If your main loop is doing anything meaningful, polling is impractical above 9600 baud because you will miss bytes while the CPU is busy. The alternative is the receive complete interrupt: UART fires USART_RX_vect when a byte arrives. The ISR copies it into a ring buffer. The main loop reads from the buffer independently. The UART hardware and your application code run concurrently.",
      },
      {
        type: "code",
        lang: "c",
        text: `#define RX_BUF_SIZE 64

volatile uint8_t rx_buf[RX_BUF_SIZE];
volatile uint8_t rx_head = 0, rx_tail = 0;

// I enable the receive complete interrupt in uart_init:
//   UCSR0B |= (1 << RXCIE0);
//   sei();

ISR(USART0_RX_vect) {
    uint8_t next = (rx_head + 1) % RX_BUF_SIZE;
    if (next != rx_tail) {          // only store if not full
        rx_buf[rx_head] = UDR0;
        rx_head = next;
    }
    // If full: byte is silently dropped. For robust systems,
    // set a flag and handle the overflow in the main loop.
}

uint8_t uart_rx_available(void) {
    return rx_head != rx_tail;
}

uint8_t uart_rx_read(void) {
    while (!uart_rx_available());   // block until data arrives
    uint8_t b = rx_buf[rx_tail];
    rx_tail = (rx_tail + 1) % RX_BUF_SIZE;
    return b;
}`,
      },
      {
        type: "h2",
        text: "Baud Rate Accuracy and Double Speed Mode",
      },
      {
        type: "p",
        text: "Standard mode divides the clock by 16 per baud period. Double speed mode (U2X = 1 in UCSR0A) divides by 8, which gives a finer baud rate resolution at high clock frequencies. The formula becomes: UBRR = (F_CPU / (8 * BAUD)) - 1. At 20 MHz and 115200 baud, normal mode gives UBRR = 10 with 1.4% error. Double speed mode gives UBRR = 20 with 1.4% error too in this case, but at other clock/baud combinations U2X significantly reduces the error. The ATmega datasheet has a comparison table for both modes.",
      },
      {
        type: "p",
        text: "UART tolerates approximately ±2-3% baud rate error in practice. Beyond that, the receiver samples at the wrong point within a bit period, causing occasional bit errors that accumulate over a multi-byte frame. If you are getting intermittent corrupted data at higher baud rates, recalculate your UBRR value and check the actual error percentage in the datasheet table. Changing the crystal frequency is often the cleanest fix.",
      },
      {
        type: "h2",
        text: "Debugging with an Oscilloscope",
      },
      {
        type: "p",
        text: "When UART is completely silent or producing garbage, an oscilloscope is the right tool. Connect the probe to the TX pin and send a known byte. A correctly functioning UART at 9600 baud will show a pulse approximately 104 microseconds wide for each bit period. Count the bits: start bit (low), then 8 data bits, then stop bit (high). If the pulse widths look wrong, the baud rate register is incorrect or F_CPU does not match the actual clock. If you see nothing at all, the TX pin may not be the correct pin or the UART peripheral clock is not enabled.",
      },
      {
        type: "p",
        text: "A logic analyser is even more useful because it can decode UART frames automatically. Most sub-£20 logic analysers support UART decoding in [PulseView](https://sigrok.org/wiki/PulseView) or similar software. Set the baud rate, capture the TX line during transmission and the decoded bytes appear in the interface. This makes it immediately obvious if you are sending the right bytes but with a baud rate mismatch, or if the data itself is wrong.",
      },
      {
        type: "h2",
        text: "UART in the avr-zac Project",
      },
      {
        type: "p",
        text: "The [avr-zac](https://github.com/zaccesss/avr-zac) LED controller uses UART for a debugging interface: a command-line style protocol where you can send single-character commands over the serial monitor to jump to any of the nine display modes, adjust brightness parameters and query the current state. This is entirely enabled by the printf-over-UART setup described above. During development it eliminated most of the guess-and-check cycle that bare-metal embedded debugging otherwise requires. The ability to print 'mode=4 brightness=187' to the terminal and have it appear in real time is worth the two hours of UART setup.",
      },
      {
        type: "quote",
        text: "The serial monitor is the oscilloscope of firmware development.",
        source: "Embedded engineering maxim",
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "ol-links",
        items: [
          { text: "ATmega644P datasheet - Section 19: USART0/1 (Microchip Technology)", url: "https://ww1.microchip.com/downloads/en/DeviceDoc/ATmega644P-Datasheet.pdf" },
          { text: "Wikipedia: Universal asynchronous receiver-transmitter (UART) - protocol overview and history", url: "https://en.wikipedia.org/wiki/Universal_asynchronous_receiver-transmitter" },
          { text: "Wikipedia: Baud - definition and relationship to bit rate", url: "https://en.wikipedia.org/wiki/Baud" },
          { text: "AVR306: Using the AVR UART in C - Microchip application note", url: "https://ww1.microchip.com/downloads/en/AppNotes/doc1451.pdf" },
          { text: "AVR-libc reference manual: Standard IO facilities and fdev_setup_stream", url: "https://www.nongnu.org/avr-libc/user-manual/group__avr__stdio.html" },
          { text: "PulseView / sigrok - open-source logic analyser software for decoding UART frames", url: "https://sigrok.org/wiki/PulseView" },
          { text: "avr-zac repository - the project where UART debugging is used in practice", url: "https://github.com/zaccesss/avr-zac" },
          { text: "FTDI: USB to Serial Converter application notes", url: "https://ftdichip.com/document/application-notes/" },
        ],
      },
    ],
  },

  // ── DRAFT: RTOS INTRO ────────────────────────────────────────────────────────
  {
    slug: "rtos-fundamentals",
    title: "What an RTOS Actually Does: Tasks, Scheduling and Why It Matters",
    date: "2026-06-15",
    type: "research",
    cover_image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format&fit=crop&q=80",
    description:
      "A practical introduction to real-time operating systems: what a task scheduler does, why timing guarantees matter in embedded systems and how FreeRTOS implements preemptive multitasking on a microcontroller.",
    tags: ["RTOS", "FreeRTOS", "Embedded", "C", "Scheduling"],
    readingTime: 15,
    published: true,
    content: [
      {
        type: "p",
        text: "Most embedded tutorials run everything in a single main loop with a series of if statements and delay calls. For a blinking LED or a simple sensor read, this works fine. For a system that must respond to a button press within 10ms while simultaneously reading a sensor at 100Hz and transmitting over UART, the bare super-loop breaks down. This is the problem a real-time operating system (RTOS) solves.",
      },
      {
        type: "p",
        text: "An RTOS is not a full operating system in the Linux sense. It does not manage a filesystem, run processes with virtual memory or handle arbitrary user applications. It does one thing: schedule tasks on a single processor in a way that gives each task predictable timing guarantees. That predictability is what real-time means in RTOS - not fast, but guaranteed to meet deadlines.",
      },
      {
        type: "p",
        text: "A real-time operating system (RTOS) is software that guarantees a computer will respond to events within a fixed time limit. Unlike a general-purpose OS like Windows or Linux, which optimises for average performance, an RTOS optimises for predictability: it can guarantee that a specific task will start within a defined deadline, even when many other tasks are running simultaneously.",
      },
      {
        type: "h2",
        text: "Tasks and the Scheduler",
      },
      {
        type: "p",
        text: "In [FreeRTOS](https://www.freertos.org) (the most widely used open-source RTOS), a task is a function with its own stack and execution state. Each task has a priority from 0 (lowest) to configMAX_PRIORITIES-1 (highest). The scheduler runs the highest-priority task that is ready to execute. If a higher-priority task becomes ready while a lower-priority task is running, the scheduler preempts the running task immediately and switches to the higher-priority one. This is preemptive multitasking.",
      },
      {
        type: "p",
        text: "The context switch happens at a configurable tick rate, typically 1000 Hz (every 1ms). On each tick, the scheduler checks whether a higher-priority task has become ready and if so performs a context switch: saves the current task's register state and stack pointer, loads the next task's state and resumes execution. The context switch overhead on a Cortex-M4 is typically under 10 microseconds including all register saves.",
      },
      {
        type: "h2",
        text: "Why Timing Guarantees Matter",
      },
      {
        type: "p",
        text: "Consider a system controlling a brushless motor driver. The current control loop must run at exactly 20 kHz: 50 microseconds between iterations. If the control loop runs late by even 20 microseconds, the motor current overshoots and can trigger an overcurrent fault or damage windings. In a bare super-loop, any task that takes longer than expected delays every subsequent task. An RTOS with a high-priority task for the control loop and a dedicated timer interrupt guarantees the loop runs on time regardless of what lower-priority tasks are doing.",
      },
      {
        type: "p",
        text: "Hard real-time systems have deadlines that must never be missed: a missed deadline is a system failure. Soft real-time systems have deadlines that should usually be met but occasional misses are acceptable. Consumer electronics are typically soft real-time. Industrial motor controllers and flight control systems are hard real-time. FreeRTOS is suitable for soft real-time and many hard real-time applications when correctly configured.",
      },
      {
        type: "h2",
        text: "Creating Tasks in FreeRTOS",
      },
      {
        type: "code",
        lang: "c",
        text: `#include "FreeRTOS.h"
#include "task.h"

// I run the sensor read at high priority so it is never delayed by lower tasks
void sensor_task(void *pvParameters) {
    (void)pvParameters;
    TickType_t xLastWakeTime = xTaskGetTickCount();
    const TickType_t xPeriod = pdMS_TO_TICKS(10);  // 100 Hz

    for (;;) {
        read_sensor_and_store();
        // I use vTaskDelayUntil instead of vTaskDelay to keep the period exact
        vTaskDelayUntil(&xLastWakeTime, xPeriod);
    }
}

// I run the display update at lower priority - a missed frame is not critical
void display_task(void *pvParameters) {
    (void)pvParameters;
    for (;;) {
        render_display_frame();
        vTaskDelay(pdMS_TO_TICKS(33));  // ~30 fps
    }
}

int main(void) {
    hardware_init();
    xTaskCreate(sensor_task,  "Sensor",  256, NULL, 3, NULL);
    xTaskCreate(display_task, "Display", 512, NULL, 1, NULL);
    vTaskStartScheduler();
    // I never reach here if the scheduler started successfully
    for (;;);
}`,
      },
      {
        type: "h2",
        text: "Queues and Inter-Task Communication",
      },
      {
        type: "p",
        text: "Tasks running concurrently need to share data safely. Accessing a global variable from two tasks without synchronisation is a race condition: if the scheduler preempts a task mid-write, another task may read a partially written value. FreeRTOS provides queues for passing data between tasks safely. A queue is a fixed-size FIFO buffer. One task writes to it (xQueueSend) and another reads from it (xQueueReceive). Both operations can block for a configurable timeout, which avoids busy-waiting.",
      },
      {
        type: "p",
        text: "Mutexes and semaphores protect shared resources. A mutex (mutual exclusion) is a binary semaphore with priority inheritance: if a high-priority task is waiting for a mutex held by a low-priority task, the low-priority task temporarily runs at the high-priority task's priority to release the mutex as quickly as possible. This prevents priority inversion, a scheduling hazard that famously caused the Mars Pathfinder rover to reset repeatedly until the issue was diagnosed in 1997.",
      },
      {
        type: "h2",
        text: "Stack Size and Heap",
      },
      {
        type: "p",
        text: "Each FreeRTOS task has a dedicated stack allocated from the FreeRTOS heap at task creation. Stack overflow is silent by default: if a task overflows its stack, it corrupts adjacent memory and the system behaves unpredictably. FreeRTOS provides a stack overflow hook (vApplicationStackOverflowHook) and a watermark measurement function (uxTaskGetStackHighWaterMark) to detect and debug stack usage. A common practice is to set the stack size generously during development, measure the watermark and reduce it to the minimum safe value before release.",
      },
      {
        type: "h2",
        text: "FreeRTOS Memory Management",
      },
      {
        type: "p",
        text: "FreeRTOS provides five heap implementations (heap_1.c through heap_5.c), each with different trade-offs. heap_1 never frees memory - suitable for systems that create all tasks at startup and never delete them; it is deterministic and has no fragmentation. heap_2 allows freeing but does not coalesce adjacent free blocks, leading to fragmentation over time. heap_4 coalesces adjacent free blocks and is the most commonly used scheme for general-purpose applications. heap_5 extends heap_4 to support non-contiguous memory regions, which matters on microcontrollers with separate fast SRAM banks.",
      },
      {
        type: "p",
        text: "Dynamic allocation inside tasks (malloc, new) is risky in RTOS systems for two reasons: it is not thread-safe by default, and heap fragmentation can cause allocation failures at unpredictable times. The safest approach for production embedded code is to allocate all memory statically at startup using static task creation (xTaskCreateStatic) and static queue buffers, and use heap_1 which never fragments. This trades flexibility for determinism - a good trade in safety-critical applications.",
      },
      {
        type: "h2",
        text: "Task Notifications: A Lighter Alternative to Semaphores",
      },
      {
        type: "p",
        text: "FreeRTOS task notifications (introduced in FreeRTOS 8.2) are a faster, lower-memory alternative to binary semaphores and event groups for many common signalling patterns. Each task has a 32-bit notification value. An ISR or another task can set bits in this value, increment it or write directly to it. The notified task can block waiting for specific bits to be set.",
      },
      {
        type: "code",
        lang: "c",
        text: `// I use task notification instead of a binary semaphore - less overhead,
// no separate semaphore object to allocate or manage.

TaskHandle_t sensor_task_handle;

void dma_complete_isr(void) {
    BaseType_t higher_priority_woken = pdFALSE;
    vTaskNotifyGiveFromISR(sensor_task_handle, &higher_priority_woken);
    portYIELD_FROM_ISR(higher_priority_woken);
}

void sensor_task(void *pvParameters) {
    for (;;) {
        // I block here until the DMA ISR gives the notification
        ulTaskNotifyTake(pdTRUE, portMAX_DELAY);
        process_dma_buffer();
    }
}`,
      },
      {
        type: "h2",
        text: "Tickless Idle and Power Saving",
      },
      {
        type: "p",
        text: "The FreeRTOS tick interrupt fires 1000 times per second by default, even when all tasks are blocked and nothing useful is happening. This costs power. The tickless idle mode suppresses the tick interrupt when the scheduler knows all tasks will remain blocked for N ticks, programs a hardware timer to wake up before the soonest expiry and puts the processor into a low-power sleep state. On STM32 this can reduce current consumption from milliamps to microamps during idle periods.",
      },
      {
        type: "p",
        text: "Enabling tickless idle requires setting configUSE_TICKLESS_IDLE to 1 in FreeRTOSConfig.h and providing a portSUPPRESS_TICKS_AND_SLEEP implementation (or using the one provided for your specific hardware). The implementation must handle the timer programming, sleep entry and wake-up accounting so the RTOS clock remains accurate after waking.",
      },
      {
        type: "h2",
        text: "When Not to Use an RTOS",
      },
      {
        type: "p",
        text: "An RTOS adds overhead: the scheduler, context switch mechanism, stack for each task and the FreeRTOS kernel itself typically add 5-10 KB of flash and a few hundred bytes of RAM on a Cortex-M device. For a microcontroller with 32 KB flash and 2 KB RAM - an ATmega328P, for instance - this is a significant fraction of available resources. For simple systems with one or two periodic tasks and no concurrency requirements, a bare super-loop with well-structured timer interrupts is often the better choice.",
      },
      {
        type: "p",
        text: "The decision rule I use: if the system has three or more concurrent concerns with different timing requirements, if blocking one operation should not block unrelated operations, or if any operation involves waiting for external events (network, sensor, user input) while other work continues - an RTOS is worth the overhead. If the system does one thing repeatedly with a predictable cycle, bare-metal is simpler and will always be simpler.",
      },
      {
        type: "quote",
        text: "An RTOS does not make your system faster. It makes your system predictable.",
        source: "Embedded systems engineering principle",
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "video",
        youtubeId: "Qe_4PAamBO4",
        title: "Operating Systems - Computerphile",
        description: "A clear overview of how operating systems manage processes, scheduling and concurrency: the foundational concepts behind every RTOS.",
      },
      {
        type: "ol-links",
        items: [
          { text: "FreeRTOS: Mastering the FreeRTOS Real Time Kernel (free PDF)", url: "https://www.freertos.org/Documentation/RTOS_book.html" },
          { text: "FreeRTOS official documentation and API reference", url: "https://www.freertos.org/Documentation/RTOS_book.html" },
          { text: "Mars Pathfinder priority inversion bug - Glenn Reeves, JPL (1997)", url: "https://www.rapitasystems.com/blog/what-really-happened-software-mars-pathfinder-spacecraft" },
          { text: "Buttazzo, G.: Hard Real-Time Computing Systems (Springer, 3rd ed.)", url: "https://link.springer.com/book/10.1007/978-1-4614-0676-1" },
          { text: "Joseph Yiu: The Definitive Guide to ARM Cortex-M3 and Cortex-M4 Processors", url: "https://www.sciencedirect.com/book/9780124080829/the-definitive-guide-to-arm-cortex-m3-and-cortex-m4-processors" },
          { text: "Wikipedia: Real-time operating system - background and classification", url: "https://en.wikipedia.org/wiki/Real-time_operating_system" },
          { text: "POSIX.1b real-time extensions (IEEE Std 1003.1b)", url: "https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap02.html" },
          { text: "FreeRTOS stack overflow detection and checking", url: "https://www.freertos.org/Stacks-and-stack-overflow-checking.html" },
          { text: "Making Embedded Systems - Elecia White - chapter on RTOS and task design", url: "https://www.oreilly.com/library/view/making-embedded-systems/9781449308889/" },
        ],
      },
    ],
  },

  // ── PROSTHETICS AND HEALTH TECH ──────────────────────────────────────────────
  {
    slug: "ocular-prosthetics-bionic-vision",
    title: "Bionic Vision and Ocular Prosthetics: Where the Science Actually Stands",
    date: "2026-05-20",
    type: "research",
    cover_image: "https://images.unsplash.com/photo-1501621667575-af81f1f0bacc?w=1200&auto=format&fit=crop&q=80",
    description:
      "A technical survey of retinoblastoma, ocular prosthetics and bionic vision systems: what prosthetic eyes can and cannot do, how retinal implants work and where the engineering challenges in restoring functional vision lie.",
    tags: ["Health Tech", "Prosthetics", "Research", "Bioelectronics", "Vision"],
    readingTime: 12,
    published: true,
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
  },

  // ── SOFTWARE ENGINEERING BLOG ─────────────────────────────────────────────────
  {
    slug: "typescript-patterns-that-actually-matter",
    title: "TypeScript Patterns That Actually Matter in Production",
    date: "2026-04-15",
    type: "blog",
    cover_image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=1200&auto=format&fit=crop&q=80",
    description:
      "The TypeScript features and patterns that have made the biggest practical difference in real codebases: discriminated unions, the satisfies operator, branded types, const assertions and when strict mode actually catches bugs.",
    tags: ["TypeScript", "Software Engineering", "Web", "Best Practices"],
    readingTime: 9,
    published: true,
    content: [
      {
        type: "p",
        text: "[TypeScript](https://www.typescriptlang.org) is not just JavaScript with types sprinkled on top. Used well, it changes how you design code and catches entire categories of bugs before they reach production. Used poorly, it becomes a type annotation layer that everyone works around with any and type assertions. The difference is in which features you reach for and when.",
      },
      {
        type: "p",
        text: "This post covers the patterns I have found most practically useful in real codebases - not theoretical correctness, but genuine reduction in bugs and improvement in maintainability. All examples are drawn from actual code.",
      },
      {
        type: "h2",
        text: "Discriminated Unions Over Boolean Flags",
      },
      {
        type: "p",
        text: "Boolean flags on objects compose badly. An object with isLoading, isError and isSuccess flags can theoretically be in seven states, four of which are invalid. TypeScript cannot help you if you set isLoading: true and isSuccess: true at the same time - both are valid booleans. A discriminated union makes invalid states unrepresentable.",
      },
      {
        type: "code",
        lang: "typescript",
        text: `// I avoid this - 4 invalid states are representable
type BadState = {
  isLoading: boolean
  isError: boolean
  data: User | null
  error: Error | null
}

// I use this instead - only valid states exist
type FetchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: User }
  | { status: "error"; error: Error }

// TypeScript now narrows correctly in exhaustive switch
function render(state: FetchState) {
  switch (state.status) {
    case "loading": return <Spinner />
    case "success": return <UserCard user={state.data} />  // data is User, not User | null
    case "error":   return <ErrorMessage error={state.error} />
    case "idle":    return null
  }
}`,
      },
      {
        type: "h2",
        text: "The satisfies Operator",
      },
      {
        type: "p",
        text: "Introduced in TypeScript 4.9, satisfies validates that a value matches a type without widening the inferred type. This is useful when you want type checking on an object literal but also want TypeScript to infer the precise literal types of each value.",
      },
      {
        type: "code",
        lang: "typescript",
        text: `type Routes = Record<string, { path: string; auth: boolean }>

// With 'as': loses the literal type, path is string not "/dashboard"
const routes1 = {
  dashboard: { path: "/dashboard", auth: true },
} as Routes

// With 'satisfies': validates shape AND preserves literal types
const routes2 = {
  dashboard: { path: "/dashboard", auth: true },
} satisfies Routes

// routes2.dashboard.path is "/dashboard", not string
// routes1.dashboard.path is string`,
      },
      {
        type: "h2",
        text: "Branded Types for Domain Primitives",
      },
      {
        type: "p",
        text: "TypeScript's structural type system means string is string everywhere. A function that takes a UserId accepts any string. A function that takes an Email accepts any string. Swapping them at the call site is a silent bug that TypeScript cannot catch without branded types.",
      },
      {
        type: "code",
        lang: "typescript",
        text: `// I brand primitive types so they are not interchangeable
type UserId = string & { readonly __brand: "UserId" }
type Email  = string & { readonly __brand: "Email"  }

// I provide type-safe constructors that validate before branding
function toUserId(id: string): UserId {
  if (!id.match(/^user_[a-z0-9]{16}$/)) throw new Error("Invalid UserId")
  return id as UserId
}

// Now TypeScript prevents accidentally passing an Email where a UserId is expected
function getUser(id: UserId): Promise<User> { /* ... */ }

const email = "user@example.com" as Email
getUser(email)  // Error: Argument of type 'Email' is not assignable to 'UserId'`,
      },
      {
        type: "h2",
        text: "const Assertions for Literal Inference",
      },
      {
        type: "p",
        text: "When you assign an array or object literal without a type annotation, TypeScript widens the types: [1, 2, 3] becomes number[], not [1, 2, 3]. Adding as const prevents widening and makes the value deeply readonly with literal types inferred throughout.",
      },
      {
        type: "code",
        lang: "typescript",
        text: `const ROLES = ["admin", "editor", "viewer"] as const
type Role = typeof ROLES[number]  // "admin" | "editor" | "viewer"

// I use as const for lookup tables to get precise key/value types
const STATUS_CODES = {
  ok:        200,
  created:   201,
  not_found: 404,
} as const

type StatusCode = typeof STATUS_CODES[keyof typeof STATUS_CODES]  // 200 | 201 | 404`,
      },
      {
        type: "h2",
        text: "Exhaustiveness Checking with never",
      },
      {
        type: "p",
        text: "When switching on a discriminated union, TypeScript can verify you have handled every case if you add a default branch that assigns to never. If a new variant is added to the union and the switch is not updated, the compiler reports an error.",
      },
      {
        type: "code",
        lang: "typescript",
        text: `function assertNever(x: never): never {
  throw new Error("Unhandled case: " + JSON.stringify(x))
}

type Shape = { kind: "circle"; r: number } | { kind: "rect"; w: number; h: number }

function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return Math.PI * s.r ** 2
    case "rect":   return s.w * s.h
    default:       return assertNever(s)  // Error if a new Shape variant is added
  }
}`,
      },
      {
        type: "h2",
        text: "When strict Mode Actually Catches Bugs",
      },
      {
        type: "p",
        text: "strictNullChecks is the single most valuable flag in the strict suite. It catches null/undefined access that would be a runtime TypeError. With it enabled, TypeScript forces you to handle the nullable case: user?.name instead of user.name, the ?. operator becomes not just a convenience but a compiler-enforced contract.",
      },
      {
        type: "p",
        text: "noUncheckedIndexedAccess is not in strict by default but is worth enabling. Without it, array[0] has type T even if the array is empty. With it, array[0] has type T | undefined, forcing you to handle the out-of-bounds case. This catches a surprisingly common class of bugs in loops and data transformations.",
      },
      {
        type: "quote",
        text: "A type system is most valuable not when it helps you write code but when it stops you writing bad code.",
        source: "TypeScript engineering principle",
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "ol-links",
        items: [
          { text: "TypeScript official documentation and language reference", url: "https://www.typescriptlang.org/docs/" },
          { text: "TypeScript Handbook - the primary guide to TypeScript features", url: "https://www.typescriptlang.org/docs/handbook/intro.html" },
          { text: "TypeScript 4.9 release notes: the satisfies operator", url: "https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html" },
          { text: "Zod - TypeScript-first schema validation library", url: "https://zod.dev" },
          { text: "Matt Pocock: Total TypeScript - advanced TypeScript patterns in depth", url: "https://www.totaltypescript.com/" },
          { text: "TypeScript Deep Dive - Basarat Ali Syed (free online)", url: "https://basarat.gitbook.io/typescript/" },
          { text: "MDN: TypeScript in Svelte - introductory TypeScript in a framework context", url: "https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Client-side_JavaScript_frameworks/Svelte_TypeScript" },
        ],
      },
    ],
  },

  // ── DRAFT: DMA ───────────────────────────────────────────────────────────────
  {
    slug: "dma-bare-metal",
    title: "DMA Explained: Moving Data Without the CPU",
    date: "2026-07-01",
    type: "research",
    cover_image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&auto=format&fit=crop&q=80",
    description:
      "How Direct Memory Access works on microcontrollers, why it matters for high-throughput embedded systems and how to configure a DMA transfer on an STM32 without relying on HAL.",
    tags: ["DMA", "STM32", "Embedded", "C", "Performance"],
    readingTime: 12,
    published: true,
    content: [
      {
        type: "p",
        text: "Every time a microcontroller moves data using the CPU - reading bytes from a UART receive register, filling a display buffer, copying ADC samples into memory - the CPU is doing work that does not require the CPU. Each byte requires a load instruction, a store instruction and a loop iteration. At 1 MHz sample rates or when streaming data to a DAC, this becomes a significant fraction of available CPU time. Direct Memory Access (DMA) is the hardware mechanism that moves data between peripherals and memory without involving the CPU at all.",
      },
      {
        type: "h2",
        text: "How DMA Works",
      },
      {
        type: "p",
        text: "A DMA controller is a dedicated hardware block that sits between the bus and main memory. It has its own internal registers: a source address, a destination address, a transfer count and a configuration register specifying the transfer size (byte, half-word or word), the direction (peripheral to memory, memory to peripheral or memory to memory) and whether addresses should auto-increment after each transfer. The CPU programs these registers then starts the transfer. The DMA controller takes over the bus, moves the data and fires an interrupt when it is done. The CPU is free to do other work throughout.",
      },
      {
        type: "p",
        text: "The performance difference is substantial. Receiving 1024 bytes over SPI in software requires 1024 load-from-SPI-DR operations, 1024 store-to-buffer operations and 1024 loop iterations: roughly 3072 instructions. DMA moves the same 1024 bytes with the CPU executing essentially zero instructions for the transfer itself. On a system running at 72 MHz, this is the difference between occupying the CPU for 43 microseconds and releasing it entirely.",
      },
      {
        type: "p",
        text: "Direct Memory Access (DMA) is a feature built into most modern microcontrollers that lets hardware peripherals transfer data directly to or from RAM without involving the CPU in each byte transfer. Think of it as a dedicated delivery driver for data: you tell it where to pick up (source address), where to drop off (destination address) and how many items to move (transfer count), then it does the work while the CPU handles something else entirely.",
      },
      {
        type: "h2",
        text: "DMA on STM32: Channels and Requests",
      },
      {
        type: "p",
        text: "STM32 microcontrollers have one or two DMA controllers (DMA1 and DMA2 on larger devices), each with multiple channels. Each channel can be triggered by a specific peripheral request: USART1 receive maps to DMA1 Channel 5 on the STM32F103, SPI1 receive maps to DMA1 Channel 2, ADC1 maps to DMA1 Channel 1. These mappings are fixed in hardware and documented in the reference manual. Choosing the wrong channel for a peripheral simply does not work.",
      },
      {
        type: "code",
        lang: "c",
        text: `// I configure DMA1 Channel 5 for USART1 receive on STM32F103
void usart1_dma_rx_init(uint8_t *buf, uint16_t len) {
    RCC->AHBENR |= RCC_AHBENR_DMA1EN;

    DMA1_Channel5->CCR = 0;  // I disable before configuring
    DMA1_Channel5->CPAR  = (uint32_t)&USART1->DR;   // peripheral address
    DMA1_Channel5->CMAR  = (uint32_t)buf;            // memory address
    DMA1_Channel5->CNDTR = len;                      // transfer count
    DMA1_Channel5->CCR   =
        DMA_CCR_MINC   |   // increment memory address after each byte
        DMA_CCR_TCIE   |   // interrupt when transfer complete
        DMA_CCR_EN;        // enable channel

    USART1->CR3 |= USART_CR3_DMAR;  // I enable USART DMA receive request
}`,
      },
      {
        type: "h2",
        text: "Circular Mode and Continuous Sampling",
      },
      {
        type: "p",
        text: "Normal mode DMA stops when the transfer count reaches zero and fires the transfer complete interrupt. Circular mode resets the counter automatically and continues indefinitely. This is the correct mode for continuous ADC sampling: configure DMA in circular mode pointing at a buffer, enable ADC continuous conversion and the DMA controller fills the buffer repeatedly. The CPU can process each completed half-buffer while the DMA fills the other half - a double-buffering pattern that is standard practice in audio and sensor data acquisition.",
      },
      {
        type: "h2",
        text: "Cache Coherency on Cortex-M7",
      },
      {
        type: "p",
        text: "On Cortex-M7 devices (STM32H7 and STM32F7 series) the CPU has data cache. DMA accesses main memory directly, bypassing the cache. If the CPU has cached a region of memory that DMA is writing to, the CPU reads stale data from cache rather than the fresh DMA-written values. The solution is to either place DMA buffers in non-cacheable memory regions (using the MPU or linker script DTCM allocation) or to explicitly invalidate the cache region before reading DMA-written data. Failing to handle this is one of the most common bugs when porting DMA code from Cortex-M4 to Cortex-M7 devices.",
      },
      {
        type: "h2",
        text: "Half-Transfer Interrupt for Double Buffering",
      },
      {
        type: "p",
        text: "Circular DMA with a single buffer creates a race: if the main loop processes bytes too slowly, the DMA controller will overwrite the start of the buffer before the main loop has finished reading it. The solution is double buffering with the half-transfer interrupt. Set up DMA in circular mode with a buffer twice the size you actually need. DMA fires two interrupts: half-transfer complete (HT) when it reaches the midpoint, and transfer complete (TC) when it wraps around. While DMA is writing the second half, your ISR or main loop processes the first half. When DMA writes the first half again, you process the second half. The two halves never conflict.",
      },
      {
        type: "code",
        lang: "c",
        text: `// I use a double buffer with half-transfer and transfer-complete interrupts
#define BUF_SIZE 512  // 256 samples per half

uint16_t adc_buf[BUF_SIZE];
volatile uint8_t half_ready = 0;  // 0 = first half ready, 1 = second half ready

void DMA1_Channel1_IRQHandler(void) {
    if (DMA1->ISR & DMA_ISR_HTIF1) {
        DMA1->IFCR = DMA_IFCR_CHTIF1;
        half_ready = 0;  // first half is ready to process
    }
    if (DMA1->ISR & DMA_ISR_TCIF1) {
        DMA1->IFCR = DMA_IFCR_CTCIF1;
        half_ready = 1;  // second half is ready
    }
}

// In main loop:
if (half_ready == 0) {
    process_samples(adc_buf, BUF_SIZE / 2);          // first half
} else {
    process_samples(adc_buf + BUF_SIZE / 2, BUF_SIZE / 2);  // second half
}`,
      },
      {
        type: "h2",
        text: "Common Pitfalls",
      },
      {
        type: "ul",
        items: [
          "Forgetting to enable the DMA request on the peripheral side - for USART, USART_CR3_DMAR must be set; DMA alone does nothing without the peripheral triggering it",
          "Using the wrong DMA channel - channel-to-peripheral mappings are fixed in hardware and device-specific; the reference manual is the only reliable source",
          "Not enabling the DMA clock - RCC->AHBENR |= RCC_AHBENR_DMA1EN is easy to forget",
          "Cache coherency on Cortex-M7 - placing DMA buffers in cacheable SRAM without invalidating cache before reads; use __attribute__((section('.dma_buf'))) and configure MPU accordingly",
          "Transfer size mismatch - if the peripheral sends 16-bit values and you configure DMA for 8-bit transfers, every value is silently truncated; DMA_CCR_PSIZE and DMA_CCR_MSIZE must match the peripheral register width",
        ],
      },
      {
        type: "quote",
        text: "DMA moves the data. The CPU moves the product.",
        source: "Embedded systems engineering principle",
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "ol-links",
        items: [
          { text: "STM32F4 reference manual (RM0090) - chapters 9 and 10 cover DMA1, DMA2 and their channel/stream mappings", url: "https://www.st.com/resource/en/reference_manual/rm0090-stm32f405415-stm32f407417-stm32f427437-and-stm32f429439-advanced-armbased-32bit-mcus-stmicroelectronics.pdf" },
          { text: "ARM Application Note 321: ARM Cortex-M Programming Guide to Memory Barrier Instructions", url: "https://developer.arm.com/documentation/dai0321/latest" },
          { text: "Making Embedded Systems - Elecia White - chapter 6 covers DMA and memory-mapped peripherals", url: "https://www.oreilly.com/library/view/making-embedded-systems/9781449308889/" },
          { text: "Wikipedia: Direct memory access - overview of DMA architecture", url: "https://en.wikipedia.org/wiki/Direct_memory_access" },
          { text: "Compiler Explorer (Godbolt) - useful for seeing how the compiler handles DMA buffer declarations", url: "https://godbolt.org/" },
          { text: "sigrok and PulseView - open-source logic analyser for verifying DMA timing", url: "https://sigrok.org/wiki/PulseView" },
          { text: "STM32 DMA application notes - AN4031 (ST Microelectronics)", url: "https://www.st.com/resource/en/application_note/an4031-using-the-stm32f2-stm32f4-and-stm32f7-series-dma-controller-stmicroelectronics.pdf" },
        ],
      },
    ],
  },

  // ── DRAFT: FPGA INTRO ────────────────────────────────────────────────────────
  {
    slug: "fpga-vhdl-introduction",
    title: "Getting Started with FPGAs: What They Are and How to Think About Them",
    date: "2026-05-29",
    type: "blog",
    cover_image: "https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=1200&auto=format&fit=crop&q=80",
    description:
      "A beginner-friendly introduction to FPGAs and VHDL: what an FPGA actually is, how it differs from a microcontroller, why hardware description languages feel so different from programming and the mental model shift you need to make sense of it all.",
    tags: ["FPGA", "VHDL", "Embedded", "Hardware", "Digital Logic", "Beginners"],
    readingTime: 14,
    published: true,
    content: [
      {
        type: "p",
        text: "If you have never encountered an FPGA before, the best way to understand what it is is to start with what it is not. It is not a microcontroller. It is not a processor. It does not execute instructions. It does not have a CPU inside. It is something fundamentally different: a chip whose internal logic connections can be reconfigured by the user, effectively letting you build custom hardware circuits using software tools.",
      },
      {
        type: "p",
        text: "An FPGA (Field-Programmable Gate Array) is not a microcontroller. It is not a processor. It is an array of configurable logic blocks connected by a programmable routing fabric. When you program an FPGA you are not writing software that runs on hardware - you are configuring the hardware itself. This distinction is the first thing to internalise and it is the reason FPGA programming feels so different from everything else.",
      },
      {
        type: "h2",
        text: "Before We Start: The Right Mental Model",
      },
      {
        type: "p",
        text: "Think about a standard Arduino program. You write setup() and loop(). The microcontroller executes your code line by line at millions of instructions per second. It reads a sensor, does some maths, writes to a pin. It is fast but fundamentally sequential - it does one thing at a time.",
      },
      {
        type: "p",
        text: "Now imagine instead of programming a chip to do things, you were wiring up a circuit from individual logic gates - AND gates, OR gates, flip-flops - on a breadboard. That circuit does not execute code. It is always on, always computing its output based on its inputs, every cycle simultaneously. Change the inputs and the outputs change instantly. There is no processor reading instructions. The computation is in the wiring itself.",
      },
      {
        type: "p",
        text: "An FPGA is essentially a chip full of those breadboard logic components, except instead of physically wiring them you describe the connections in a hardware description language and a tool called a synthesiser figures out how to configure the chip's internal routing to match your design. The result is real hardware that you designed, running inside a chip.",
      },
      {
        type: "h2",
        text: "What an FPGA Actually Contains",
      },
      {
        type: "p",
        text: "A modern FPGA contains three main types of resources. Logic elements (called LUTs - look-up tables - in most architectures) are small configurable truth tables that implement any boolean function of their inputs. Flip-flops store state. Block RAMs are fixed hard memories typically 18 Kbit or 36 Kbit in size, used for FIFOs, lookup tables and local storage. Higher-end FPGAs also contain DSP blocks (hardware multiplier-adder units), clock management tiles and, on devices like the [Xilinx](https://www.xilinx.com) Zynq, hardened [ARM](https://developer.arm.com) processor cores alongside the programmable fabric.",
      },
      {
        type: "p",
        text: "When you synthesise a VHDL or Verilog design, the synthesis tool maps your logic description onto these physical resources. A 4-input adder might consume four LUTs and five flip-flops. A 1024x8 dual-port RAM maps to a single Block RAM. The number and type of resources available determines what you can fit on a given FPGA. Understanding resource utilisation is as important for FPGA design as understanding memory layout is for embedded software.",
      },
      {
        type: "h2",
        text: "Hardware Description Is Not Programming",
      },
      {
        type: "p",
        text: "The hardest mental shift for a software engineer approaching FPGAs is that VHDL (and Verilog) describe hardware structure, not program execution. In software, you write a sequence of instructions that the processor executes one after another. In VHDL, you describe concurrent logic elements that all operate simultaneously every clock cycle. There is no notion of a function call that takes time to execute - combinational logic propagates instantaneously (subject to propagation delay) and registered logic updates on clock edges.",
      },
      {
        type: "p",
        text: "Consider a 4-bit adder. In C you write: result = a + b. The processor executes this one instruction. In VHDL you describe: the sum output is the bitwise XOR of a and b with carry propagation from bit 0 to bit 3. The synthesis tool maps this to four LUTs with carry chain connections. The adder exists as permanent hardware. It is always computing a + b, every cycle, whether you read the result or not.",
      },
      {
        type: "h2",
        text: "VHDL: The Basic Structure",
      },
      {
        type: "p",
        text: "Every VHDL design has two parts: an entity (the interface - inputs and outputs) and an architecture (the implementation). This separation mirrors the distinction between a component's specification and its realisation, which is useful when the same interface has multiple implementations.",
      },
      {
        type: "code",
        lang: "vhdl",
        text: `-- I define the interface of a simple D flip-flop
entity d_ff is
    port (
        clk : in  std_logic;
        rst : in  std_logic;
        d   : in  std_logic;
        q   : out std_logic
    );
end entity d_ff;

-- I describe the behaviour: register D on rising clock edge, async reset
architecture rtl of d_ff is
begin
    process(clk, rst)
    begin
        if rst = '1' then
            q <= '0';
        elsif rising_edge(clk) then
            q <= d;
        end if;
    end process;
end architecture rtl;`,
      },
      {
        type: "h2",
        text: "Timing Constraints and the Critical Path",
      },
      {
        type: "p",
        text: "In software, performance is measured in instructions per second. In FPGA design, performance is constrained by the critical path: the longest combinational logic path between two registered stages. The maximum clock frequency is determined by how long signals take to propagate through this path. Adding pipeline registers between logic stages shortens each stage's critical path and allows a higher clock frequency at the cost of increased latency. This pipeline design pattern is fundamental to high-performance FPGA implementations.",
      },
      {
        type: "p",
        text: "Timing constraints tell the synthesis and place-and-route tools what clock frequency you require. The tools then attempt to map your design so that all paths meet the constraint. A timing violation - a path that does not meet the constraint - means the design will not work reliably at that frequency. Resolving timing violations is one of the core skills of FPGA engineering.",
      },
      {
        type: "h2",
        text: "When to Use an FPGA",
      },
      {
        type: "p",
        text: "FPGAs are the right tool when you need deterministic timing that a processor cannot guarantee, when you need to process multiple data streams in true parallel or when you need to implement a custom interface at a speed or precision that software cannot achieve. Signal processing, high-frequency trading, radar, SDR (software-defined radio) and video processing are natural FPGA domains. For general control logic, a microcontroller is simpler and cheaper. The decision is always about whether you need the parallelism and timing determinism that only reconfigurable hardware provides.",
      },
      {
        type: "h2",
        text: "A Simple Example: Blinking an LED",
      },
      {
        type: "p",
        text: "The FPGA equivalent of 'Hello World' is blinking an LED. On a microcontroller you write a loop: set pin high, delay, set pin low, delay. On an FPGA you describe a counter that increments every clock cycle and toggles an output when it reaches a certain value. There is no loop. There is no delay function. There is a counter that physically exists in the hardware, always counting, with the LED output permanently connected to its most significant bit.",
      },
      {
        type: "code",
        lang: "vhdl",
        text: `entity blink is
    port (
        clk : in  std_logic;
        led : out std_logic
    );
end entity blink;

-- I blink an LED at ~1 Hz on a 50 MHz board by counting to 2^25
architecture rtl of blink is
    signal counter : unsigned(25 downto 0) := (others => '0');
begin
    process(clk)
    begin
        if rising_edge(clk) then
            counter <= counter + 1;
        end if;
    end process;
    -- I connect the LED to the MSB - no delay calls, just a wire to a bit
    led <= std_logic(counter(25));
end architecture rtl;`,
      },
      {
        type: "h2",
        text: "FPGA vs Microcontroller: Which to Use?",
      },
      {
        type: "ul",
        items: [
          "Use a microcontroller when: you need to run an algorithm, respond to user input, communicate over protocols or control a simple system. An Arduino or STM32 will do this faster to develop and cheaper to buy.",
          "Use an FPGA when: you need to process multiple streams simultaneously, implement a custom high-speed interface, need sub-microsecond deterministic timing or are implementing a signal processing pipeline.",
          "Cost consideration: FPGAs are significantly more expensive. A capable dev board (Xilinx Artix-7 or Intel Cyclone 10) costs £50-300. A microcontroller board costs £5-30. The power of an FPGA needs justifying.",
        ],
      },
      {
        type: "h2",
        text: "Getting Started: Tools and Boards",
      },
      {
        type: "p",
        text: "The two major FPGA vendors are AMD (formerly Xilinx) and Intel (formerly Altera). Both provide free development environments: [Vivado](https://www.xilinx.com/products/design-tools/vivado.html) (AMD, download from amd.com) and Quartus Prime Lite (Intel, download from intel.com). Both are large downloads - 50-80 GB - but the free tiers cover a wide range of entry-level devices. For a beginner board, the Basys 3 (Digilent, Xilinx Artix-7) is the most widely used in university courses. The iCEstick (Lattice iCE40) is a cheaper alternative that works with the fully open-source IceStorm toolchain (Yosys synthesiser plus nextpnr place-and-route), which is easier to understand than Vivado or Quartus. The Nand2Tetris course at nand2tetris.org builds a complete computer from logic gates up and gives you the conceptual foundation that makes VHDL make sense before you write a single line of it.",
      },
      {
        type: "quote",
        text: "An FPGA is a blank canvas of logic. The art is knowing what to draw.",
        source: "Digital design principle",
      },
      {
        type: "h2",
        text: "References and Tools",
      },
      {
        type: "ol-links",
        items: [
          { text: "Wikipedia: Field-programmable gate array - architecture, history and applications", url: "https://en.wikipedia.org/wiki/Field-programmable_gate_array" },
          { text: "Wikipedia: VHDL - hardware description language overview and standard history", url: "https://en.wikipedia.org/wiki/VHDL" },
          { text: "AMD Vivado Design Suite - free download for Xilinx/AMD FPGAs", url: "https://www.amd.com/en/products/software/adaptive-socs-and-fpgas/vivado.html" },
          { text: "Intel Quartus Prime Lite - free download for Intel FPGAs", url: "https://www.intel.com/content/www/us/en/products/details/fpga/development-tools/quartus-prime/resource.html" },
          { text: "Digilent Basys 3 - most widely used FPGA learning board (Xilinx Artix-7)", url: "https://digilent.com/reference/programmable-logic/basys-3/start" },
          { text: "Lattice iCEstick - low-cost iCE40 FPGA with open-source toolchain", url: "https://www.latticesemi.com/icestick" },
          { text: "IceStorm/YosysHQ open-source FPGA toolchain (Yosys + nextpnr)", url: "https://github.com/YosysHQ/icestorm" },
          { text: "VHDL reference manual (UCI) - quick syntax reference", url: "https://www.ics.uci.edu/~jmoorkan/vhdlref/" },
          { text: "Nand2Tetris - build a computer from logic gates to OS, free", url: "https://www.nand2tetris.org/" },
          { text: "nandgame.com - interactive logic gate puzzles that build intuition before writing VHDL", url: "https://nandgame.com" },
          { text: "VHDL Language Reference Manual (IEEE Std 1076-2019)", url: "https://standards.ieee.org/ieee/VHDL/7537/" },
        ],
      },
    ],
  },

  // ── INTERRUPT-DRIVEN DESIGN ───────────────────────────────────────────────────
  {
    slug: "interrupt-driven-embedded-design",
    title: "Interrupt-Driven Design: Writing Non-Blocking Firmware for Microcontrollers",
    date: "2026-07-15",
    type: "blog",
    cover_image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&auto=format&fit=crop&q=80",
    description:
      "Why polling loops kill embedded systems and how to replace them with interrupt service routines. Covers ISR setup, volatile variables, debounce, critical sections and the rules that separate good embedded firmware from bad.",
    tags: ["Embedded", "C", "Microcontroller", "Hardware", "Firmware"],
    readingTime: 9,
    published: true,
    content: [
      {
        type: "p",
        text: "Most beginner embedded tutorials use a polling loop. Check the button, check the sensor, check the flag, repeat. It works when you have one thing to check and nothing else to do. The moment you add a second responsibility, the loop breaks down. While you are waiting for one thing, you miss another.",
      },
      {
        type: "p",
        text: "Interrupt-driven design solves this. Instead of asking the hardware if something happened, you tell the hardware to notify you when it does. Your main loop stays free. The interrupt fires only when it needs to. This is not just an optimisation. For real-time systems it is often a requirement.",
      },
      {
        type: "h2",
        text: "What an Interrupt Actually Is",
      },
      {
        type: "p",
        text: "An interrupt is a hardware signal that pauses the current execution context and jumps to a predefined function called an Interrupt Service Routine, or ISR. When the ISR returns, execution resumes exactly where it left off. The CPU saves and restores the relevant registers automatically. From the perspective of the main loop, the interrupt happened between two instructions.",
      },
      {
        type: "p",
        text: "Every microcontroller has an interrupt vector table: a fixed block of memory at the start of flash that maps each interrupt source to an address. When an interrupt fires, the CPU looks up that table and jumps to the correct handler. On AVR devices, you define an ISR with the ISR() macro from avr-libc. On STM32 you use HAL_NVIC_EnableIRQ() and write a handler with the exact name the linker expects.",
      },
      {
        type: "h2",
        text: "The volatile Keyword",
      },
      {
        type: "p",
        text: "Any variable shared between an ISR and the main loop must be declared volatile. Without it, the compiler assumes the variable cannot change between two reads in the main loop and caches it in a register. When the ISR updates the variable in memory, the main loop never sees the new value. volatile forces the compiler to re-read the variable from memory every time it is accessed.",
      },
      {
        type: "code",
        lang: "c",
        text: `volatile uint8_t mode = 0;  // shared between ISR and main loop

ISR(INT0_vect) {
    mode = (mode + 1) % 9;
}

int main(void) {
    // ...
    while (1) {
        switch (mode) {  // always reads from memory, not a register
            case 0: run_chase(); break;
            case 1: run_blink_all(); break;
            // ...
        }
    }
}`,
      },
      {
        type: "h2",
        text: "Button Debounce in an ISR",
      },
      {
        type: "p",
        text: "Mechanical buttons bounce: the contacts make and break several times in the first millisecond after a press. Without debounce, a single button press registers as multiple interrupts. The simplest software fix is a short delay inside the ISR, which works for low-frequency button presses but is not appropriate for latency-sensitive interrupt handlers.",
      },
      {
        type: "p",
        text: "A better approach is a state-machine debounce in the main loop with a timer interrupt setting a flag. The ISR stays short and fast; the debounce logic runs in the main thread with full access to blocking operations. The choice depends on your system: if you care about response time more than absolute precision, the delay in the ISR is acceptable. If you are building a real-time controller, keep ISRs short.",
      },
      {
        type: "h2",
        text: "Critical Sections",
      },
      {
        type: "p",
        text: "A critical section is a block of code that must not be interrupted mid-way. If the main loop reads a 16-bit variable in two byte-wide operations and the ISR updates that variable between those two reads, the main loop sees a corrupted value. This is called a data race.",
      },
      {
        type: "p",
        text: "On AVR, you protect a critical section by disabling interrupts with cli() before the read and re-enabling with sei() after. On ARM Cortex-M, you use __disable_irq() and __enable_irq() or the LDREX/STREX exclusive access instructions for lock-free patterns. The guiding rule: keep critical sections as short as possible and never block inside one.",
      },
      {
        type: "h2",
        text: "What ISRs Should Not Do",
      },
      {
        type: "ul",
        items: [
          "Call malloc or any function that uses dynamic memory - it is not re-entrant",
          "Block or delay - the ISR must return quickly so other interrupts can fire",
          "Print over UART directly - use a ring buffer instead and drain it from the main loop",
          "Perform floating-point arithmetic on cores without hardware FPU - it is slow and may corrupt FPU state",
          "Access hardware peripherals that require multi-step initialisation",
        ],
      },
      {
        type: "h2",
        text: "A Practical Example: UART Receive Buffer",
      },
      {
        type: "p",
        text: "A common pattern is a ring buffer populated by a UART receive interrupt. Each byte that arrives fires the ISR, which writes the byte into the buffer and advances the write pointer. The main loop reads from the buffer and advances the read pointer independently. This decouples the hardware event rate from the processing rate: the ISR is fast, the main loop can be slow, and no bytes are lost as long as the buffer does not fill.",
      },
      {
        type: "code",
        lang: "c",
        text: `#define BUF_SIZE 64
volatile uint8_t rx_buf[BUF_SIZE];
volatile uint8_t rx_head = 0, rx_tail = 0;

ISR(USART0_RX_vect) {
    uint8_t next = (rx_head + 1) % BUF_SIZE;
    if (next != rx_tail) {      // only write if buffer is not full
        rx_buf[rx_head] = UDR0;
        rx_head = next;
    }
}

uint8_t uart_read(void) {
    while (rx_head == rx_tail);  // block until a byte arrives
    uint8_t b = rx_buf[rx_tail];
    rx_tail = (rx_tail + 1) % BUF_SIZE;
    return b;
}`,
      },
      {
        type: "h2",
        text: "Interrupt Priority and Nesting on ARM Cortex-M",
      },
      {
        type: "p",
        text: "On AVR, interrupts are non-nested by default - a lower-priority interrupt cannot interrupt a higher-priority one without explicitly re-enabling interrupts inside the ISR. ARM Cortex-M is different. The NVIC (Nested Vectored Interrupt Controller) supports true hardware preemption: a higher-priority interrupt can interrupt a lower-priority ISR mid-execution. Priority is configurable per interrupt, with lower numerical values meaning higher priority.",
      },
      {
        type: "p",
        text: "Priority grouping matters. On STM32 devices with 4 priority bits, NVIC_SetPriorityGrouping(3) gives you 4 preemption priority levels and 4 subpriority levels. Subpriority only matters when two interrupts of the same preemption priority fire simultaneously - the one with lower subpriority number runs first. If you have a time-critical ISR (say, a UART byte receive) and a less critical one (say, a timer overcount), set the UART ISR to preemption priority 0 and the timer ISR to priority 3. The UART ISR will always interrupt the timer ISR, but not the reverse.",
      },
      {
        type: "code",
        lang: "c",
        text: `// NVIC priority setup on STM32 - I set this before enabling any interrupts
NVIC_SetPriorityGrouping(3);   // 4 preemption levels, 4 sub-levels

// High priority: UART receive - must not be delayed by anything
NVIC_SetPriority(USART1_IRQn, NVIC_EncodePriority(3, 0, 0));
NVIC_EnableIRQ(USART1_IRQn);

// Low priority: SysTick-based housekeeping
NVIC_SetPriority(TIM2_IRQn, NVIC_EncodePriority(3, 3, 0));
NVIC_EnableIRQ(TIM2_IRQn);`,
      },
      {
        type: "h2",
        text: "Applying This in Practice",
      },
      {
        type: "p",
        text: "In the [avr-zac](https://github.com/zaccesss/avr-zac) project I used INT0 for the mode button with a 50ms debounce delay in the ISR. For a production system I would move the debounce to a timer-based state machine and keep the ISR to a single volatile increment. The principle translates directly to STM32 via HAL GPIO interrupt callbacks and to ESP32 via gpio_isr_handler_add(). The hardware details change but the design pattern does not.",
      },
      {
        type: "p",
        text: "When something seems broken in an interrupt-driven system, the diagnostic checklist is: check that the interrupt is enabled in both the peripheral and NVIC, check that the vector name in the handler exactly matches what the linker expects (a typo results in the default_handler running instead, often resetting the device), and check that volatile is on every shared variable. Most interrupt bugs are one of these three.",
      },
      {
        type: "video",
        youtubeId: "F6Ipn7gCOsY",
        title: "How do interrupts work? - Ben Eater",
        description: "Ben Eater's clear, low-level explanation of how interrupts work in hardware, covering the interrupt vector, context switching and how the CPU responds to an interrupt signal.",
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "ol-links",
        items: [
          { text: "ARM Cortex-M3 Technical Reference Manual - section 8 covers the NVIC", url: "https://developer.arm.com/documentation/ddi0337/latest" },
          { text: "Wikipedia: Interrupt - hardware and software interrupt overview", url: "https://en.wikipedia.org/wiki/Interrupt" },
          { text: "Microchip AVR Instruction Set Manual - ISRs, RETI and sei/cli behaviour", url: "https://ww1.microchip.com/downloads/en/DeviceDoc/AVR-InstructionSet-Manual-DS40002198.pdf" },
          { text: "Making Embedded Systems - Elecia White - chapter 4: interrupts and their interaction with the main loop", url: "https://www.oreilly.com/library/view/making-embedded-systems/9781449308889/" },
          { text: "Phillip Johnston: Better Embedded System Software - interrupt design patterns", url: "https://embeddedartistry.com/blog/2017/07/26/better-embedded-system-software-chapter-5-interrupts/" },
          { text: "avr-zac project - the ATmega644P project referenced in this post", url: "https://github.com/zaccesss/avr-zac" },
          { text: "Microchip AVR Interrupt Handling application note (AVR004)", url: "https://ww1.microchip.com/downloads/en/AppNotes/doc1493.pdf" },
        ],
      },
    ],
  },

  // ── REAL-TIME WEB DATA ────────────────────────────────────────────────────────
  {
    slug: "real-time-web-data",
    title: "Real-Time Data on the Web: WebSockets, SSE and Long Polling Compared",
    date: "2026-07-20",
    type: "blog",
    cover_image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80",
    description:
      "When to use WebSockets, Server-Sent Events or long polling for real-time data in a web application. A practical comparison covering latency, connection overhead, firewall behaviour and implementation complexity.",
    tags: ["WebSockets", "JavaScript", "Next.js", "Full-Stack", "API"],
    readingTime: 11,
    published: true,
    content: [
      {
        type: "p",
        text: "Real-time data on the web means updates appear in the browser within milliseconds of happening on the server, without the user having to refresh the page. Think of a live sports score, a chat message or a sensor reading updating in front of you. Making this work requires the server to push data to the browser proactively, rather than waiting for the browser to ask for it.",
      },
      {
        type: "p",
        text: "Every real-time feature on the web reduces to the same question: how does new data get from the server to the browser without the browser asking for it? There are three standard answers: long polling, Server-Sent Events and WebSockets. They each make different trade-offs and the right choice depends on your specific constraints.",
      },
      {
        type: "h2",
        text: "Long Polling",
      },
      {
        type: "p",
        text: "Long polling works over standard HTTP. The browser sends a request, the server holds it open until it has new data, then responds. The browser immediately sends another request. It looks like a real-time connection but it is really a sequence of requests with minimal delay between them.",
      },
      {
        type: "p",
        text: "The advantage is simplicity: it works everywhere HTTP works, requires no special server support and passes through every proxy and firewall without issue. The disadvantage is overhead: each response requires a new request, which means repeated HTTP handshakes and headers. For high-frequency updates (more than a few per second) this overhead becomes significant.",
      },
      {
        type: "h2",
        text: "Server-Sent Events",
      },
      {
        type: "p",
        text: "Server-Sent Events (SSE) is a one-directional streaming protocol over HTTP. The server sends a stream of text/event-stream data; the browser reads it via the EventSource API. The connection stays open. New data is pushed to the browser without a new request.",
      },
      {
        type: "p",
        text: "SSE is the right choice when data flows server-to-client only: live logs, notification feeds, stock prices, sensor telemetry dashboards. The protocol is simple, reconnects automatically on disconnect and works through most proxies. The limitation is directionality: if you need the client to also send data over the same connection, SSE is the wrong tool.",
      },
      {
        type: "code",
        lang: "typescript",
        text: `// Next.js App Router route handler for SSE
export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const send = (data: object) => {
        controller.enqueue(\`data: \${JSON.stringify(data)}\\n\\n\`)
      }
      const interval = setInterval(() => {
        send({ time: Date.now(), value: Math.random() })
      }, 1000)
      return () => clearInterval(interval)
    },
  })
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}`,
      },
      {
        type: "h2",
        text: "WebSockets",
      },
      {
        type: "p",
        text: "WebSockets provide a full-duplex persistent connection between browser and server. Either side can send data at any time. The initial HTTP handshake upgrades the connection to the WebSocket protocol; after that, frames are sent with minimal overhead. This makes WebSockets the right choice for chat applications, collaborative editing, multiplayer games and any feature where the browser also needs to send frequent messages.",
      },
      {
        type: "p",
        text: "The trade-off is complexity. WebSocket connections must be managed on the server side: connection pools, heartbeats, reconnection logic, horizontal scaling across multiple servers. In a serverless environment like Vercel, persistent WebSocket connections require a separate service such as Ably or Pusher because serverless functions terminate after each response.",
      },
      {
        type: "h2",
        text: "What I Use on This Portfolio",
      },
      {
        type: "p",
        text: "The live status cards on the homepage (Spotify, PS5, Discord) use periodic polling rather than WebSockets or SSE. The status changes slowly enough (every few seconds) that the overhead of a persistent connection is not justified. Each card fetches from a Next.js API route that reads from [Upstash](https://upstash.com) Redis, which is kept fresh by a [Cloudflare Worker](https://workers.cloudflare.com) polling the relevant APIs. The result is eventual consistency with a lag of a few seconds, which is acceptable for presence data.",
      },
      {
        type: "p",
        text: "For truly real-time sensor dashboards like the [Phaemos](/projects/phaemos) frontend, SSE makes more sense. The sensor node posts telemetry to the [FastAPI](https://fastapi.tiangolo.com) backend every 5 seconds; the Next.js dashboard could subscribe to an SSE stream from the backend rather than polling an API route every 5 seconds. The trade-off is that SSE requires a persistent server connection, which is straightforward on a dedicated server but requires additional routing on serverless infrastructure.",
      },
      {
        type: "h2",
        text: "SSE Reconnection and Event IDs",
      },
      {
        type: "p",
        text: "One underused feature of SSE is built-in reconnection. If the connection drops, the browser automatically reconnects after a configurable retry interval. If the server sends an `id:` field with each event, the browser sends a `Last-Event-ID` header on reconnect. A well-implemented SSE server can use this to resume from where the client left off - useful for log streaming where you do not want to re-send the entire history.",
      },
      {
        type: "code",
        lang: "typescript",
        text: `// SSE with event IDs and retry interval - client automatically reconnects
export async function GET() {
  let eventId = 0
  const stream = new ReadableStream({
    start(controller) {
      const send = (data: object) => {
        controller.enqueue(\`id: \${eventId++}\\nretry: 3000\\ndata: \${JSON.stringify(data)}\\n\\n\`)
      }
      const interval = setInterval(() => send({ time: Date.now() }), 1000)
      return () => clearInterval(interval)
    },
  })
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  })
}

// Client-side - browser handles reconnection automatically
const source = new EventSource("/api/stream")
source.onmessage = (e) => console.log(JSON.parse(e.data))
source.onerror = () => console.log("reconnecting...")`,
      },
      {
        type: "h2",
        text: "WebSocket Heartbeats and Connection Management",
      },
      {
        type: "p",
        text: "WebSocket connections can silently die. A load balancer or NAT gateway may drop an idle connection without sending a close frame. The browser and server both believe the connection is alive; neither side gets an error until they try to send something. The standard mitigation is a ping-pong heartbeat: the server sends a ping frame every 30 seconds, and the client responds with a pong. If three consecutive pings go unanswered, the server closes the connection and the client reconnects.",
      },
      {
        type: "p",
        text: "Browser WebSocket does not expose the ping/pong API directly - you implement application-level heartbeats with a JSON message. For a managed WebSocket service like Ably or Pusher, heartbeats are handled for you. For a self-managed server using the `ws` library in Node.js, `ws` handles the protocol-level ping/pong automatically if you call `ws.ping()` on the server side.",
      },
      {
        type: "h2",
        text: "Practical Latency Comparison",
      },
      {
        type: "ul",
        items: [
          "Long polling: 50-150ms latency at low load (dominated by HTTP round-trip and server hold time); degrades quickly under load as server connection pools fill",
          "SSE: 5-30ms latency from server push to browser receipt; the persistent TCP connection removes the handshake overhead of polling",
          "WebSockets: 1-10ms message delivery latency once the connection is established; suboptimal for infrequent messages due to the connection management overhead",
          "Serverless note: SSE works on [Vercel](https://vercel.com) and [Cloudflare Workers](https://workers.cloudflare.com) with streaming responses; WebSockets require Durable Objects (Cloudflare) or a dedicated service",
        ],
      },
      {
        type: "video",
        youtubeId: "xMnkRJ6sOZE",
        title: "WebSockets in 100 Seconds - Fireship",
        description: "A fast, accurate overview of the WebSocket protocol: what it is, how the handshake works and when to use it over HTTP alternatives.",
      },
      {
        type: "h2",
        text: "Summary: When to Use Which",
      },
      {
        type: "ul",
        items: [
          "Long polling: simple server, low update frequency, data flows both ways, need to work through restrictive proxies",
          "SSE: server-to-client only, moderate update frequency, want browser reconnection for free, serverless compatible with streaming support",
          "WebSockets: bidirectional real-time communication, high-frequency updates, chat or collaborative features, dedicated server or managed service",
        ],
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "ol-links",
        items: [
          { text: "MDN: Server-Sent Events - EventSource API reference", url: "https://developer.mozilla.org/en-US/docs/Web/API/EventSource" },
          { text: "MDN: WebSocket API - including the Sec-WebSocket-Protocol handshake", url: "https://developer.mozilla.org/en-US/docs/Web/API/WebSocket" },
          { text: "RFC 6455 - The WebSocket Protocol (IETF)", url: "https://datatracker.ietf.org/doc/html/rfc6455" },
          { text: "High Performance Browser Networking - Grigorik - chapter 16 (SSE) and chapter 17 (WebSocket)", url: "https://hpbn.co/server-sent-events-sse/" },
          { text: "Vercel AI SDK streaming documentation - how streaming responses work on edge runtimes", url: "https://sdk.vercel.ai/docs/ai-sdk-ui/streaming" },
          { text: "MDN: Server-Sent Events - Using server-sent events", url: "https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events" },
          { text: "Wikipedia: WebSocket - protocol overview and use cases", url: "https://en.wikipedia.org/wiki/WebSocket" },
        ],
      },
    ],
  },

  // ── READING DATASHEETS ────────────────────────────────────────────────────────
  {
    slug: "reading-datasheets",
    title: "Reading Datasheets: The Skill Nobody Teaches You",
    date: "2026-08-10",
    type: "notes",
    cover_image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1200&auto=format&fit=crop&q=80",
    description:
      "Datasheets are dense, inconsistently structured and written for engineers who already know the terminology. Here is how to navigate them, find what you actually need and use them to debug hardware problems.",
    tags: ["Embedded", "Hardware", "Microcontroller", "Learning", "Electronics"],
    readingTime: 10,
    published: true,
    content: [
      {
        type: "p",
        text: "The first time you open a datasheet it is overwhelming. Hundreds of pages. Tables of register descriptions. Timing diagrams. Electrical characteristics in a dozen conditions. Most beginners close it and look for a tutorial instead. That works until there is no tutorial.",
      },
      {
        type: "p",
        text: "A datasheet is the authoritative reference for a component. Everything it is capable of, every register it has, every timing constraint it requires is in there. Learning to navigate one quickly is one of the most practical skills an embedded engineer can have. It also gives you independence: you can work with any component, not just the ones that have been well-documented by the community.",
      },
      {
        type: "h2",
        text: "Start with the Description and Block Diagram",
      },
      {
        type: "p",
        text: "The first few pages of any datasheet describe what the component is, what it is designed to do and how its internal blocks connect. Read this before anything else. The block diagram tells you which internal subsystems exist and how they relate. This builds the mental model you need to interpret the rest of the document.",
      },
      {
        type: "p",
        text: "For a microcontroller like the ATmega644P, the block diagram shows the CPU core, flash and SRAM, the USART, SPI and I2C peripherals, the ADC, the timers and the I/O ports, and how they all connect to the internal bus. Once you understand the block diagram, you know which chapter to look in for any feature.",
      },
      {
        type: "h2",
        text: "Pin Configuration and Electrical Characteristics",
      },
      {
        type: "p",
        text: "Before connecting anything, check the absolute maximum ratings. Exceeding these permanently damages the component. Then check the recommended operating conditions: supply voltage range, input voltage levels (Vih and Vil for logic high and low), output current limits. These are not suggestions.",
      },
      {
        type: "p",
        text: "A common mistake is connecting a 5V signal to a 3.3V input without checking the datasheet. Many 3.3V devices are not 5V-tolerant. The datasheet will either explicitly state 5V-tolerant on the relevant pins or list a maximum input voltage of VCC + 0.3V, which for a 3.3V device means 3.6V maximum. Exceeding this permanently damages the pin.",
      },
      {
        type: "h2",
        text: "Register Descriptions",
      },
      {
        type: "p",
        text: "Peripherals are configured through registers: memory-mapped locations that control hardware behaviour. A datasheet describes each register with a table showing bit positions, bit names, reset values and a description of what each bit does. Learning to read these tables is the core skill.",
      },
      {
        type: "p",
        text: "For the ATmega644P UART, the UCSR0A register contains the RXC0 bit (receive complete flag) at bit 7 and the TXC0 bit (transmit complete flag) at bit 6. UCSR0B controls RXCIE0 (receive complete interrupt enable), TXCIE0 (transmit complete interrupt enable), RXEN0 (receiver enable) and TXEN0 (transmitter enable). UCSR0C controls the frame format: data bits, parity, stop bits. UBRR0 sets the baud rate. The formula for UBRR0 is in the datasheet with example values for common baud rates at common clock frequencies.",
      },
      {
        type: "h2",
        text: "Timing Diagrams",
      },
      {
        type: "p",
        text: "Timing diagrams show the required sequence and timing of signals for a peripheral to work correctly. For I2C, the diagram shows the START condition (SDA falling while SCL is high), the data bit timing (SDA stable while SCL is high, transitions when SCL is low), and the STOP condition (SDA rising while SCL is high). If your I2C is unreliable, the timing diagram tells you what to measure on an oscilloscope to find the fault.",
      },
      {
        type: "h2",
        text: "How I Use Datasheets in Practice",
      },
      {
        type: "p",
        text: "I keep the PDF open with bookmarks on the pin diagram, the register summary and the section I am currently working on. The register summary is often the most useful page in a microcontroller datasheet: it lists every register in the device with its address and bit layout. Use Ctrl+F to search for register names and bit names. For sensor datasheets, the register map and the I2C address table are where I spend most of my time.",
      },
      {
        type: "h2",
        text: "Errata Sheets and Silicon Revisions",
      },
      {
        type: "p",
        text: "Datasheets document intended behaviour. Errata sheets document the bugs. Every major microcontroller family has an errata document listing silicon bugs that were discovered after tape-out. These are not the same as the datasheet and are often not linked prominently. For STM32, search ST's site for your exact part number followed by 'errata'. For AVR, Microchip maintains errata in a separate document from the datasheet.",
      },
      {
        type: "p",
        text: "A specific example: the STM32F103 has an errata noting that USART baud rate registers must be written in a specific order, and that certain DMA configurations on the USB peripheral require a software workaround. If you are debugging a peripheral that should work according to the datasheet but does not, the errata is the second place to look after re-reading the register description.",
      },
      {
        type: "h2",
        text: "Reading a Register Description: A Worked Example",
      },
      {
        type: "p",
        text: "Take the ATmega644P UCSR0A register. The datasheet shows a table with 8 rows, one per bit. Reading bit 7 (RXC0): 'USART Receive Complete. This flag bit is set when there are unread data in the receive buffer and cleared when the receive buffer is empty. If the receiver is disabled, the receive buffer will be flushed and consequently the RXC0 bit will become zero. The RXC0 flag can be used to generate a receive complete interrupt (see description of the RXCIE0 bit).' That single sentence tells you: it is a status flag, not a control bit; it is read-only in that sense; it clears automatically when you read UDR0; and it connects to an interrupt enable bit elsewhere.",
      },
      {
        type: "code",
        lang: "c",
        text: `// Reading a register with bitfield macros - from the ATmega644P datasheet
// UCSR0A register breakdown:
// Bit 7 - RXC0:  Receive Complete (1 = data available)
// Bit 6 - TXC0:  Transmit Complete
// Bit 5 - UDRE0: Data Register Empty (1 = ready to send)
// Bit 4 - FE0:   Frame Error
// Bit 3 - DOR0:  Data Overrun
// Bit 2 - UPE0:  Parity Error
// Bit 1 - U2X0:  Double Speed mode
// Bit 0 - MPCM0: Multi-processor mode

uint8_t uart_read_blocking(void) {
    while (!(UCSR0A & (1 << RXC0)));  // wait for receive complete
    if (UCSR0A & (1 << FE0)) { /* handle frame error */ }
    if (UCSR0A & (1 << DOR0)) { /* handle overrun */ }
    return UDR0;
}`,
      },
      {
        type: "quote",
        text: "The datasheet is always right. If the hardware does not match your expectation, re-read the datasheet.",
        source: "A lesson from debugging an I2C sensor at 2am",
      },
      {
        type: "p",
        text: "The ability to read a datasheet means you can work with any component that has documentation. Most components have documentation. This skill scales.",
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "ol-links",
        items: [
          { text: "Microchip ATmega644P datasheet - a real datasheet to practise on; register descriptions start at section 14", url: "https://ww1.microchip.com/downloads/en/DeviceDoc/ATmega644P-Datasheet.pdf" },
          { text: "STM32F4 reference manual (RM0090) - a large but well-structured ARM Cortex-M4 reference", url: "https://www.st.com/resource/en/reference_manual/rm0090-stm32f405415-stm32f407417-stm32f427437-and-stm32f429439-advanced-armbased-32bit-mcus-stmicroelectronics.pdf" },
          { text: "NXP I2C specification UM10204 - the canonical I2C protocol reference; short and worth reading cover to cover", url: "https://www.nxp.com/docs/en/user-guide/UM10204.pdf" },
          { text: "The Art of Electronics - Horowitz and Hill - chapter 1 covers passive components and their real-world behaviour as described in datasheets", url: "https://www.amazon.co.uk/Art-Electronics-Paul-Horowitz/dp/0521809266" },
          { text: "Making Embedded Systems - Elecia White - chapter 2 covers hardware/software boundaries and datasheet-driven development", url: "https://www.oreilly.com/library/view/making-embedded-systems/9781449308889/" },
          { text: "sigrok / PulseView - open-source logic analyser for validating signal timing from datasheets", url: "https://sigrok.org/wiki/PulseView" },
          { text: "Wikipedia: Datasheet - structure and conventions", url: "https://en.wikipedia.org/wiki/Datasheet" },
        ],
      },
    ],
  },

  // ── INTERNATIONAL STUDENT ENGINEERING ─────────────────────────────────────────
  {
    slug: "international-student-engineering-uk",
    title: "Navigating UK Engineering as an International Student: What No One Tells You",
    date: "2026-08-20",
    type: "journal",
    cover_image: "https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?w=1200&auto=format&fit=crop&q=80",
    description:
      "The practical and personal side of studying Electronic Engineering and Computer Science in the UK as an international student: the paperwork, the culture shock, the academic differences and what actually helped.",
    tags: ["Personal", "Career", "University", "International", "Engineering"],
    readingTime: 10,
    published: true,
    content: [
      {
        type: "p",
        text: "When people ask what it is like to be an international student studying engineering in the UK, the answers they expect are about the weather or the accent. The real answers are about the UCAS system, the visa rules, the difference between A-level and BTEC pathways, the assumptions baked into the academic culture and the specific ways that being from another country makes an already hard thing harder.",
      },
      {
        type: "p",
        text: "I moved to the UK in April 2022 from Ghana. I arrived with a General Arts background, no formal technical foundation and a strong desire to study engineering. That combination does not fit neatly into the UK system. What follows is what I learned from navigating it.",
      },
      {
        type: "h2",
        text: "The Academic Entry Routes",
      },
      {
        type: "p",
        text: "UK universities expect A-levels or equivalent. If you came through a different system - IB, WAEC, BGSE, a vocational qualification or a foreign degree - you will spend a lot of time translating your qualifications into terms the admissions system understands. The NARIC (now UK ENIC) service does formal equivalency checks but it is a slow and sometimes expensive process.",
      },
      {
        type: "p",
        text: "For engineering specifically, the critical subjects are maths and physics. If your prior education did not give you A-level Maths and Physics, you need to find a route that does: a foundation year, an access course, a BTEC or an international entry programme. I took the BTEC route at Stanmore College. It was not my first choice but it turned out to be an excellent preparation for the engineering degree.",
      },
      {
        type: "h2",
        text: "The Visa and Immigration Layer",
      },
      {
        type: "p",
        text: "As an international student on a [Student visa](https://www.gov.uk/student-visa), you are working within a set of rules that domestic students do not have to think about. Your visa is tied to your institution and your course. Changing course, deferring entry or transferring institutions all have immigration implications. You need to understand the rules, not just for yourself but because advisors at universities sometimes give incorrect information. [UKCISA](https://www.ukcisa.org.uk) is the most reliable independent source for guidance on all of this.",
      },
      {
        type: "p",
        text: "Work rights under a Student visa are limited: typically 20 hours per week during term time, full-time during official holidays. This matters for supporting yourself financially. Many international students rely on families or scholarships in ways domestic students do not, which creates a different kind of pressure when things do not go according to plan.",
      },
      {
        type: "h2",
        text: "The Academic Culture Gap",
      },
      {
        type: "p",
        text: "UK engineering education at university level is not rote learning. You are expected to read papers, form arguments, question assumptions and demonstrate understanding rather than recall. The examination style is different: problem-solving under time pressure, not reproducing memorised content. If your prior education was heavily exam-and-recall based, this is an adjustment.",
      },
      {
        type: "p",
        text: "Group work is also culturally different. In some educational systems, collaboration is discouraged or treated as cheating. In UK universities, group projects are assessed components where your individual contribution matters but so does your ability to work with people you did not choose. This is not obvious until you are in the middle of a group project that is going badly.",
      },
      {
        type: "h2",
        text: "What Actually Helped",
      },
      {
        type: "ul",
        items: [
          "Building relationships with lab technicians and support staff early - they know things that are not in the handbook",
          "Being honest with academic staff about your background rather than pretending gaps do not exist",
          "Joining societies: the Ghana Society, the Computing Society and the [IET](https://www.theiet.org) gave me communities where I was not the only one navigating a double transition",
          "Using office hours systematically, not just when stuck - it builds relationships and gives early feedback",
          "Building a portfolio of projects from year one rather than waiting until the final year",
          "Applying for every award and recognition you are eligible for - visibility matters and most students do not apply",
        ],
      },
      {
        type: "h2",
        text: "The Graduate Job Market and Visa Reality",
      },
      {
        type: "p",
        text: "UK employers can only sponsor international graduates under the Skilled Worker visa if they are approved sponsors and if the role meets the salary threshold and skill level requirements. The list of licensed sponsors is published by the Home Office. Before applying anywhere, check it. This filters out a significant fraction of UK employers - particularly smaller companies and startups that have never needed to sponsor before and are not willing to go through the process.",
      },
      {
        type: "p",
        text: "The Graduate visa gives you two years after graduation (three if you hold a PhD) to work in the UK without sponsorship. This is valuable time. Use it strategically: build demonstrable skills during those two years so that when you need sponsorship, you are a candidate that employers are willing to go through the process for. Companies do not sponsor out of charity - they do it because the alternative is not hiring the person they want.",
      },
      {
        type: "p",
        text: "Something that surprised me: many large engineering employers - defence contractors, semiconductor companies, some graduate schemes - require UK security clearance. Security clearance for certain roles requires UK residency for a minimum number of years and sometimes citizenship. This closes off a category of roles entirely for most international graduates, at least in the short term. It is not advertised prominently in job listings. Read the requirements carefully before investing time in an application.",
      },
      {
        type: "h2",
        text: "For Whoever Is in the Middle of This",
      },
      {
        type: "p",
        text: "If you are an international student studying engineering in the UK right now, I want to say this directly: the difficulty is real and it is not a sign that you do not belong here. The system was not designed with you in mind. That creates real friction that your domestic classmates do not face. It is also survivable, and the combination of skills you build navigating it - adaptability, self-direction, cultural translation - is genuinely valuable in engineering careers.",
      },
      {
        type: "p",
        text: "The qualifications you get are the same. The degree classification is the same. And the story you carry into interviews is one that most interviewers have never heard before. Use it.",
      },
      {
        type: "h2",
        text: "Useful Resources",
      },
      {
        type: "ol-links",
        items: [
          { text: "UKCISA - UK Council for International Student Affairs - the most reliable source for visa and immigration guidance", url: "https://www.ukcisa.org.uk" },
          { text: "UK Visas and Immigration - Student visa official guidance", url: "https://www.gov.uk/student-visa" },
          { text: "Graduate visa - official eligibility and application guide", url: "https://www.gov.uk/graduate-visa" },
          { text: "Skilled Worker visa - sponsor licence requirements and application process", url: "https://www.gov.uk/skilled-worker-visa" },
          { text: "UCAS - undergraduate application deadlines and entry requirements", url: "https://www.ucas.com" },
          { text: "Engineering UK - annual report on the UK engineering sector and graduate demand", url: "https://www.engineeringuk.com" },
          { text: "IET - Institution of Engineering and Technology - professional membership body", url: "https://www.theiet.org" },
          { text: "UK Home Office: register of licensed sponsors - check before applying for a role", url: "https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers" },
        ],
      },
    ],
  },

  // ── DRAFT: JAVASCRIPT EVENT LOOP ─────────────────────────────────────────────
  {
    slug: "javascript-event-loop",
    title: "JavaScript's Event Loop Without the Metaphors",
    date: "2026-06-22",
    type: "article",
    cover_image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=1200&auto=format&fit=crop&q=80",
    description:
      "Most explanations of the JavaScript event loop use hand-wavy analogies. This one explains the actual mechanism: the call stack, the task queue, the microtask queue and why the order matters for real code.",
    tags: ["JavaScript", "TypeScript", "Web", "Async", "Full-Stack"],
    readingTime: 10,
    published: true,
    content: [
      {
        type: "p",
        text: "JavaScript is single-threaded. There is one call stack. One thing runs at a time. And yet web applications handle button clicks while fetching data, animate the UI while processing responses and run timers while doing everything else. The mechanism that makes this possible is the event loop. Most explanations reach for analogies - a restaurant, a to-do list, a queue at the post office. I want to explain what is actually happening in the runtime instead.",
      },
      {
        type: "h2",
        text: "The Call Stack",
      },
      {
        type: "p",
        text: "The call stack is a LIFO data structure that tracks which function is currently executing and which functions called it. When you call a function, a stack frame is pushed containing the function's local variables and the return address. When the function returns, the frame is popped. If the stack is empty, no JavaScript is executing.",
      },
      {
        type: "p",
        text: "Stack overflow errors happen when recursion is too deep - each recursive call pushes a new frame, and eventually the engine runs out of stack space. The error message 'Maximum call stack size exceeded' is the runtime telling you the call stack is full.",
      },
      {
        type: "h2",
        text: "The Task Queue (Macrotask Queue)",
      },
      {
        type: "p",
        text: "Callbacks from setTimeout, setInterval, I/O events and UI events are not run immediately. They are added to the task queue (also called the macrotask queue or callback queue). The event loop checks this queue only when the call stack is empty. This is why setTimeout(fn, 0) does not run fn immediately - it runs fn after the current synchronous code finishes and the stack empties.",
      },
      {
        type: "code",
        lang: "javascript",
        text: `console.log("1")          // runs first - synchronous

setTimeout(() => {
  console.log("2")          // runs last - task queue, waits for stack to empty
}, 0)

console.log("3")          // runs second - still synchronous

// Output: 1, 3, 2`,
      },
      {
        type: "h2",
        text: "The Microtask Queue",
      },
      {
        type: "p",
        text: "Promises and queueMicrotask() use a separate queue: the microtask queue. The critical difference from the task queue is priority. After every task completes and before the event loop picks the next task from the task queue, it drains the entire microtask queue. All pending microtasks run before any pending macrotask.",
      },
      {
        type: "code",
        lang: "javascript",
        text: `console.log("1")          // synchronous

setTimeout(() => console.log("2"), 0)  // task queue

Promise.resolve()
  .then(() => console.log("3"))        // microtask queue
  .then(() => console.log("4"))        // another microtask

console.log("5")          // synchronous

// Output: 1, 5, 3, 4, 2
// Microtasks (3, 4) run before the macrotask (2)`,
      },
      {
        type: "p",
        text: "This ordering has real consequences. If you generate an infinite chain of microtasks (each .then() schedules another), the event loop never gets to process macrotasks. The page freezes even though no single function is blocking - the microtask queue never empties.",
      },
      {
        type: "h2",
        text: "async/await Is Promise Syntax",
      },
      {
        type: "p",
        text: "async/await is syntactic sugar over Promises. An async function returns a Promise. The await keyword pauses execution of the async function and schedules the rest of it as a microtask once the awaited Promise resolves. It does not block the call stack - the JavaScript engine continues executing other code while the async function is paused.",
      },
      {
        type: "code",
        lang: "javascript",
        text: `async function fetchUser(id) {
  console.log("A")                    // synchronous
  const user = await getUser(id)      // pauses here; rest is a microtask
  console.log("B")                    // runs after getUser resolves
  return user
}

fetchUser(1)
console.log("C")                      // runs before "B"

// Output: A, C, B
// "C" runs because await suspends the async function, freeing the stack`,
      },
      {
        type: "h2",
        text: "requestAnimationFrame Is Neither",
      },
      {
        type: "p",
        text: "requestAnimationFrame callbacks run after the current task and all microtasks, but before the browser renders the next frame. They sit in their own queue, separate from both the task queue and the microtask queue. The practical implication: if you update the DOM inside a rAF callback, the browser will paint those changes in the same frame. If you update the DOM from a setTimeout callback, the paint may or may not happen in the same frame depending on timing.",
      },
      {
        type: "h2",
        text: "The Event Loop Tick",
      },
      {
        type: "p",
        text: "One complete pass through the event loop - called a tick - follows this sequence: (1) run the oldest task from the task queue, (2) drain the entire microtask queue, (3) run any scheduled rAF callbacks, (4) let the browser render if needed, (5) repeat. This is the actual algorithm. Understanding it explains why Promises resolve before setTimeout callbacks, why long synchronous code freezes animations and why queueMicrotask() should be used sparingly.",
      },
      {
        type: "h2",
        text: "Why This Matters in Practice",
      },
      {
        type: "ul",
        items: [
          "State updates in React are batched and applied as microtasks - calling setState multiple times in one event handler causes one re-render, not multiple",
          "Long synchronous computations (image processing, large sorts) block both the UI and I/O - move them to a Web Worker if they take more than a few milliseconds",
          "Promise.all fires all promises in parallel and waits for all to resolve - but they still run on the same thread, so they are concurrent in scheduling but not parallel in execution",
          "Unhandled promise rejections are caught by the 'unhandledrejection' window event, which fires from the microtask queue - before any macrotask that follows",
          "Node.js has process.nextTick(), which runs even before the microtask queue - it is a third priority level that predates the standardised queueMicrotask() API",
        ],
      },
      {
        type: "h2",
        text: "Watch: The Event Loop Explained",
      },
      {
        type: "video",
        youtubeId: "cCOL7MC4Pl0",
        title: "In The Loop - Jake Archibald (JSConf Asia 2018)",
        description: "The best visual explanation of the JavaScript event loop, task queue, microtask queue and requestAnimationFrame. 35 minutes - worth every minute.",
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "ol-links",
        items: [
          { text: "HTML Living Standard - event loop processing model (WHATWG)", url: "https://html.spec.whatwg.org/multipage/webappapis.html#event-loops" },
          { text: "MDN: Concurrency model and the event loop", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop" },
          { text: "Jake Archibald: Tasks, microtasks, queues and schedules (2015)", url: "https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/" },
          { text: "MDN: queueMicrotask() reference", url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/queueMicrotask" },
          { text: "Node.js event loop documentation - includes process.nextTick() and libuv phases", url: "https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick" },
          { text: "MDN: Using microtasks in JavaScript with queueMicrotask()", url: "https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide" },
        ],
      },
    ],
  },

  // ── DRAFT: MY DEVELOPMENT SETUP ──────────────────────────────────────────────
  {
    slug: "my-development-setup-2026",
    title: "My Development Setup in 2026: Everything I Use to Build, Learn and Ship",
    date: "2026-06-29",
    type: "article",
    cover_image: "https://images.unsplash.com/photo-1593642532400-2682810df593?w=1200&auto=format&fit=crop&q=80",
    description:
      "A full tour of my hardware, editor configuration, terminal setup, dotfiles and the tools I reach for when building embedded systems and web applications. What I use, why I use it and what I changed my mind about.",
    tags: ["Tools", "Productivity", "Terminal", "Setup", "Dotfiles"],
    readingTime: 14,
    published: true,
    content: [
  {
    type: "p",
    text: "Every developer has opinions about their setup. Mine has changed significantly over the past two years - from a Windows-only workflow to a split across three machines, with the right tool for each context. This is what I actually use, verified against what is documented on the /uses page of this site, with notes on what I tried and abandoned.",
  },
  {
    type: "h2",
    text: "Hardware",
  },
  {
    type: "p",
    text: "I run three machines with distinct purposes. The main development and gaming machine (ZACCESS-GPC) is a custom Windows desktop with an NVIDIA GeForce RTX 4060 and an Intel CPU. This is where embedded tooling lives: STM32CubeIDE, ST-Link utilities, Proteus for circuit simulation and the GPC daemon that handles game presence detection for the portfolio dashboard. STM32CubeIDE and most manufacturer programming tools are Windows-first and either do not exist on macOS or are awkward enough to make the jump not worth it.",
  },
  {
    type: "p",
    text: "For portable development and anything Unix-native I use a MacBook (ZACCESS-MBK). The split is practical: web development, scripting, Next.js, Python and command-line work all run better in a Unix environment. The Mac runs a launchd-managed Python daemon (mac-daemon.py) that writes battery level, charging state, timezone and weather to Redis every 30 seconds for the live status widget on the portfolio site. The Lenovo laptop (ZACCESS-LNV) is a secondary Windows machine with its own daemon doing the same for battery and charging state.",
  },
  {
    type: "p",
    text: "The three-machine setup sounds complicated but in practice it works because the [dotfiles](https://github.com/zaccesss/dotfiles) are cross-platform. Shell aliases, tool configuration and git hooks are identical across all three. Switching machines is switching keyboards, not relearning muscle memory.",
  },
  {
    type: "h2",
    text: "Terminal and Shell",
  },
  {
    type: "p",
    text: "My prompt is [Starship](https://starship.rs) - a cross-shell Rust-based prompt configured once in ~/.config/starship.toml and working identically on macOS (zsh), Linux (bash) and Windows (PowerShell 7). It shows git branch and status, active language version and the exit code of the last command. Loaded last in the dotfiles at topic file 59, so all aliases and environment variables are already in place before the prompt hooks in.",
  },
  {
    type: "p",
    text: "On macOS and Linux I use zsh/bash with a custom shell configuration rather than Oh My Zsh. Oh My Zsh adds startup time and features I do not use. The .zshrc does: nvm lazy-loading (so Node does not slow down every shell open), path management, aliases and a small set of functions. On Windows I use PowerShell 7, primarily for NSSM service management, setting up Python virtual environments and running builds.",
  },
  {
    type: "p",
    text: "The dotfiles repository covers 59 numbered topic files loaded in order - from git aliases and navigation shortcuts through to Docker, Kubernetes, cloud platforms and 30+ language toolchains. Every alias has the same name on all three platforms. The colour scheme was chosen deliberately: I lost sight in my right eye at age two, and colour does the depth-cue job that binocular vision usually handles. Cyan, magenta, green and yellow were chosen for contrast and tested under deuteranopia and protanopia simulations.",
  },
  {
    type: "h2",
    text: "Editors",
  },
  {
    type: "p",
    text: "VS Code is my primary editor for web and TypeScript work. The TypeScript language server integration is significantly better than what I had in Vim, and the debug adapter protocol means the same debugger interface works for TypeScript, Python and C without switching tools. Key extensions: ESLint, Prettier, Tailwind IntelliSense, GitLens, Error Lens and the Cortex-Debug extension for STM32 work.",
  },
  {
    type: "p",
    text: "For projects that benefit from vendor tooling I switch to JetBrains: IntelliJ IDEA for Java coursework, PyCharm for the Phaemos FastAPI backend and system daemons, CLion for C/C++ embedded development. The refactoring support in IntelliJ and the database tooling in DataGrip are still better than VS Code for complex codebases. I switch based on what the project needs rather than picking one permanently.",
  },
  {
    type: "ul",
    items: [
      "Font: JetBrains Mono - monospace with ligatures; arrow and comparison operator ligatures are useful in TypeScript",
      "Version control view: VS Code source control panel for side-by-side diffs; git command line for everything else",
      "Linting: ESLint on pre-commit via a git hook; was annoying when I set it up, would not remove it now",
      "I use git add -p (patch mode) for staging individual hunks rather than entire files - makes commit messages easier to write accurately",
    ],
  },
  {
    type: "h2",
    text: "Hardware Lab",
  },
  {
    type: "p",
    text: "For embedded work I use an oscilloscope, a logic analyser and a bench power supply alongside the microcontroller boards. The oscilloscope is essential for verifying signal timing, debugging UART and SPI communication and measuring ADC input waveforms on the ATmega644P and ESP32. A cheap USB logic analyser with [PulseView](https://sigrok.org/wiki/PulseView) captures and decodes protocol traces when the oscilloscope alone is not enough.",
  },
  {
    type: "p",
    text: "[Proteus](https://www.labcenter.com) is my primary PCB design and simulation tool. I used it for the [two-stage audio amplifier](/blog/two-stage-audio-amplifier) PCB in my EE coursework - designing the schematic, running the simulation and laying out the board all within the same environment before committing to fabrication. The built-in circuit simulator and firmware simulation for microcontrollers are genuinely useful: you can verify timing-critical embedded logic and analogue behaviour before soldering anything. KiCad is my secondary option for projects where open Gerber export or community footprint libraries are a better fit.",
  },
  {
    type: "h2",
    text: "Note-Taking and Organisation",
  },
  {
    type: "p",
    text: "[Notion](https://www.notion.so) for structured reference material and anything collaborative: project planning, research threads, meeting notes and project briefs. [Obsidian](https://obsidian.md) for long-form research and personal knowledge management where I want to keep plain Markdown files I actually own. The bidirectional linking between notes in Obsidian makes it easy to build context over time without a managed database. [Figma](https://www.figma.com) before starting any frontend work - thinking visually before writing CSS saves time. [Excalidraw](https://excalidraw.com) for quick system design sketches that do not need Figma-level polish.",
  },
  {
    type: "h2",
    text: "Version Control",
  },
  {
    type: "p",
    text: "Git on the command line for everything. I have tried GitKraken and Sourcetree and went back within a week each time. The mental model is clearer in the terminal because you can see exactly what each command does. The dotfiles repository uses a bare git repo approach: `git --git-dir=$HOME/.dotfiles --work-tree=$HOME` treats home as the work tree without cloning into it. Every config file lives in home, tracked by the bare repo and pushed to all three remotes (GitHub, GitLab, Codeberg) simultaneously via push URLs.",
  },
  {
    type: "h2",
    text: "What I Changed My Mind About",
  },
  {
    type: "ul",
    items: [
      "Windows for development: WSL2 is good, not great; the file system performance across the boundary is noticeable, and half of the hardware tools I use do not work in WSL anyway",
      "Tabs vs spaces: spaces everywhere; the tab-width ambiguity across editors and terminals caused too many display inconsistencies",
      "Linters as blockers: running ESLint on pre-commit was frustrating at first; now I would not work on a codebase that does not do this",
      "Branch-per-feature: I was too conservative with branching early on; I branch for everything including small fixes now, the PR history is the documentation",
      "AI coding assistants: useful for boilerplate and API reference; I do not use them for architectural decisions or debugging subtle bugs, the confidence on unfamiliar APIs is too high relative to accuracy",
    ],
  },
  {
    type: "h2",
    text: "Further Reading",
  },
  {
    type: "ol-links",
    items: [
      { text: "Dotfiles repository (GitHub) - the actual config files behind most of this post", url: "https://github.com/zaccesss/dotfiles" },
      { text: "Uses page on this site - the full list of tools, hardware and services I use", url: "/uses" },
      { text: "Starship - cross-shell prompt configuration documentation", url: "https://starship.rs/config/" },
      { text: "Proteus Design Suite - PCB design and circuit simulation tool", url: "https://www.labcenter.com/" },
      { text: "PulseView / sigrok - open-source logic analyser software", url: "https://sigrok.org/wiki/PulseView" },
      { text: "git-unlocked - my open-source Git course covering advanced workflows", url: "https://github.com/zaccesss/git-unlocked" },
    ],
  },
],
  },

  // ── DRAFT: PHAEMOS ENGINEERING DECISIONS ─────────────────────────────────────
  {
    slug: "phaemos-engineering-decisions",
    title: "PHAEMOS: Engineering Decisions from Breadboard to Distributed IoT System",
    date: "2026-07-27",
    type: "journal",
    cover_image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
    description:
      "A case study in the decisions behind PHAEMOS - a multi-node environmental monitoring system. Why these hardware platforms, why this software stack and what I would do differently now.",
    tags: ["PHAEMOS", "IoT", "Embedded", "Python", "Full-Stack"],
    readingTime: 11,
    published: true,
    content: [
      {
        type: "p",
        text: "[PHAEMOS](/projects/phaemos) started as a single ESP32 on a breadboard connected to a DHT22 temperature sensor, sending readings to a terminal over UART. It is now a multi-node system with hardware nodes based on ESP32, STM32, Arduino Nano and Raspberry Pi Pico 2W, a [FastAPI](https://fastapi.tiangolo.com) backend with sub-200ms response times, JWT role-based access control, an Isolation Forest anomaly detection model and a Next.js dashboard. The gap between those two states required a lot of decisions. Most of them I got roughly right the first time. Some I got wrong.",
      },
      {
        type: "h2",
        text: "Why Four Different Microcontrollers",
      },
      {
        type: "p",
        text: "The natural question is: why not pick one platform and standardise on it? The answer is that each node has a different job. The ESP32 nodes are the primary connectivity nodes: they have WiFi built in, enough RAM to hold a TLS session and enough processing power to do some local filtering before transmitting. They are the obvious choice for anything that needs to talk to the internet directly.",
      },
      {
        type: "p",
        text: "The STM32 nodes handle situations where timing precision and real-time behaviour matter more than connectivity. The STM32F103 can run a PID controller at 10kHz without breaking a sweat while simultaneously handling three UART peripherals via DMA. An ESP32 can do this too, but the ESP32's [FreeRTOS](https://www.freertos.org) scheduler and WiFi stack add latency variance that is unacceptable for some control loops. The STM32 runs bare-metal or RTOS depending on the node's requirements.",
      },
      {
        type: "p",
        text: "The Arduino Nano nodes are for prototyping new sensor integrations. The Nano's 5V tolerance and the wide library support make it the fastest path from 'I have this sensor' to 'I have data'. Once a sensor integration is working on a Nano and the communication protocol is understood, it gets ported to whichever production platform is appropriate. The Nano nodes are never permanent - they are scaffolding.",
      },
      {
        type: "p",
        text: "The Raspberry Pi Pico 2W is the newest addition. The RP2350's dual-core architecture with one ARM Cortex-M33 core and one RISC-V Hazard3 core is interesting for workloads that benefit from parallelism: one core handles sensor sampling, the other handles WiFi communication, and because they are on separate cores (not using a scheduler), there is no preemption latency between them. MicroPython makes it fast to iterate.",
      },
      {
        type: "h2",
        text: "The Backend Choice: FastAPI",
      },
      {
        type: "p",
        text: "The backend is [FastAPI](https://fastapi.tiangolo.com) with PostgreSQL (via [Supabase](https://supabase.com)) and Redis for caching. I chose FastAPI over Express or a Go HTTP server because the team (at the time, me and one other person) was more productive in Python, and FastAPI's automatic OpenAPI documentation meant the API spec was always up to date. The async nature of FastAPI means sensor data ingestion endpoints can handle concurrent posts from multiple nodes without thread-blocking.",
      },
      {
        type: "p",
        text: "The sub-200ms response time target comes from the dashboard's requirement to feel live. The actual sensor data latency from node to dashboard is: sensor samples every 5 seconds → node transmits to FastAPI → FastAPI writes to PostgreSQL and invalidates Redis cache → dashboard polls API route → Next.js API route reads from Redis → response. The bottleneck is PostgreSQL write latency, which averages 40-60ms on the Supabase shared tier.",
      },
      {
        type: "h2",
        text: "Anomaly Detection with Isolation Forest",
      },
      {
        type: "p",
        text: "The Isolation Forest model detects anomalous sensor readings. Isolation Forest is an unsupervised algorithm: you train it on normal data and it learns to identify readings that are unusual relative to that baseline. It works by randomly partitioning the feature space with split trees - anomalous points are isolated near the root of the tree with few splits, while normal points require more splits to isolate. The anomaly score is the average depth across many trees.",
      },
      {
        type: "p",
        text: "I chose Isolation Forest over simpler threshold-based anomaly detection because the sensor readings are correlated. A temperature of 35°C is not anomalous in summer but is anomalous at 2am in January. Isolation Forest takes all 25 features (temperature, humidity, pressure, light, gas concentration and derived features like rolling mean and rolling standard deviation over 1-hour and 24-hour windows) into account simultaneously. A threshold approach would need 25 separately tuned thresholds and would miss cross-feature correlations.",
      },
      {
        type: "h2",
        text: "What I Got Wrong",
      },
      {
        type: "p",
        text: "The first version of the communication protocol between nodes and the backend was a flat JSON object with no versioning. When I added new sensor fields, every existing node started sending incomplete objects and the backend rejected them. The fix was adding a protocol version field and making the backend tolerant of missing fields for older protocol versions. I should have built this in from the start.",
      },
      {
        type: "p",
        text: "The Docker Compose deployment was also an afterthought. The initial development setup was three terminal windows running separate processes. Moving to Compose required restructuring the service dependencies and adding proper health checks. Had I written the Compose file first and developed against it, the production deployment would have been cleaner. Infrastructure should be defined before it is needed, not after.",
      },
      {
        type: "p",
        text: "The JWT RBAC implementation required three revisions. The first version put all permissions in the JWT payload, which meant revoking a token required invalidating every issued JWT - stateless JWTs do not support revocation without a token blocklist. The second version added a Redis blocklist but the cache invalidation was buggy. The third version separated authentication (JWT) from authorisation (database lookup per request), which is slower but correct. Security is one place where 'fast but wrong' has real consequences.",
      },
      {
        type: "h2",
        text: "What I Would Do Differently",
      },
      {
        type: "ul",
        items: [
          "Start with a well-defined data schema for sensor payloads and version it from day one",
          "Write the Docker Compose file before writing any service code - it forces you to think about service boundaries",
          "Use MQTT instead of HTTP POST for node-to-backend communication - MQTT's QoS levels and retained messages are designed exactly for this use case",
          "Consider InfluxDB or TimescaleDB instead of PostgreSQL for time-series data - the query patterns for sensor data (recent N readings, aggregates over time windows) are much faster on a time-series database",
          "Automate the model retraining pipeline from the start - manually re-running the Isolation Forest notebook when data distribution shifts is a recurring manual step that should not be manual",
        ],
      },
      {
        type: "h2",
        text: "References and Related",
      },
      {
        type: "ol-links",
        items: [
          { text: "FreeRTOS - the kernel used on the STM32 node in Phaemos", url: "https://www.freertos.org" },
          { text: "scikit-learn: IsolationForest - the anomaly detection algorithm used in Phaemos", url: "https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.IsolationForest.html" },
          { text: "FastAPI documentation - the Python framework powering the Phaemos backend", url: "https://fastapi.tiangolo.com" },
          { text: "MQTT specification - the protocol used for node-to-backend communication", url: "https://mqtt.org/mqtt-specification/" },
          { text: "Designing Data-Intensive Applications - Kleppmann - informed the backend architecture decisions", url: "https://dataintensive.net/" },
          { text: "Docker documentation - Compose file reference", url: "https://docs.docker.com/compose/" },
          { text: "TimescaleDB - time-series PostgreSQL extension (considered as alternative data store)", url: "https://docs.timescale.com/" },
        ],
      },
    ],
  },

  // ── DRAFT: ELEVEN THINGS LEARNING TO CODE ────────────────────────────────────
  {
    slug: "eleven-things-learning-to-code",
    title: "Eleven Things That Actually Help When Learning to Code",
    date: "2026-09-07",
    type: "article",
    cover_image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80",
    description:
      "Not 'learn Python first' or 'do LeetCode every day'. The things that actually made a difference when moving from knowing nothing to shipping things: how to read documentation, how to get unstuck, how to build the habit.",
    tags: ["Learning", "Career", "Programming", "Beginner", "Advice"],
    readingTime: 8,
    published: true,
    content: [
      {
        type: "p",
        text: "The internet has no shortage of advice on learning to code. Most of it is either a technology recommendation (learn Python / JavaScript / Rust first) or a method recommendation (do LeetCode / build projects / contribute to open source). Both miss the more fundamental problems: how do you stay consistent, how do you get unstuck, how do you know if you are learning efficiently. This is the list I wish someone had given me.",
      },
      {
        type: "h2",
        text: "1. Read Error Messages All the Way Through",
      },
      {
        type: "p",
        text: "The instinct when an error appears is to scan for the first familiar word and Google it. A better instinct is to read the entire error message first, including the stack trace. Error messages in modern languages are usually very specific: 'Cannot read properties of undefined (reading map)' tells you exactly what is null and what operation you tried on it. 'No module named requests' tells you the package is not installed in the current environment. Google is for error messages you do not understand after reading them, not instead of reading them.",
      },
      {
        type: "h2",
        text: "2. Type Out Code Examples, Do Not Copy-Paste",
      },
      {
        type: "p",
        text: "When following a tutorial or reading documentation, type the examples manually rather than pasting them. Typing forces you to read each character and think about what it does. Pasting lets your brain treat the block as a single token without engaging with the structure. The difference in retention is significant. You will make typing mistakes that give you useful error messages. You will notice syntax you would have skipped over.",
      },
      {
        type: "h2",
        text: "3. Learn to Use the Debugger Before You Need It",
      },
      {
        type: "p",
        text: "Most beginners debug by adding print statements. Print-debugging works but it is slow: you add prints, run the program, read the output, add more prints, repeat. A debugger lets you pause execution at any line, inspect every variable in scope and step through the code instruction by instruction. Learning to use the debugger in VS Code or PyCharm takes an afternoon. It will save you hours on every non-trivial bug after that.",
      },
      {
        type: "h2",
        text: "4. Documentation Is Not Optional",
      },
      {
        type: "p",
        text: "When you use a function or library you do not fully understand, go to the official documentation and read the section for that function. Not a tutorial about it - the actual documentation. Documentation tells you the function signature, the types of arguments, the return type, the edge cases and the exceptions it can throw. Tutorials tell you the happy path. You will eventually hit a non-happy path. For web platform APIs, [MDN Web Docs](https://developer.mozilla.org) is the authoritative reference.",
      },
      {
        type: "h2",
        text: "5. Version Control from Day One",
      },
      {
        type: "p",
        text: "Start using Git from your very first project, even if it is a 50-line script. The habit of committing working states means you always have a point to revert to. It also means you build a record of how your code evolved, which is more useful for learning than the final state alone. The mechanical cost of `git init`, `git add`, `git commit` is two minutes. The cost of not doing it when you need to revert something is everything since the last save. If you want a structured starting point for learning Git properly, [git-unlocked](https://github.com/zaccesss/git-unlocked) covers everything from the basics to professional workflows.",
      },
      {
        type: "h2",
        text: "6. Stuck for 20 Minutes? Explain It Out Loud",
      },
      {
        type: "p",
        text: "Rubber duck debugging works. Explaining a problem to an inanimate object - or writing it out in full sentences - forces you to articulate assumptions you were holding implicitly. The act of formulating the explanation often surfaces the bug. Before asking someone else for help, spend a few minutes articulating the problem precisely: what you expected to happen, what actually happened, and what you have already tried. This process frequently produces the answer before you finish the question.",
      },
      {
        type: "h2",
        text: "7. Build Things You Actually Want to Exist",
      },
      {
        type: "p",
        text: "Tutorial projects are fine for learning syntax. They are not good at sustaining motivation. The projects that stick are the ones you actually want to use - a script that automates something tedious, a tool that solves a problem you have, a website for something you care about. When the project matters to you, debugging feels like progress rather than obstacle. The best thing I built for learning purposes was something I actively used afterwards.",
      },
      {
        type: "h2",
        text: "8. Read Other People's Code",
      },
      {
        type: "p",
        text: "Most beginners only read their own code and tutorial code. Reading production-quality open source code exposes you to patterns, conventions and approaches you would not arrive at yourself. Start with a project in a language you know, find something with fewer than 5000 lines of code and a README that explains what it does. Read the main files. Do not worry about understanding everything - focus on what looks unfamiliar and why.",
      },
      {
        type: "h2",
        text: "9. Consistency Beats Intensity",
      },
      {
        type: "p",
        text: "Two hours of coding every day for a month produces more learning than a 14-hour marathon on a weekend. The marathon feels productive but most of the deep work happens in the hours after you stop - when your brain consolidates what it processed. Regular shorter sessions give the brain more consolidation time. They also build the habit, which compounds. The learner who codes for 45 minutes every evening will outpace the learner who does full-day sessions every two weeks.",
      },
      {
        type: "h2",
        text: "10. Understand Why Before How",
      },
      {
        type: "p",
        text: "When learning something new, spend time on why it exists before learning how to use it. Why does Python have list comprehensions when for loops exist? Why do databases have indexes? Why does React have a virtual DOM? The why is the mental model. The how is syntax. Mental models transfer to new contexts; syntax is specific and forgettable. Once you understand why closures exist in JavaScript, the specific syntax becomes obvious.",
      },
      {
        type: "h2",
        text: "11. Write It Down",
      },
      {
        type: "p",
        text: "Keep a text file or notebook where you record things you learned, bugs you fixed and approaches that worked. The act of writing reinforces the memory. The record becomes searchable. You will encounter the same class of problem again in a different context; having notes from the first time means you spend minutes on the second encounter rather than hours. This is also the foundation of writing technical blog posts, which are a multiplier: they force you to understand something well enough to explain it, which is a different and deeper kind of knowing.",
      },
      {
        type: "h2",
        text: "Further Reading",
      },
      {
        type: "ol-links",
        items: [
          { text: "The Pragmatic Programmer - Hunt and Thomas - the best book on developer habits and thinking", url: "https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/" },
          { text: "A Mind for Numbers - Barbara Oakley - the science behind learning technical subjects effectively", url: "https://barbaraoakley.com/books/a-mind-for-numbers/" },
          { text: "git-unlocked - free open-source Git course covering version control from scratch", url: "https://github.com/zaccesss/git-unlocked" },
          { text: "MDN Web Docs - the authoritative web platform reference; go here before Stack Overflow", url: "https://developer.mozilla.org/" },
          { text: "Rubber Duck Debugging - Wikipedia - the formal name for the technique in point 6", url: "https://en.wikipedia.org/wiki/Rubber_duck_debugging" },
        ],
      },
    ],
  },

  // ── DRAFT: ON BEING UNCOMFORTABLE ────────────────────────────────────────────
  {
    slug: "on-being-uncomfortable",
    title: "On Being Uncomfortable: Why I Keep Choosing Hard Things",
    date: "2026-09-19",
    type: "journal",
    cover_image: "https://plus.unsplash.com/premium_photo-1711987269038-a3c47b00b14c?w=1200&auto=format&fit=crop&q=80",
    description:
      "A personal essay on discomfort, choosing difficult paths and what I have learned from consistently putting myself in situations where I do not know what I am doing yet.",
    tags: ["Personal", "Career", "Learning", "Mindset"],
    readingTime: 6,
    published: true,
    content: [
      {
        type: "p",
        text: "I have been uncomfortable for most of the past four years. Not in the abstract motivational-poster sense - I mean the specific feeling of being in a situation I am not equipped for yet, where I do not have the vocabulary or the skills or the context, and where the gap between where I am and where I need to be is visible and embarrassing. I have made a habit of choosing these situations deliberately. I think it is the right decision. I am still not sure.",
      },
      {
        type: "h2",
        text: "What Deliberate Discomfort Looks Like",
      },
      {
        type: "p",
        text: "I moved from Ghana to the UK with a General Arts background and enrolled in an Electronic Engineering and Computer Science degree. I had no physics beyond secondary school level and no mathematics beyond WAEC. I chose the hardest available entry route into a field I did not yet belong in. The first semester was the most intellectually painful experience I have had. I understood about 40% of what was taught and faked the rest.",
      },
      {
        type: "p",
        text: "I have applied for programmes and awards I was underqualified for. Some I did not get. Some I got and then had to grow into quickly. I entered a hackathon before I could build anything worth entering a hackathon with. I submitted pull requests to open source projects before I understood the codebases. In each case the experience of being in the room or in the review process taught me things I would not have learned by waiting until I was ready.",
      },
      {
        type: "h2",
        text: "The Mechanism",
      },
      {
        type: "p",
        text: "I think discomfort works as a learning accelerant because it forces attention. When you are comfortable, your brain is on autopilot - pattern-matching to existing schemas, spending as little energy as possible. When you are uncomfortable, the pattern-matching fails and you have to actually engage with what is in front of you. The engagement is costly in the moment. It compounds into skill over time.",
      },
      {
        type: "p",
        text: "There is also a calibration effect. Until you attempt something, your estimate of the difficulty is based on observation from the outside. From the outside, most things look harder than they are. Attempting them reveals that they are merely hard - not impossible, not reserved for some other category of person. This recalibration changes what you are willing to attempt next. The things that seemed impossible become the new baseline.",
      },
      {
        type: "h2",
        text: "The Difference Between Discomfort and Overwhelm",
      },
      {
        type: "p",
        text: "There is a meaningful distinction between productive discomfort and overwhelm. Productive discomfort is being in a situation where you are stretched but functional - confused about specific things, not everything. Overwhelm is the feeling of being unable to identify where to start, where every direction looks equally unfamiliar and scary. Overwhelm produces paralysis, not learning.",
      },
      {
        type: "p",
        text: "The practical difference is the size of the gap. A gap you can see the other side of - where you know roughly what skills you lack and roughly how to get them - is generative. A gap with no visible far side is demoralising. I have been in both. Getting out of overwhelm requires narrowing the problem: pick one specific thing that is unclear, address only that, then expand. The instinct to solve everything at once is the problem.",
      },
      {
        type: "h2",
        text: "What This Costs",
      },
      {
        type: "p",
        text: "Choosing difficulty is not free. It costs time - you cannot learn everything at the same pace if you are constantly reaching past your current level. It costs social capital - being visibly inexperienced in rooms where others are not is uncomfortable in ways that compound. And it costs confidence, at least in the short term. You spend enough time being the least experienced person in the room and you start to wonder if you should be there at all.",
      },
      {
        type: "p",
        text: "The answer to the last question is almost always yes. The people who belong in rooms are not always the most experienced. They are the ones who have something to contribute - a perspective, an effort, an approach - and who do not leave when the first question they cannot answer reveals their limits. Limits are temporary. Presence is the variable that matters.",
      },
      {
        type: "h2",
        text: "Why I Think It Is Right",
      },
      {
        type: "p",
        text: "I am not sure I would make different choices. The discomfort of not knowing how to do something has consistently been followed by knowing how to do it. The embarrassment of being wrong in front of people has consistently been followed by not making the same mistake. The anxiety of being evaluated at a level above my current ability has, more often than not, been followed by reaching that level faster than I expected.",
      },
      {
        type: "p",
        text: "I do not think this is about resilience as a personality trait, or some particular capacity for tolerating pain. I think it is about having a very clear picture of where you want to be and being willing to be embarrassed in the service of getting there. The discomfort is not the point. The destination is.",
      },
      {
        type: "divider",
      },
      {
        type: "h2",
        text: "Further Reading",
      },
      {
        type: "ol-links",
        items: [
          { text: "Mindset: The New Psychology of Success - Carol Dweck - the research behind growth vs fixed mindset", url: "https://www.penguin.co.uk/books/291600/mindset-by-carol-s-dweck/9781472116178" },
          { text: "The Courage to Be Disliked - Kishimi and Koga - Adlerian psychology applied to self-determination", url: "https://www.penguin.co.uk/books/313385/the-courage-to-be-disliked-by-ichiro-kishimi-fumitake-koga/9781760630607" },
          { text: "Paul Graham: Keep Your Identity Small (2009)", url: "http://www.paulgraham.com/identity.html" },
          { text: "The Pragmatic Programmer - Hunt and Thomas - chapter on your knowledge portfolio", url: "https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/" },
        ],
      },
    ],
  },

  // ── DRAFT: WRITING FOR ENGINEERS ─────────────────────────────────────────────
  {
    slug: "writing-for-engineers",
    title: "Writing Clearly as an Engineer: Notes on Technical Communication",
    date: "2026-08-03",
    type: "notes",
    cover_image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&auto=format&fit=crop&q=80",
    description:
      "Notes on writing clearly: how to structure explanations, when to use diagrams, why passive voice creeps into technical writing and how to remove it. Based on mistakes I made writing reports, documentation and blog posts.",
    tags: ["Writing", "Communication", "Documentation", "Career"],
    readingTime: 7,
    published: true,
    content: [
      {
        type: "p",
        text: "Engineering writing is full of sentences like: 'It was determined that the threshold value should be modified to accommodate the revised specification requirements.' What this means is: 'We changed the threshold to match the new spec.' The passive voice is not more professional. It is harder to read and hides who made the decision. These are notes on the specific habits that make technical writing clearer.",
      },
      {
        type: "h2",
        text: "Lead with the Conclusion",
      },
      {
        type: "p",
        text: "Academic writing builds to a conclusion. Technical writing should lead with it. State the main point in the first sentence, then explain how you got there. 'The component fails above 85 degrees Celsius. Our measurements showed...' is better than two paragraphs of methodology before the finding. Readers rarely read in full; they scan for the answer to their question. Put the answer first.",
      },
      {
        type: "h2",
        text: "One Idea Per Paragraph",
      },
      {
        type: "p",
        text: "A paragraph that covers three ideas will be re-read three times and understood once. The discipline of one idea per paragraph forces you to know what each paragraph is for. If you cannot summarise a paragraph in one sentence, it is doing too much. Write the summary sentence first, then write the paragraph around it.",
      },
      {
        type: "h2",
        text: "Use Active Voice",
      },
      {
        type: "p",
        text: "Subject-verb-object. 'The script reads the config file' not 'The config file is read by the script.' Active voice is shorter, faster to parse and clearer about causality. Passive voice is appropriate when the subject is genuinely unknown or irrelevant. Otherwise, use active. Most passive sentences in engineering writing are passive out of habit, not necessity.",
      },
      {
        type: "h2",
        text: "Avoid Nominalisations",
      },
      {
        type: "p",
        text: "Nominalisations are verbs turned into nouns. 'Perform an investigation of' rather than 'investigate'. 'Make a decision about' rather than 'decide'. 'Provide an explanation of' rather than 'explain'. Every nominalisation adds words and slows the reader down. The verb form is almost always shorter and clearer.",
      },
      {
        type: "ul",
        items: [
          "perform an analysis of -> analyse",
          "make a determination -> determine",
          "provide a summary of -> summarise",
          "conduct an evaluation of -> evaluate",
          "have an impact on -> affect",
        ],
      },
      {
        type: "h2",
        text: "When to Use a Diagram",
      },
      {
        type: "p",
        text: "Use a diagram when the spatial or temporal relationship between things is the point. System architecture diagrams, signal timing diagrams, flowcharts and state machines communicate structure that text cannot. Do not use a diagram to avoid writing. A block diagram with no explanation is not useful; a block diagram with one sentence per component explaining its role is.",
      },
      {
        type: "h2",
        text: "Code Comments Are Documentation",
      },
      {
        type: "p",
        text: "A comment that says 'set the baud rate' next to `UBRR0H = (F_CPU / 16 / BAUD - 1) >> 8` tells you nothing you could not read from the code. A comment that says 'UBRR value is calculated per datasheet Table 20-1; F_CPU must match the fuse configuration' tells you something the code cannot. The rule: comment the why, not the what. What the code does is visible. Why it does it that way is not.",
      },
      {
        type: "h2",
        text: "Writing for an Audience You Do Not Know",
      },
      {
        type: "p",
        text: "Technical documentation often has two readers: the expert who knows the domain but not your specific system, and the newcomer who knows neither. Write for both by defining terms on first use and providing references for background knowledge rather than explaining it inline. 'The system uses I2C (a two-wire serial protocol; see the NXP UM10204 specification for protocol details)' gives the newcomer a path and does not waste the expert's time.",
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "ol-links",
        items: [
          { text: "The Elements of Style - Strunk and White - short, specific and still the best general writing guide", url: "https://en.wikipedia.org/wiki/The_Elements_of_Style" },
          { text: "Google developer documentation style guide - free online, practical and well-maintained", url: "https://developers.google.com/style" },
          { text: "Microsoft Writing Style Guide - particularly useful for UI copy and error messages", url: "https://learn.microsoft.com/en-us/style-guide/welcome/" },
          { text: "Write the Docs - community and resources for technical writers and developers who write docs", url: "https://www.writethedocs.org/" },
          { text: "Style: Lessons in Clarity and Grace - Joseph M. Williams and Joseph Bizup - the most practically useful academic writing guide", url: "https://www.amazon.co.uk/Style-Lessons-Clarity-Grace-12th/dp/0134080416" },
          { text: "Oxford Guide to Plain English - Martin Cutts - UK-focused plain English guidance", url: "https://global.oup.com/academic/product/oxford-guide-to-plain-english-9780198844785" },
        ],
      },
    ],
  },

  // ── DRAFT: PYTHON TYPE ANNOTATIONS ───────────────────────────────────────────
  {
    slug: "python-type-annotations",
    title: "Python Type Annotations: What I Actually Use and Why",
    date: "2026-09-01",
    type: "notes",
    cover_image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&auto=format&fit=crop&q=80",
    description:
      "A practical guide to Python type hints: where they help, where they get in the way and the specific patterns I reach for when annotating FastAPI handlers, dataclasses and utility functions.",
    tags: ["Python", "Types", "Backend", "FastAPI", "Notes"],
    readingTime: 8,
    published: true,
    content: [
      {
        type: "p",
        text: "Python's type annotation syntax was introduced in PEP 484 (Python 3.5) and has been expanded significantly in each subsequent release. In 2026 the ecosystem is mature enough that type annotations are worth using on any Python project that more than one person will touch, or that you will return to after more than a few weeks. These are the patterns I use day-to-day in the [Phaemos](/projects/phaemos) backend ([FastAPI](https://fastapi.tiangolo.com)) and in the system daemons that power the portfolio live status features.",
      },
      {
        type: "h2",
        text: "The Basics: Function Signatures",
      },
      {
        type: "p",
        text: "Start by annotating function signatures. Parameter types and return types give mypy enough information to catch the most common errors: passing a string where an int is expected, forgetting to handle a None return, returning the wrong type from a function.",
      },
      {
        type: "code",
        lang: "python",
        text: `def parse_sensor_reading(raw: str) -> float:
    return float(raw.strip())

def format_status(temp: float, humidity: float) -> dict[str, float]:
    return {"temperature": temp, "humidity": humidity}

# Without annotation, this is valid Python that will fail at runtime:
result = parse_sensor_reading(42)  # mypy: Argument 1 to "parse_sensor_reading" has incompatible type "int"; expected "str"`,
      },
      {
        type: "h2",
        text: "Optional and Union",
      },
      {
        type: "p",
        text: "`Optional[T]` is shorthand for `T | None` (Python 3.10+ syntax). Use it whenever a value might not exist. The discipline of annotating Optional forces you to handle the None case explicitly, which catches a large class of AttributeError bugs at analysis time rather than in production.",
      },
      {
        type: "code",
        lang: "python",
        text: `from typing import Optional

def get_cached_value(key: str) -> Optional[str]:
    # Redis might return None if the key does not exist
    return redis_client.get(key)

# Python 3.10+ syntax (preferred if your version allows it):
def get_cached_value(key: str) -> str | None:
    return redis_client.get(key)`,
      },
      {
        type: "h2",
        text: "TypedDict for Structured Data",
      },
      {
        type: "p",
        text: "When a function receives or returns a dictionary with a known shape, TypedDict gives you type-checked keys without the overhead of a full class. I use this for Redis payloads in the Phaemos daemons where the data is structured but does not warrant a Pydantic model.",
      },
      {
        type: "code",
        lang: "python",
        text: `from typing import TypedDict

class SensorPayload(TypedDict):
    node_id: str
    temperature: float
    humidity: float
    timestamp: int

def publish_reading(payload: SensorPayload) -> None:
    redis.set(f"node:{payload['node_id']}:latest", json.dumps(payload))`,
      },
      {
        type: "h2",
        text: "Pydantic in FastAPI",
      },
      {
        type: "p",
        text: "FastAPI uses Pydantic models for request and response validation. Annotating your Pydantic models means the editor and mypy both know the shape of request bodies and response objects. FastAPI will also auto-generate OpenAPI documentation from the models. This is type annotations paying rent: you write the types once and get validation, documentation and editor support for free.",
      },
      {
        type: "code",
        lang: "python",
        text: `from pydantic import BaseModel, Field
from typing import Literal

class NodeReading(BaseModel):
    node_id: str = Field(..., min_length=1, max_length=50)
    temperature: float = Field(..., ge=-40.0, le=125.0)
    alert_level: Literal["normal", "warning", "critical"] = "normal"

@app.post("/readings")
async def submit_reading(reading: NodeReading) -> dict[str, str]:
    # reading.temperature is typed as float; FastAPI validated it on the way in
    return {"status": "ok", "node": reading.node_id}`,
      },
      {
        type: "h2",
        text: "Protocol for Duck Typing",
      },
      {
        type: "p",
        text: "`Protocol` (PEP 544) lets you define structural types without inheritance. A class satisfies a Protocol if it has the right methods - no explicit `implements` declaration needed. This is the right pattern for utility functions that should work with any object that has a specific interface.",
      },
      {
        type: "code",
        lang: "python",
        text: `from typing import Protocol

class Serialisable(Protocol):
    def to_dict(self) -> dict[str, object]: ...

def cache_object(obj: Serialisable, key: str) -> None:
    redis.set(key, json.dumps(obj.to_dict()))

# Any class with a to_dict() method satisfies Serialisable
# without inheriting from it`,
      },
      {
        type: "h2",
        text: "What Not to Over-Annotate",
      },
      {
        type: "ul",
        items: [
          "Local variables: annotating every local variable adds noise without helping mypy much; let it infer",
          "Obvious returns: `def get_name() -> str:` is fine; `name: str = get_name()` on the next line is redundant",
          "Type: ignore: use it rarely and add a comment explaining why; a proliferation of type: ignore comments defeats the purpose",
          "Any: avoid it except at system boundaries (external APIs, dynamic config); propagating Any through your codebase silences errors instead of fixing them",
        ],
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "ol-links",
        items: [
          { text: "PEP 484 - Type Hints (original specification)", url: "https://peps.python.org/pep-0484/" },
          { text: "PEP 544 - Protocols: Structural subtyping", url: "https://peps.python.org/pep-0544/" },
          { text: "mypy documentation - the standard Python static type checker", url: "https://mypy.readthedocs.io/en/stable/" },
          { text: "Python typing documentation - the official typing module reference", url: "https://docs.python.org/3/library/typing.html" },
          { text: "FastAPI - How FastAPI uses Pydantic and Python types", url: "https://fastapi.tiangolo.com/python-types/" },
          { text: "PEP 526 - Syntax for variable annotations (Python 3.6+)", url: "https://peps.python.org/pep-0526/" },
          { text: "Pyright - Microsoft's Python type checker, alternative to mypy", url: "https://github.com/microsoft/pyright" },
        ],
      },
    ],
  },

  // ── DRAFT: COMPETITIVE PROGRAMMING START ──────────────────────────────────────
  {
    slug: "competitive-programming-start",
    title: "How I Started With Competitive Programming (and What I Got Wrong First)",
    date: "2026-09-28",
    type: "journal",
    cover_image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&auto=format&fit=crop&q=80",
    description:
      "A journal entry on starting competitive programming: the first few weeks on Codeforces, what Neetcode and LeetCode taught me that I could not get from coursework and the specific mistakes beginners make that I made too.",
    tags: ["Competitive Programming", "Algorithms", "Learning", "Career", "CS"],
    readingTime: 9,
    published: true,
    content: [
      {
        type: "p",
        text: "I started doing competitive programming seriously in late 2025. I had done [LeetCode](https://leetcode.com) sporadically for interview prep before that, but treating it as exam practice rather than skill-building meant I was grinding without developing intuition. The shift was moving to [Codeforces](https://codeforces.com) for regular contests and using [Neetcode](https://neetcode.io) to build structural understanding of algorithm patterns rather than just solving individual problems. This is what that process looked like from the beginning.",
      },
      {
        type: "h2",
        text: "Why I Started",
      },
      {
        type: "p",
        text: "Two reasons. First: I was embarrassing myself in time-pressured settings. Not in interviews specifically, but in hackathons where I needed to implement something quickly and kept reaching for brute-force approaches because I did not have the pattern library for something better. Knowing that a problem needs a sliding window or a monotonic stack is not the same as having the reflex to recognise it under pressure. That reflex requires repetition.",
      },
      {
        type: "p",
        text: "Second: the maths. My engineering degree is heavy on signals, linear algebra and complex numbers - topics that do not map directly to algorithm design. I wanted to build the discrete mathematics and combinatorics intuition that CS undergraduates develop naturally but that EE curricula skip. Competitive programming is one of the fastest ways to build that specific type of mathematical thinking.",
      },
      {
        type: "h2",
        text: "The First Few Weeks",
      },
      {
        type: "p",
        text: "The first Codeforces contest I entered seriously I solved problems A and B and got stuck on C for 40 minutes before the contest ended. This is completely normal. Codeforces problems A and B at Division 2 level are warm-up problems; C is where the actual thinking starts. At the beginning you will solve A and B comfortably and hit a wall at C. The wall is the work.",
      },
      {
        type: "p",
        text: "The mistake I made in week one was reading solutions immediately after failing. This is tempting - you are stuck, the solution is one click away, you read it and you think you understood it. But reading a solution and writing a solution from a blank page are different cognitive tasks. Read the editorial only after you have spent at least 30 minutes genuinely stuck, and then close the editorial and write the solution yourself without looking at it again.",
      },
      {
        type: "h2",
        text: "Neetcode as a Structured Starting Point",
      },
      {
        type: "p",
        text: "[Neetcode](https://neetcode.io)'s 150 (and later 250) problem list is structured by pattern: two pointers, sliding window, binary search, trees, graphs, dynamic programming and so on. The value is not the problems themselves but the grouping. Seeing five sliding window problems in sequence makes the pattern obvious in a way that encountering them randomly does not. I went through each category in the Neetcode 150 before doing unstructured [Codeforces](https://codeforces.com) practice.",
      },
      {
        type: "p",
        text: "The trap in pattern-grouped practice is false confidence. You can recognise a sliding window problem when you just did ten sliding window problems. The harder skill is recognising it in a mixed set. After finishing a category in Neetcode, I would do several Codeforces problems without looking at the category first, to practice the recognition step.",
      },
      {
        type: "h2",
        text: "What Competitive Programming Does Not Teach You",
      },
      {
        type: "p",
        text: "Competitive programming problems are self-contained and have provably correct solutions with known constraints. Real engineering problems have ambiguous requirements, shifting constraints and no editorial. The skill transfer is in the problem decomposition and the comfort with uncertainty during the solving process - not in the specific algorithms. Do not assume that being good at Codeforces means you will be good at designing systems or debugging production issues. The skills overlap less than they appear to.",
      },
      {
        type: "h2",
        text: "Practical Approach",
      },
      {
        type: "ul",
        items: [
          "Codeforces Division 2 A-C is the right starting range; Division 3 is easier but less representative of real contest difficulty",
          "Virtual contests (past contests run as if live) train time pressure better than upsolving alone",
          "Keep a log of problem types you found hard; review them weekly, not when you happen to encounter the same type again",
          "Time-box solving: 30 minutes on a problem, then take a hint (not a full solution); 30 more minutes, then read the editorial",
          "LeetCode is optimised for interview prep; Codeforces is better for developing algorithmic intuition; use both for what each does well",
        ],
      },
      {
        type: "h2",
        text: "References and Resources",
      },
      {
        type: "ol-links",
        items: [
          { text: "Codeforces - competitive programming platform with rated contests", url: "https://codeforces.com/" },
          { text: "Neetcode - structured algorithm practice with video explanations", url: "https://neetcode.io/" },
          { text: "LeetCode - interview-focused algorithm practice", url: "https://leetcode.com/" },
          { text: "CP-Algorithms - high-quality explanations of common competitive programming algorithms", url: "https://cp-algorithms.com/" },
          { text: "The Algorithm Design Manual - Skiena - better than Cormen for developing problem-solving intuition", url: "https://www.algorist.com/" },
          { text: "Introduction to Algorithms (CLRS) - the standard theoretical reference", url: "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/" },
          { text: "Competitive Programmer's Handbook - Antti Laaksonen (free PDF from cses.fi)", url: "https://cses.fi/book/book.pdf" },
        ],
      },
    ],
  },

  // ── OPEN SOURCE CONTRIBUTING ──────────────────────────────────────────────────
  {
    slug: "open-source-contributing",
    title: "How to Contribute to Open Source: A Practical Guide",
    date: "2026-06-13",
    type: "article",
    cover_image: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=1200&auto=format&fit=crop&q=80",
    description:
      "A practical, honest guide to finding projects worth contributing to, reading a codebase before touching it, making your first pull request and handling review feedback. From someone who has done it and built a 217-topic Git course in the process.",
    tags: ["Open Source", "Git", "GitHub", "Career", "Community"],
    readingTime: 14,
    published: true,
    content: [
      {
        type: "p",
        text: "Open source software is everywhere. The browser you are reading this in, the operating system running it, the programming languages and frameworks that built the web: almost all of it is open source. Millions of developers contribute to it every day. And yet most developers who use open source software have never contributed to it. The gap between user and contributor feels larger than it is.",
      },
      {
        type: "p",
        text: "This post is a practical guide to crossing that gap: finding the right project, understanding the codebase before you touch it, making your first contribution and handling the review process gracefully. It is written from the perspective of someone who has done it repeatedly, built an open source Git course with 217 files and tracked merged PRs to external repos in a personal dashboard.",
      },
      {
        type: "h2",
        text: "What Open Source Actually Is",
      },
      {
        type: "p",
        text: "Open source software is software whose source code is publicly available and licensed in a way that permits others to view, use, modify and distribute it. The licence matters: an MIT licence allows almost anything including commercial use; a GPL licence requires that derivative works also be open source; a proprietary licence with a public GitHub repository is not open source, just public. When people say 'open source contribution' they almost always mean: contributing code, documentation, tests or other improvements to a project under an open source licence.",
      },
      {
        type: "p",
        text: "The open source ecosystem includes everything from single-developer hobby projects to software maintained by foundations and used by billions of people. Linux, Node.js, Python, React, PostgreSQL, VS Code and Firefox are all open source projects you can contribute to. The barrier to entry varies enormously by project size, codebase complexity and maintainer responsiveness.",
      },
      {
        type: "h2",
        text: "Why Contribute?",
      },
      {
        type: "p",
        text: "There are four honest reasons to contribute to open source, and they are all valid.",
      },
      {
        type: "ul",
        items: [
          "Learning: reading and modifying production-quality code written by experienced engineers is one of the fastest ways to level up. You see patterns, conventions and architectural decisions you would not encounter in tutorial projects.",
          "Career: merged pull requests to reputable projects are concrete, verifiable evidence of engineering skill. They link directly from your GitHub profile. They are more credible than side projects you built alone because they survived code review.",
          "Community: you become part of the ecosystem you use. You understand the software better, you meet the people who build it and you occasionally make it better for everyone.",
          "Fixing your own problems: the most immediately motivated contributions are fixing bugs or adding features you personally hit. 'I needed this and it did not exist' is a better motivator than 'I should contribute more'.",
        ],
      },
      {
        type: "h2",
        text: "Finding Projects to Contribute To",
      },
      {
        type: "p",
        text: "The best first contribution is to something you already use. If you use a library, a CLI tool or a framework regularly, you already have context that most first-time contributors lack. You know what it is supposed to do, you probably know the documentation well and you have opinions about what could be clearer or better. Start there.",
      },
      {
        type: "p",
        text: "If you want to explore beyond your existing tools, there are several good starting points. GitHub Explore shows trending repositories and topics. The 'good first issue' label is used by many maintainers specifically to flag tasks that are approachable for newcomers: self-contained, well-described and not requiring deep knowledge of the whole codebase. Filtering by 'good first issue' on GitHub Search or on dedicated sites like [Good First Issue](https://goodfirstissue.dev) returns a curated list of these.",
      },
      {
        type: "p",
        text: "[Up For Grabs](https://up-for-grabs.net) and [First Contributions](https://firstcontributions.github.io) are platforms built specifically to connect first-time contributors with welcoming projects. They are worth browsing if you are looking for a structured starting point.",
      },
      {
        type: "p",
        text: "Language and domain matter. Contributing to a Python project is easier if you are comfortable with Python. Contributing to an embedded firmware project is easier if you know C and have some hardware context. Do not let unfamiliarity be the only filter, stretching is fine, but be realistic about the ramp-up time a completely unfamiliar stack requires.",
      },
      {
        type: "h2",
        text: "Understanding a Codebase Before Touching It",
      },
      {
        type: "p",
        text: "The single biggest mistake first-time contributors make is jumping straight to code before understanding the project. A pull request to a project you do not understand will either be wrong, duplicate existing work or conflict with the maintainer's direction. None of these is obvious until the review, and fixing them is demoralising for everyone.",
      },
      {
        type: "p",
        text: "Before writing a single line, do the following in order. First, read the README completely. It describes what the project is, what it is not and sometimes who it is for. Second, read CONTRIBUTING.md if it exists. This is the maintainer's explicit instructions for how contributions should be structured: branch naming conventions, testing requirements, commit message format, whether to open an issue first. Ignoring this file wastes everyone's time. Third, browse the open issues and pull requests. You will see what problems are being worked on, what the maintainers have already declined and what kind of conversations happen in review. This is the most valuable context you can get before contributing.",
      },
      {
        type: "p",
        text: "Fourth, look at the git log. Understanding how the codebase evolved tells you which parts are stable and which are actively changing. A file that has 47 commits in the last month is not a good place to make a first contribution. A utility module that has not changed in two years and has a well-scoped open bug report is ideal.",
      },
      {
        type: "h2",
        text: "Types of Contribution",
      },
      {
        type: "p",
        text: "Code is not the only way to contribute, and for many projects it is not even the most needed contribution. The types of contribution that maintainers consistently value include:",
      },
      {
        type: "ul",
        items: [
          "Documentation: outdated or unclear documentation is one of the most common complaints about open source projects. Improving a README, fixing a broken example or writing a missing how-to guide are all genuine contributions that require no deep codebase knowledge.",
          "Bug reports: a well-written bug report with a minimal reproducible example is more valuable than most code contributions. 'It does not work' is not a bug report. 'On Windows 11 with Python 3.12, calling function X with argument Y produces Z instead of the documented W, here is the minimal script that reproduces it' is a bug report.",
          "Tests: adding test coverage for edge cases, fixing flaky tests or improving test infrastructure are contributions that help every future change to the project.",
          "Code fixes: fixing a specific, well-scoped bug from the issue tracker. Not architectural refactors on your first contribution. Not rewriting a module. Fix one specific thing.",
          "Translations: documentation and UI translations are valuable for many projects and rarely require deep technical knowledge.",
          "Design and accessibility: improving visual design, fixing accessibility issues or contributing icon assets are legitimate contributions to projects that have a visual or UI component.",
        ],
      },
      {
        type: "h2",
        text: "The Contribution Workflow",
      },
      {
        type: "p",
        text: "Git is the tool that makes open source contribution possible. The standard workflow is fork, clone, branch, commit, push, pull request. Here is each step with enough detail to actually follow it.",
      },
      {
        type: "code",
        lang: "bash",
        text: `# 1. Fork the repo on GitHub (click Fork button) - creates your own copy
# 2. Clone YOUR fork, not the original
git clone https://github.com/YOUR_USERNAME/REPO_NAME.git
cd REPO_NAME

# 3. Add the original repo as 'upstream' so you can pull future changes
git remote add upstream https://github.com/ORIGINAL_OWNER/REPO_NAME.git

# 4. Create a branch for your change - name it descriptively
git checkout -b fix/broken-link-in-readme

# 5. Make your changes, then stage and commit them
git add README.md
git commit -m "fix: correct broken link in installation section"

# 6. Push your branch to YOUR fork
git push origin fix/broken-link-in-readme

# 7. Open a pull request on GitHub from your fork's branch to the upstream main`,
      },
      {
        type: "p",
        text: "A few details that matter. Fork the repository rather than cloning it directly: you do not have write access to the original. Create a new branch for each contribution: committing directly to main in your fork makes it harder to manage multiple contributions simultaneously and makes syncing with upstream messy. Keep branches small and scoped: a pull request that changes three files for a single purpose is much easier to review than one that changes fifteen files for multiple purposes.",
      },
      {
        type: "h2",
        text: "Writing Good Commit Messages and PR Descriptions",
      },
      {
        type: "p",
        text: "A commit message should describe what changed and, more importantly, why. 'Fix bug' is not a commit message. 'Fix null pointer in user lookup when session has expired' is a commit message. The [Conventional Commits](https://www.conventionalcommits.org) format (type: description) is widely used in open source: feat: add dark mode toggle, fix: prevent duplicate API calls on form submit, docs: update installation instructions for Windows. Check whether the project already uses this format before adopting it.",
      },
      {
        type: "p",
        text: "The pull request description is your opportunity to explain the change to the maintainer before they read a single line of code. A good PR description covers: what the change does, why it is needed (link to the issue it addresses), how you tested it and anything the reviewer should pay particular attention to. It does not need to be long. It needs to give the maintainer everything they need to understand and evaluate the change without asking you questions.",
      },
      {
        type: "code",
        lang: "markdown",
        text: `## What does this PR do?
Fixes the broken installation link in README.md that pointed to a deleted
documentation page. Updated to point to the current getting-started guide.

## Why is this needed?
Closes #247. New contributors were hitting a 404 on the first link they
clicked in the README, making a poor first impression.

## How was this tested?
Clicked the updated link in a browser preview. Verified the target page exists.

## Checklist
- [x] I have read CONTRIBUTING.md
- [x] My change passes all existing checks`,
      },
      {
        type: "h2",
        text: "Handling Review Feedback",
      },
      {
        type: "p",
        text: "Your pull request will receive feedback. Some of it will be requests for changes. Some of it will be questions. Some of it, if you are unlucky, will be terse and feel dismissive. None of it is personal.",
      },
      {
        type: "p",
        text: "The correct response to review feedback is: read it carefully, ask for clarification if you genuinely do not understand what is being asked, make the requested changes and push new commits to the same branch. Do not close the PR and open a new one. Do not argue with the reviewer's preferences even if you disagree. This is their project and you are contributing to their vision of it, not your own. If the feedback reveals a fundamental disagreement about the direction of the change, discuss it in the PR comments before investing more time coding.",
      },
      {
        type: "p",
        text: "Some pull requests do not get merged. The maintainer may have a different direction in mind. They may not have time to review it. The project may have become unmaintained. This is not a failure. Every pull request you write, even the ones that are not merged, teaches you about code review, about codebases and about communicating technical decisions. The practice has value independent of the outcome.",
      },
      {
        type: "h2",
        text: "Common Mistakes Beginners Make",
      },
      {
        type: "ul",
        items: [
          "Opening a pull request without reading CONTRIBUTING.md first: most projects have specific requirements for how contributions should be structured. Ignoring these signals to the maintainer that you have not done the minimum expected work.",
          "Making the PR too large: reviewers have limited time. A pull request that touches 20 files for multiple reasons will sit unreviewed. One file, one purpose, one clear description.",
          "Not opening an issue before the PR: for any non-trivial change, comment on an existing issue or open a new one to describe what you want to do and get confirmation that the maintainer is interested before writing the code. Discovering your approach is not wanted after implementing it is demoralising and avoidable.",
          "Copy-pasting solutions without understanding them: if you do not understand what your code does, you cannot defend it in review and you will not learn from the experience.",
          "Getting discouraged by slow responses: open source maintainers are often volunteers working on their own time. A week of silence on a PR is completely normal. A month is not uncommon. Do not interpret silence as rejection.",
          "Forgetting to sync your fork before starting work: if your fork is behind upstream by many commits, your PR will have merge conflicts that you could have avoided by running git fetch upstream and git rebase upstream/main before branching.",
        ],
      },
      {
        type: "h2",
        text: "My Own Experience",
      },
      {
        type: "p",
        text: "I built [git-unlocked](https://github.com/zaccesss/git-unlocked), a free open source MIT-licensed Git and version control course, as a direct response to the frustration of finding existing Git resources either too shallow or paywalled. It spans 217 files covering Git, GitHub, GitLab, Bitbucket, Azure DevOps, IDEs, the terminal, real-world workflows, disaster recovery and a curated resources section. Every file covers Windows, Mac and Linux side by side. The course itself became an exercise in everything this post describes: maintaining a consistent structure across hundreds of files, writing a changelog that documents every decision and keeping the CI pipeline (GitHub Actions running markdown linting and link checking) green.",
      },
      {
        type: "p",
        text: "Beyond git-unlocked, I track merged pull requests to external repositories in my portfolio dashboard. The dashboard pulls from GitHub's API and surfaces the PRs I am most proud of. Seeing them listed there, each one a specific problem in a specific codebase that I found, understood and fixed, is a better record of growth than any course certificate. The habit of contributing builds on itself: each time you understand a new codebase from the outside, the next one takes less time.",
      },
      {
        type: "p",
        text: "The portfolio itself is [open source on GitHub](https://github.com/zaccesss/isaac-adjei-portfolio). Every post on this blog, every page of this site, every API route: all of it is publicly readable code. If you find a bug, there is a CONTRIBUTING.md. You know what to do.",
      },
      {
        type: "quote",
        text: "The value of open source is not just the software. It is the record of how good engineers think.",
        source: "Something I understood after reading enough PRs",
      },
      {
        type: "h2",
        text: "Watch: Contributing to Open Source",
      },
      {
        type: "video",
        youtubeId: "yzeVMecydCE",
        title: "How to Contribute to Open Source on GitHub",
        description: "GitHub's official walkthrough of the fork-and-pull-request workflow, covering everything from finding issues to getting your PR merged.",
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "ol-links",
        items: [
          { text: "GitHub Docs: Contributing to a project", url: "https://docs.github.com/en/get-started/exploring-projects-on-github/contributing-to-a-project" },
          { text: "Open Source Guides: How to Contribute to Open Source (GitHub)", url: "https://opensource.guide/how-to-contribute/" },
          { text: "Choose a Licence - open source licence comparisons", url: "https://choosealicense.com/" },
          { text: "First Contributions - a beginner-friendly project to practice your first PR", url: "https://firstcontributions.github.io/" },
          { text: "Good First Issue - curated list of beginner-friendly open source issues", url: "https://goodfirstissue.dev/" },
          { text: "Up For Grabs - projects that are looking for first-time contributors", url: "https://up-for-grabs.net/" },
          { text: "git-unlocked - my open source Git course (MIT licensed, 217 files)", url: "https://github.com/zaccesss/git-unlocked" },
          { text: "Conventional Commits specification - a lightweight commit message convention", url: "https://www.conventionalcommits.org/" },
          { text: "Wikipedia: Open-source software - background and history", url: "https://en.wikipedia.org/wiki/Open-source_software" },
        ],
      },
    ],
  },
]

export function getPublishedPosts(): BlogPost[] {
  // In dev mode show every post (including drafts and future dates) so cover images can be previewed
  if (process.env.NODE_ENV === "development") return posts
  const today = new Date().toISOString().split("T")[0]
  return posts.filter((p) => p.published && p.date <= today)
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug)
}

// I keep human-readable series titles here so the banner can display them
export const SERIES_LABELS: Record<string, string> = {
  "life-at-aston": "Life at Aston",
}

// I return all published posts that share the same series slug, sorted by part number
export function getSeriesPosts(series: string): Pick<BlogPost, "slug" | "title" | "seriesPart">[] {
  return getPublishedPosts()
    .filter((p) => p.series === series)
    .sort((a, b) => (a.seriesPart ?? 0) - (b.seriesPart ?? 0))
    .map(({ slug, title, seriesPart }) => ({ slug, title, seriesPart }))
}

// I sort published posts newest-first and return the posts immediately before
// and after the given slug so the post page can render prev/next navigation.
export function getAdjacentPosts(slug: string): {
  prev: Pick<BlogPost, "slug" | "title"> | null
  next: Pick<BlogPost, "slug" | "title"> | null
} {
  const published = getPublishedPosts().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  const index = published.findIndex((p) => p.slug === slug)
  if (index === -1) return { prev: null, next: null }
  const prev = index < published.length - 1 ? published[index + 1] : null
  const next = index > 0 ? published[index - 1] : null
  return {
    prev: prev ? { slug: prev.slug, title: prev.title } : null,
    next: next ? { slug: next.slug, title: next.title } : null,
  }
}
