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
        type: "image",
        src: "/images/projects/led-cube/neopixel-main.jpg",
        alt: "4x4x4 NeoPixel LED Cube showing an active animation",
        caption: "The finished 4x4x4 NeoPixel LED Cube - 64 WS2812B LEDs hand-soldered into a matrix",
      },
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
      "How I am building Phaemos - a full-stack predictive maintenance platform with four hardware nodes (ESP32, STM32 Black Pill, Arduino Nano, Raspberry Pi Pico 2W), 11 sensors, a FastAPI backend, Isolation Forest ML and a live Next.js dashboard.",
    tags: ["FastAPI", "Next.js", "ESP32", "STM32", "ML", "IoT", "Python", "MicroPython"],
    readingTime: 10,
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
    type: "notes",
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
    date: "2025-09-01",
    type: "blog",
    description:
      "How I rebuilt my portfolio from scratch and kept building it: Next.js App Router, TypeScript, Tailwind CSS, Upstash Redis, Vercel, Python daemons for live device status, a custom PS5 OAuth v2 Cloudflare Worker, 5-tier GPC game detection with IGDB cover art, Discord presence via Lanyard and Spotify now-playing - and what shipping something personal actually teaches you.",
    tags: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Redis", "Vercel", "Python"],
    readingTime: 15,
    published: true,
    content: [
      {
        type: "p",
        text: "For a while my portfolio was a terminal-style single-page HTML file at zacess.com. It worked, it was fun and I was genuinely proud of it at the time. Looking back, it was mostly vibe-coded: I built it by piecing together things I had found online without deeply understanding what I was doing. It loaded fast, looked interesting and told you almost nothing about my actual work. No project pages. No blog. No way to see anything beyond a blinking cursor and a few hardcoded text responses.",
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
        text: "The system works through a set of Python daemons. The MacBook daemon runs via launchd on macOS and writes battery percentage, charging state, timezone and weather data to an Upstash Redis key every 30 seconds with a 600-second TTL. If the daemon stops running the key expires and the card shows the last-known state. The Lenovo and Gaming PC daemons run as Windows services via NSSM and report battery, CPU and GPU usage. The Gaming PC daemon uses pynvml to read NVIDIA GPU utilisation directly.",
      },
      {
        type: "p",
        text: "Weather data comes from Open-Meteo, a free API powered by the European Centre for Medium-Range Weather Forecasts (ECMWF) model. The daemon uses CoreLocationCLI to get GPS coordinates from macOS Location Services, giving street-level precision instead of the city-level IP geolocation I used originally. No API key is needed for Open-Meteo.",
      },
      {
        type: "p",
        text: "Discord presence comes from the Lanyard API, which reads my Discord Rich Presence in real time. When I am coding in VS Code, PreMiD is active or a game is running, the widget shows it. The Lanyard WebSocket connection means updates appear within seconds. The PS5 card uses a Cloudflare Worker that polls the PlayStation Network API every 60 seconds using an NPSSO session token stored in Cloudflare secrets, writing the result to the same Redis instance.",
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
        text: "I chose Supabase (hosted PostgreSQL) for the dashboard data layer. The alternative was a flat file store, which would have been simpler but would not support the query patterns I needed: filtering applications by status, sorting by date, searching across all inventory items. PostgreSQL gives me a proper relational model with indexes where they matter.",
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

  // ── ARTICLE ──────────────────────────────────────────────────────────────────
  {
    slug: "why-software-engineers-should-understand-hardware",
    title: "Why Every Software Engineer Should Understand Hardware",
    date: "2026-03-10",
    type: "article",
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
        text: "I study Electronic Engineering and Computer Science, which means I do not have the option of staying on one side. I have spent semesters writing bare metal C on a custom PCB and semesters building full-stack web applications with TypeScript and React. The crossover has changed how I think about software in ways that are hard to explain but easy to demonstrate.",
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
    ],
  },

  // ── RESOURCES ────────────────────────────────────────────────────────────────
  {
    slug: "resources-engineering-and-technology",
    title: "Resources for Engineering and Technology",
    date: "2026-02-20",
    type: "resources",
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
          { text: "The Art of Electronics - Horowitz and Hill (3rd ed.) - the definitive electronics reference. Dense but readable. Buy it.", url: "https://www.cambridge.org/gb/academic/subjects/physics/electronics-and-optoelectronics/art-electronics-3rd-edition" },
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
    description:
      "A technical review of the most common vulnerabilities in consumer IoT devices: hardcoded credentials, unencrypted traffic, insufficient update mechanisms and insecure interfaces, with reference to real incidents, CVEs and regulatory standards.",
    tags: ["IoT", "Security", "Research", "Embedded", "Networking"],
    readingTime: 14,
    published: true,
    content: [
      {
        type: "p",
        text: "Consumer IoT devices are everywhere and most of them are insecure by design. In 2022 there were over 14 billion connected IoT devices globally, a number that will exceed 25 billion by 2030 according to Statista. Each of those devices is a potential entry point. The security research community has documented the same categories of vulnerability repeatedly for a decade. The problems persist not because they are hard to fix but because market incentives do not reward fixing them.",
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
        text: "The vulnerability is trivially discoverable. Shodan, a search engine that indexes internet-connected devices, returns results for default credentials with simple queries. Researchers at Symantec found in 2019 that 98% of IoT traffic was unencrypted and that the most attacked device types were routers and IP cameras, both categories notorious for unchanged default credentials. The fix is not technically difficult: force credential change at first boot, generate a unique random password per unit or use device-specific secrets derived from hardware identifiers. The reason it does not happen is that it adds friction to unboxing, which affects return rates.",
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
        text: "The OWASP IoT Top 10 (2018 edition) provides a complementary checklist of the most critical vulnerability categories: weak passwords, insecure network services, insecure ecosystem interfaces, lack of secure update mechanism, use of insecure or outdated components, insufficient privacy protection, insecure data transfer and storage, lack of device management, insecure default settings and lack of physical hardening.",
      },
      {
        type: "h2",
        text: "What Better Design Looks Like",
      },
      {
        type: "ul",
        items: [
          "Force unique credentials at first boot with a minimum entropy requirement - no shared defaults across units",
          "Encrypt all communications: TLS 1.2 or higher for HTTP and MQTT, DTLS for constrained devices using CoAP",
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
          { text: "Cloudflare DDoS coverage and incident analysis", url: "https://blog.cloudflare.com/tag/ddos/" },
          { text: "JSOF Research: Ripple20 - 19 Zero-Day Vulnerabilities (2020)", url: "https://www.jsof-tech.com/disclosures/ripple20/" },
          { text: "Vanhoef, M. & Piessens, F.: Key Reinstallation Attacks (KRACK) - ACM CCS 2017", url: "https://papers.mathyvanhoef.com/ccs2017.pdf" },
          { text: "NVD: CVE-2021-28372 Kalay Platform vulnerability", url: "https://nvd.nist.gov/vuln/detail/CVE-2021-28372" },
          { text: "ETSI EN 303 645: Cyber Security for Consumer IoT baseline requirements", url: "https://www.etsi.org/committee/1372-cyber" },
          { text: "OWASP IoT Top 10 (2018 edition)", url: "https://owasp.org/www-project-internet-of-things/" },
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
        text: "Use SPI when throughput matters. Streaming data from a display, logging to an SD card or reading a high-speed ADC all demand the bandwidth SPI provides. Use I2C when you have several low-bandwidth configuration or sensor devices and pin count is a constraint. A typical node in a Phaemos sensor board uses I2C for the BME280 environmental sensor and the DS3231 RTC (three devices, two wires total) and SPI for the W25Q flash memory (high-speed writes, full-duplex).",
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
          { text: "AVR151: Setup and Use of the SPI - Microchip application note", url: "https://ww1.microchip.com/downloads/en/AppNotes/Atmel-2585-Setup-and-Use-of-the-SPI_ApplicationNote_AVR151.pdf" },
          { text: "AVR315: Using the TWI Module as I2C Master - Microchip application note", url: "https://ww1.microchip.com/downloads/en/AppNotes/doc2564.pdf" },
          { text: "Analog Devices tutorials and application notes - I2C and SPI reference material", url: "https://www.analog.com/en/resources/technical-articles.html" },
          { text: "ST application notes for STM32 I2C peripherals", url: "https://www.st.com/en/microcontrollers-microprocessors/stm32-32-bit-arm-cortex-mcus.html" },
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
    description:
      "How to set up UART on an AVR microcontroller using bare metal C, configure baud rate registers, transmit and receive bytes and debug embedded systems over a serial monitor.",
    tags: ["UART", "Embedded", "AVR", "C", "Serial"],
    readingTime: 8,
    published: false,
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
          { text: "AVR306: Using the AVR UART in C - Microchip application note", url: "https://ww1.microchip.com/downloads/en/AppNotes/doc1451.pdf" },
          { text: "AVR-libc reference manual: Standard IO facilities and fdev_setup_stream", url: "https://www.nongnu.org/avr-libc/user-manual/group__avr__stdio.html" },
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
    description:
      "A practical introduction to real-time operating systems: what a task scheduler does, why timing guarantees matter in embedded systems and how FreeRTOS implements preemptive multitasking on a microcontroller.",
    tags: ["RTOS", "FreeRTOS", "Embedded", "C", "Scheduling"],
    readingTime: 10,
    published: false,
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
        type: "h2",
        text: "Tasks and the Scheduler",
      },
      {
        type: "p",
        text: "In FreeRTOS (the most widely used open-source RTOS), a task is a function with its own stack and execution state. Each task has a priority from 0 (lowest) to configMAX_PRIORITIES-1 (highest). The scheduler runs the highest-priority task that is ready to execute. If a higher-priority task becomes ready while a lower-priority task is running, the scheduler preempts the running task immediately and switches to the higher-priority one. This is preemptive multitasking.",
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
        type: "quote",
        text: "An RTOS does not make your system faster. It makes your system predictable.",
        source: "Embedded systems engineering principle",
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "ol-links",
        items: [
          { text: "FreeRTOS: Mastering the FreeRTOS Real Time Kernel (free PDF)", url: "https://www.freertos.org/Documentation/RTOS_book.html" },
          { text: "Mars Pathfinder priority inversion bug - Glenn Reeves, JPL (1997)", url: "https://www.rapitasystems.com/blog/what-really-happened-software-mars-pathfinder-spacecraft" },
          { text: "Buttazzo, G.: Hard Real-Time Computing Systems (Springer, 3rd ed.)", url: "https://link.springer.com/book/10.1007/978-1-4614-0676-1" },
          { text: "Joseph Yiu: The Definitive Guide to ARM Cortex-M3 and Cortex-M4 Processors", url: "https://www.sciencedirect.com/book/9780124080829/the-definitive-guide-to-arm-cortex-m3-and-cortex-m4-processors" },
          { text: "FreeRTOS stack overflow detection and checking", url: "https://www.freertos.org/Stacks-and-stack-overflow-checking.html" },
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
          { text: "Shields et al.: Intra-arterial chemotherapy for retinoblastoma globe salvage - search on PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/?term=shields+intra-arterial+chemotherapy+retinoblastoma+globe+salvage" },
          { text: "Humayun et al.: International trial of Second Sight Argus II visual prosthesis - search on PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/?term=humayun+argus+second+sight+visual+prosthesis+international+trial" },
          { text: "Palanker et al.: Photovoltaic restoration of central vision in AMD - PRIMA trial (Nature Medicine 2020) - search on PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/?term=palanker+photovoltaic+restoration+central+vision+AMD+prima" },
          { text: "Sahel et al.: Partial recovery of visual function after optogenetic therapy (Nature Medicine 2021) - search on PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/?term=sahel+partial+recovery+visual+function+optogenetic+therapy+blind" },
          { text: "Beauchamp et al.: Dynamic stimulation of visual cortex produces form vision in blind humans (Cell 2020) - search on PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/?term=beauchamp+dynamic+stimulation+visual+cortex+form+vision+sighted+blind" },
          { text: "Retinoblastoma.net: patient and research information", url: "https://www.retinoblastoma.net/" },
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
    description:
      "The TypeScript features and patterns that have made the biggest practical difference in real codebases: discriminated unions, the satisfies operator, branded types, const assertions and when strict mode actually catches bugs.",
    tags: ["TypeScript", "Software Engineering", "Web", "Best Practices"],
    readingTime: 9,
    published: true,
    content: [
      {
        type: "p",
        text: "TypeScript is not just JavaScript with types sprinkled on top. Used well, it changes how you design code and catches entire categories of bugs before they reach production. Used poorly, it becomes a type annotation layer that everyone works around with any and type assertions. The difference is in which features you reach for and when.",
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
          { text: "TypeScript Handbook - official documentation", url: "https://www.typescriptlang.org/docs/handbook/intro.html" },
          { text: "TypeScript 4.9 release notes: the satisfies operator", url: "https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html" },
          { text: "Matt Pocock: Total TypeScript - advanced TypeScript patterns", url: "https://www.totaltypescript.com/" },
          { text: "TypeScript Deep Dive - Basarat Ali Syed (free online)", url: "https://basarat.gitbook.io/typescript/" },
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
    description:
      "How Direct Memory Access works on microcontrollers, why it matters for high-throughput embedded systems and how to configure a DMA transfer on an STM32 without relying on HAL.",
    tags: ["DMA", "STM32", "Embedded", "C", "Performance"],
    readingTime: 9,
    published: false,
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
        type: "quote",
        text: "DMA moves the data. The CPU moves the product.",
        source: "Embedded systems engineering principle",
      },
    ],
  },

  // ── DRAFT: FPGA INTRO ────────────────────────────────────────────────────────
  {
    slug: "fpga-vhdl-introduction",
    title: "Getting Started with FPGAs: What They Are and How to Think About Them",
    date: "2026-05-29",
    type: "blog",
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
        text: "A modern FPGA contains three main types of resources. Logic elements (called LUTs - look-up tables - in most architectures) are small configurable truth tables that implement any boolean function of their inputs. Flip-flops store state. Block RAMs are fixed hard memories typically 18 Kbit or 36 Kbit in size, used for FIFOs, lookup tables and local storage. Higher-end FPGAs also contain DSP blocks (hardware multiplier-adder units), clock management tiles and, on devices like the Xilinx Zynq, hardened ARM processor cores alongside the programmable fabric.",
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
        text: "The two major FPGA vendors are AMD (formerly Xilinx) and Intel (formerly Altera). Both provide free development environments: Vivado (AMD, download from amd.com) and Quartus Prime Lite (Intel, download from intel.com). Both are large downloads - 50-80 GB - but the free tiers cover a wide range of entry-level devices. For a beginner board, the Basys 3 (Digilent, Xilinx Artix-7) is the most widely used in university courses. The iCEstick (Lattice iCE40) is a cheaper alternative that works with the fully open-source IceStorm toolchain (Yosys synthesiser plus nextpnr place-and-route), which is easier to understand than Vivado or Quartus. The Nand2Tetris course at nand2tetris.org builds a complete computer from logic gates up and gives you the conceptual foundation that makes VHDL make sense before you write a single line of it.",
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
          { text: "AMD Vivado Design Suite - free download for Xilinx/AMD FPGAs", url: "https://www.amd.com/en/products/software/adaptive-socs-and-fpgas/vivado.html" },
          { text: "Intel Quartus Prime Lite - free download for Intel FPGAs", url: "https://www.intel.com/content/www/us/en/products/details/fpga/development-tools/quartus-prime/resource.html" },
          { text: "Digilent Basys 3 - most widely used FPGA learning board (Xilinx Artix-7)", url: "https://digilent.com/reference/programmable-logic/basys-3/start" },
          { text: "Lattice iCEstick - low-cost iCE40 FPGA with open-source toolchain", url: "https://www.latticesemi.com/icestick" },
          { text: "IceStorm/YosysHQ open-source FPGA toolchain (Yosys + nextpnr)", url: "https://github.com/YosysHQ/icestorm" },
          { text: "Nand2Tetris - build a computer from logic gates to OS, free", url: "https://www.nand2tetris.org/" },
          { text: "VHDL Language Reference Manual (IEEE Std 1076-2019)", url: "https://standards.ieee.org/ieee/VHDL/7537/" },
        ],
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
