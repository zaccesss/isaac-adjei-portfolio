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
        text: "I am a Student Representative at Aston Students Union, a Student Member of the IET and active in the Aston Ghana Society, Computing Society and Gaming Society. In 2026 I was named a Top 40 Finalist for the Black Heritage Undergraduate of the Year Award, run by TargetJobs and Sky. I completed the Cancer Research UK 10 Days of 5K Challenge, running more than 50 kilometres to raise funds for cancer research. I also completed a student judging role for the targetjobs National Graduate Recruitment Awards.",
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
        text: "On the technical side: I have designed and built a two-stage audio amplifier as a PCB from scratch, a 4x4x4 NeoPixel LED Cube with adaptive brightness, a full-stack predictive maintenance platform called Phaemos (ongoing), an open-source Git course with over 200 files and Zaccess, an ongoing accessibility tool that uses OCR and text-to-speech to convert lecture slides into readable notes. I work across bare-metal C for microcontrollers, full-stack web with Next.js and Python-based machine learning.",
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
        text: "This report describes the design, simulation, testing and implementation of a two-stage audio amplifier capable of accepting an audio input signal from a mobile phone and amplifying it to drive an external speaker. The amplifier was optimised for use with an iPhone 14 Pro Max, with a design input level of 0.872 Vpp at volume step 15 of 16, corresponding to 70% of the maximum measured output at 440 Hz. The target output is 3 Vpp across an 8 ohm speaker load. The system operates from either a 12 V DC power adapter or a 9 V PP3 battery, with an on/off switch and green LED indicator.",
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
        text: "The printed circuit board was designed in Proteus PCB Layout with overall dimensions of 65 mm x 40 mm. Component placement followed the principle of signal flow from left to right, with the audio input jack socket J1 on the left edge, the power supply terminal block on the top right edge and the speaker output on the bottom right edge. Signal tracks were routed at 0.762 mm and power supply tracks at 1.016 mm. A copper pour was applied to the bottom layer to form a continuous ground plane, reducing ground return impedance and improving electromagnetic compatibility.",
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
          { text: "N. Storey, Electronics: A Systems Approach, 6th ed. Harlow: Pearson, 2017." },
          { text: "P. Horowitz and W. Hill, The Art of Electronics, 3rd ed. Cambridge University Press, 2015." },
          { text: "P. Scherz and S. Monk, Practical Electronics for Inventors, 4th ed. McGraw-Hill, 2016." },
          { text: "H. Zumbahlen, Ed., Linear Circuit Design Handbook. Newnes/Elsevier, 2008.", url: "https://www.analog.com/en/resources/technical-books/linear-circuit-design-handbook.html" },
          { text: "Texas Instruments, Handbook of Operational Amplifier Applications, SBOA092B, 2016.", url: "https://www.ti.com/lit/an/sboa092b/sboa092b.pdf" },
          { text: "Texas Instruments, A Single-Supply Op-Amp Circuit Collection, SLOA058, 2000." },
          { text: "R. Mancini, Ed., Op Amps for Everyone, SLOD006B, Texas Instruments, 2002." },
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
    description:
      "How I built a nine-mode state machine on an ATmega644P from scratch using bare metal C, writing directly to hardware registers with no framework, no HAL and no shortcuts. Still ongoing.",
    tags: ["Embedded", "AVR", "C", "Microcontroller", "Aston"],
    readingTime: 8,
    published: true,
    content: [
      {
        type: "p",
        text: "Most embedded tutorials start with a framework. Arduino, HAL, CubeMX. They abstract away the hardware so you can get an LED blinking in five minutes without understanding a single register. That is fine for prototyping. It is not fine for learning.",
      },
      {
        type: "p",
        text: "This project was a deliberate choice to do the opposite. I wanted to write directly to hardware registers on an ATmega644P microcontroller with no library in between. To understand not just what the code does but what the silicon does when the code runs.",
      },
      {
        type: "h2",
        text: "The Hardware",
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
    ],
  },

  // ── NEOPIXEL LED CUBE ────────────────────────────────────────────────────────
  {
    slug: "neopixel-led-cube",
    title: "64 LEDs, One Cube: How I Built a 4x4x4 NeoPixel LED Cube with Adaptive Brightness",
    date: "2025-12-01",
    type: "blog",
    projectSlug: "led-cube",
    description:
      "A walkthrough of building a 4x4x4 NeoPixel LED Cube with four animation modes and automatic brightness adjustment via an LDR sensor, using Arduino and bare C++.",
    tags: ["Arduino", "C++", "LED", "Hardware", "IoT"],
    readingTime: 6,
    published: true,
    content: [
      {
        type: "p",
        text: "The NeoPixel LED Cube started as a university assignment and turned into something I am genuinely proud of. 64 individually addressable WS2812B LEDs, hand-soldered into a 4x4x4 matrix, controlled by an Arduino Uno with adaptive brightness and physical button controls. No pre-made cube kit. Built from scratch.",
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
        text: "Power budgeting was one of the most important design decisions. Each WS2812B LED draws up to 60 mA at full white brightness. With 64 LEDs that is potentially 3.84 A. Running all LEDs at full white would require a substantial power supply and would generate significant heat. The solution was to cap brightness in software and never display full white on all LEDs simultaneously. In practice the cube draws well under 2 A during normal operation.",
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
    ],
  },

  // ── PHAEMOS ───────────────────────────────────────────────────────────────────
  {
    slug: "phaemos-predictive-maintenance",
    title: "Phaemos: Building a Predictive Maintenance Platform from Firmware to Dashboard",
    date: "2026-05-14",
    type: "blog",
    projectSlug: "phaemos",
    description:
      "How I built Phaemos, an ongoing full-stack predictive maintenance system that collects sensor telemetry from ESP32 and STM32 hardware nodes, scores anomalies with Isolation Forest and presents everything on a live Next.js dashboard.",
    tags: ["FastAPI", "Next.js", "ESP32", "ML", "IoT", "Python"],
    readingTime: 8,
    published: true,
    content: [
      {
        type: "p",
        text: "Phaemos is a smart maintenance platform I am actively building. The name comes from Ancient Greek roots meaning an ordered system that reveals. The tagline is: reveal before failure. That is exactly what it does: collects real-time sensor data from hardware nodes, scores every reading with a machine learning model and raises alerts before a fault becomes visible to the naked eye.",
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
        text: "The hardware layer uses three types of nodes. The primary node is an ESP32 acting as the Wi-Fi gateway, consolidating readings from the sensors and POSTing them to the backend every 5 seconds. An Arduino Uno reads a DHT22 (temperature and humidity), an LDR (ambient light) and a DS18B20 (temperature) and sends formatted serial strings to the ESP32 for merging. A separate STM32 node handles high-frequency vibration: it samples an MPU6050 accelerometer at 100Hz, computes a short-window FFT and outputs a peak vibration frequency value per second over UART.",
      },
      {
        type: "p",
        text: "The STM32 FFT is the most technically interesting part of the hardware layer. Rather than sending raw acceleration values, it sends a single peak frequency. This dramatically reduces the data the backend needs to process and gives the ML model a far richer vibration signal: you can detect resonance at specific frequencies that indicate bearing wear, imbalance or cavitation, which raw acceleration alone cannot distinguish.",
      },
      {
        type: "h2",
        text: "Backend: FastAPI and PostgreSQL",
      },
      {
        type: "p",
        text: "The backend is a FastAPI application in Python 3.11, backed by PostgreSQL 15 and Redis. On every incoming telemetry POST it: validates the device API key, stores the reading, evaluates all alert rules for that device, scores the reading through the ML model, updates the device status and last-seen timestamp and returns a 200 response. The target is under 200ms end to end.",
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
        text: "The full stack runs with Docker Compose locally and deploys to Vercel (frontend) and Render (backend and database). The CHANGELOG tracks every version: what was added, what changed, what security issue was addressed. The most recent unreleased version added GitHub Actions CI (backend linting and frontend type-checking), gitleaks secret scanning, Dependabot for automated dependency updates and a biweekly workflow that opens a security issue automatically if npm audit reports production vulnerabilities.",
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
    ],
  },

  // ── GIT-UNLOCKED ─────────────────────────────────────────────────────────────
  {
    slug: "git-unlocked-open-source-course",
    title: "Why I Built a Free Git Course with 217 Files and No Paywall",
    date: "2026-04-21",
    type: "blog",
    projectSlug: "git-unlocked",
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
        text: "git-unlocked is my attempt to fix that. It is a free, open-source Git and version control course covering everything from absolute zero to professional-level knowledge. 217 files. 12 sections. MIT licensed. No paywall.",
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
          "A GitHub Pages site at zaccesss.github.io/git-unlocked",
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
    ],
  },

  // ── BRITISH AIRWAYS ENGINEERING ───────────────────────────────────────────────
  {
    slug: "british-airways-engineering-simulation",
    title: "Inside British Airways Engineering: What a Maintenance Simulation Taught Me",
    date: "2025-10-01",
    type: "journal",
    description:
      "Reflections on the British Airways Engineering Virtual Experience on Forage, covering A320 maintenance planning, C-check operations and what aviation engineering looks like from the inside.",
    tags: ["British Airways", "Aviation", "Engineering", "Maintenance", "Career"],
    readingTime: 5,
    published: true,
    content: [
      {
        type: "p",
        text: "In October 2025 I completed the British Airways Engineering Virtual Experience on Forage. It was a structured simulation of real maintenance and supply-chain operations, and it gave me a genuinely different perspective on what engineering looks like at scale.",
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
    ],
  },

  // ── YUNEX TRAFFIC ────────────────────────────────────────────────────────────
  {
    slug: "yunex-traffic-virtual-experience",
    title: "Smart Cities and Clean Air: What I Learned at Yunex Traffic",
    date: "2025-08-20",
    type: "journal",
    description:
      "Reflections on the Yunex Traffic Smart Mobility and Environmental Sustainability virtual work experience, covering intelligent transport systems, Zephyr air quality sensors and what the engineers behind smart cities actually do.",
    tags: ["Yunex", "IoT", "Transport", "Smart Cities", "Virtual"],
    readingTime: 4,
    published: true,
    content: [
      {
        type: "p",
        text: "In August 2025 I completed Yunex Traffic's Smart Mobility and Environmental Sustainability virtual work experience via Springpod. Yunex Traffic is one of the largest providers of intelligent transport systems in the world. The programme explored how digital technology improves urban air quality and traffic efficiency.",
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
    ],
  },

  // ── BUSINESS ANALYTICS ───────────────────────────────────────────────────────
  {
    slug: "business-analytics-data-to-decisions",
    title: "Learning Business Analytics: From Probability to Machine Learning",
    date: "2026-05-01",
    type: "research",
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
          "Phase 2 - Python primer: syntax, data structures, functions and flow control",
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
    ],
  },

  // ── EXISTING POSTS ───────────────────────────────────────────────────────────
  {
    slug: "building-my-portfolio",
    title: "Building My Portfolio: Decisions, Stack and What I Learned",
    date: "2025-04-12",
    type: "blog",
    description:
      "How I rebuilt my portfolio from scratch using Next.js, React, TypeScript, Tailwind CSS and Node.js: the full tech stack, every design decision and what shipping something personal actually teaches you.",
    tags: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js", "Design", "Vercel"],
    readingTime: 10,
    published: true,
    content: [
      {
        type: "p",
        text: "I had a version of a portfolio online for a while: a terminal-style single-page HTML file at zacess.com. It was fun to build and genuinely terminal-accurate, but it did not show off my work in a way that felt useful to a recruiter or someone who wanted to understand what I actually do. No project pages. No blog. No way to see anything beyond a blinking cursor.",
      },
      {
        type: "p",
        text: "So I rebuilt from scratch. This post covers the full tech stack, the decisions behind it and what I learned along the way.",
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
          "Vercel: deployment platform with automatic deploys on every push to main",
          "Cloudflare: DNS provider routing isaacadjei.me",
          "GitHub Actions: CI pipeline running lint and build checks on every pull request",
          "Resend: API for the contact form email delivery",
          "Beehiiv: newsletter subscription management",
          "Cloudflare Turnstile: CAPTCHA on the contact form, privacy-respecting alternative to reCAPTCHA",
          "Upstash Redis: serverless rate limiting on the contact form API route",
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
        text: "I had already used Next.js on Phaemos and the zacess.com terminal site, so the learning curve was not the reason to choose it. The reason was that it was genuinely the right tool for what I wanted to build.",
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
        text: "I had used traditional CSS on AstonCV (pure custom CSS, no frameworks) and Tailwind on Phaemos. The comparison is instructive. With traditional CSS, naming things is genuinely hard. What do you call the container that wraps the project card header? How do you avoid naming collisions as the stylesheet grows? BEM helps but adds verbosity.",
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
        text: "The site deploys automatically on every push to the main branch via Vercel's GitHub integration. The main branch has branch protection: every change must go through a pull request and pass the Lint and Build GitHub Actions check before merging. This means broken code never reaches production.",
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
    ],
  },

  // ── ASTONCV ──────────────────────────────────────────────────────────────────
  {
    slug: "astoncv-full-stack-cv-database",
    title: "Building AstonCV: A Full-Stack CV Database with PHP, MySQL and Zero Frameworks",
    date: "2026-05-13",
    type: "blog",
    projectSlug: "astoncv",
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
        text: "AstonCV is a CV database where anyone can browse and search student CVs publicly, register an account, manage their own CV once logged in and download any CV as a professionally formatted PDF. The site is deployed live on Aston University's internal Apache server and accessible via a custom Cloudflare domain redirect at astoncv.zacess.com.",
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
        text: "I had used Next.js on Phaemos and this portfolio. Those projects gave me the framework experience. AstonCV was an opportunity to work at a lower level and understand what is actually happening when a form submits, a session is validated or a query hits the database.",
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
    ],
  },

  {
    slug: "week-1-aston",
    title: "Week 1 at Aston: What Second Year Actually Feels Like",
    date: "2025-09-22",
    type: "journal",
    description:
      "A journal entry I will write properly once second year officially begins. Check back soon.",
    tags: ["University", "EECS", "Year 2"],
    readingTime: 3,
    published: true,
    series: "life-at-aston",
    seriesPart: 1,
    content: [],
  },

  // ── DRAFTS ────────────────────────────────────────────────────────────────────
  {
    slug: "iot-security-gaps",
    title: "Security Gaps in Consumer IoT: A Survey of Common Attack Vectors",
    date: "2025-11-30",
    type: "research",
    description:
      "A review of common vulnerabilities in consumer IoT devices: hardcoded credentials, unencrypted traffic and insufficient update mechanisms, with notes on what better design looks like.",
    tags: ["IoT", "Security", "Research", "Embedded"],
    readingTime: 10,
    published: false,
    content: [
      {
        type: "p",
        text: "Consumer IoT devices are everywhere and most of them are insecure by design. This is not a niche problem. It is a structural one. The pressure to ship products quickly and cheaply consistently wins over the time required to build security in from the start.",
      },
      {
        type: "h2",
        text: "Hardcoded Credentials",
      },
      {
        type: "p",
        text: "The most common and embarrassing vulnerability in consumer IoT is the hardcoded default credential. A router, IP camera or smart plug ships with a default username and password that is identical across every unit of that model. Many users never change it. Attackers know this and can trivially identify devices on public IP ranges using tools like Shodan.",
      },
      {
        type: "h2",
        text: "Unencrypted Traffic",
      },
      {
        type: "p",
        text: "Many IoT devices transmit data without encryption. Sensor readings, authentication tokens and control commands are sent in plaintext over the local network or the internet. Anyone who can observe network traffic, which on an unprotected Wi-Fi network means anyone nearby, can read and potentially replay those messages.",
      },
      {
        type: "h2",
        text: "Insufficient Update Mechanisms",
      },
      {
        type: "p",
        text: "Firmware vulnerabilities are discovered regularly. A device that cannot receive over-the-air updates, or that requires manual intervention most users will never perform, remains vulnerable indefinitely. Many low-cost IoT products have no update mechanism at all. Some that do have one require the update binary to be signed but do not verify the signature correctly.",
      },
      {
        type: "h2",
        text: "What Better Design Looks Like",
      },
      {
        type: "ul",
        items: [
          "Force unique credentials at first boot: no shared defaults across units",
          "Encrypt all communications: TLS for HTTP endpoints, DTLS for MQTT",
          "Sign firmware updates and verify signatures before applying",
          "Implement a secure boot chain so compromised firmware cannot persist across restarts",
          "Expose only the network services the device actually needs: close everything else",
          "Log authentication attempts and rate-limit failed logins",
        ],
      },
    ],
  },
  {
    slug: "spi-vs-i2c",
    title: "SPI vs I2C: When to Use Which",
    date: "2026-01-14",
    type: "notes",
    description:
      "Quick reference notes comparing SPI and I2C for embedded projects: speed, wiring, use cases and when the choice actually matters.",
    tags: ["SPI", "I2C", "Embedded", "Notes"],
    readingTime: 4,
    published: false,
    content: [
      {
        type: "p",
        text: "SPI and I2C are the two serial protocols you will encounter in almost every embedded project. Both transfer data between a microcontroller and peripherals. They are not interchangeable and the choice between them matters.",
      },
      {
        type: "h2",
        text: "SPI: Serial Peripheral Interface",
      },
      {
        type: "p",
        text: "SPI uses four wires: MOSI (master out, slave in), MISO (master in, slave out), SCLK (clock) and CS (chip select, one per device). It is a synchronous full-duplex protocol: data moves in both directions simultaneously on every clock cycle. Speeds typically range from a few MHz up to 50 MHz or more depending on the device.",
      },
      {
        type: "ul",
        items: [
          "Fast: typically 10-50 MHz, sometimes higher",
          "Full-duplex: read and write simultaneously",
          "Simple protocol: no addressing, no ACK/NACK",
          "One CS pin required per device: adds pins as devices increase",
          "Good for: SD cards, displays, ADCs, high-speed sensors",
        ],
      },
      {
        type: "h2",
        text: "I2C: Inter-Integrated Circuit",
      },
      {
        type: "p",
        text: "I2C uses two wires: SDA (data) and SCL (clock). Multiple devices share the same bus, each with a unique 7-bit address. The master initiates all transactions. Standard mode is 100 kHz, fast mode is 400 kHz and fast-plus mode reaches 1 MHz. I2C is half-duplex: data moves in one direction at a time.",
      },
      {
        type: "ul",
        items: [
          "Slower: typically 100-400 kHz in practice",
          "Half-duplex: one direction at a time",
          "Addressing: up to 127 devices on two wires",
          "ACK/NACK: the protocol confirms receipt of each byte",
          "Good for: temperature sensors, IMUs, EEPROMs, real-time clocks",
        ],
      },
      {
        type: "h2",
        text: "How to Choose",
      },
      {
        type: "p",
        text: "Use SPI when speed matters or when you are dealing with large data transfers such as an SD card or a display. Use I2C when you have many low-bandwidth devices and want to minimise pin count. If a device is available in both, check your microcontroller's available peripherals and pin count first, then consider the data rate you actually need.",
      },
      {
        type: "quote",
        text: "The best protocol is the one the device you need comes in.",
        source: "Practical embedded engineering lesson",
      },
    ],
  },
]

export function getPublishedPosts(): BlogPost[] {
  return posts.filter((p) => p.published)
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
