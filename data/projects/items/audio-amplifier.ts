import type { Project } from "../index"

const _audio_amplifier: Project = {
    id: "audio-amplifier",
    title: "Two-Stage Audio Amplifier",
    description:
      "Analogue two-stage amplifier with TL071 active band-pass filter and OPA551 buffer, simulated in Proteus and manufactured as a custom PCB",
    longDescription:
      "Designed and built a two-stage audio amplifier. The brief required a circuit capable of driving an 8 Ω speaker to a specified output level from a single 9 V supply, with a frequency response covering the full audible range. I chose a two-stage topology: a TL071 op-amp configured as an inverting active band-pass filter in Stage 1, followed by an OPA551 unity-gain voltage follower in Stage 2 to supply the current the speaker demands without the first stage having to work against a low-impedance load.\n\nStage 1 achieves a gain of 10.67 dB across a passband of 6.63 Hz to 28.54 kHz, with the upper and lower -3 dB cutoff frequencies set by the RC networks around the op-amp. Vcc/2 virtual ground biasing centres the signal on 4.5 V so the single-supply circuit swings symmetrically. A 2200 µF output coupling capacitor blocks the DC bias from the speaker. Stage 2 uses the OPA551 because it can source up to 200 mA continuously, well above what the TL071 can supply and enough to deliver 281 mW into 8 Ω. Reverse polarity protection is handled by two 1N4007 diodes in series with the supply rails, an LED power indicator and a power switch complete the auxiliary circuitry.\n\nI worked through three build stages before committing to PCB. The circuit was simulated in Proteus with ideal and then real component models, then breadboarded on a dual-supply bench supply to verify gain and bandwidth independently of the biasing network, then rebuilt on a single 9 V supply to confirm the Vcc/2 biasing held stable under load. Only after both breadboard versions matched simulation did I move to PCB layout. The final board is 65 mm x 40 mm, laid out in Proteus with a continuous ground plane, 45-degree mitred track corners and a DRC-clean design. The assembled and powered PCB measured a 2.980 Vpp output against a 3 Vpp target, a 0.67% error.",
    technologies: ["Proteus", "Analogue Design", "PCB Design", "Op-Amp", "Electronics"],
    category: "hardware",
    featured: true,
    images: [
      "/images/projects/audio-amplifier/pcb-angled.webp",
      "/images/projects/audio-amplifier/main.webp",
      "/images/projects/audio-amplifier/pcb-top.webp",
      "/images/projects/audio-amplifier/pcb-underside.webp",
      "/images/projects/audio-amplifier/breadboard-dual.webp",
      "/images/projects/audio-amplifier/breadboard-single.webp",
      "/images/projects/audio-amplifier/freq-response.webp",
      "/images/projects/audio-amplifier/scope-stage1.webp",
      "/images/projects/audio-amplifier/scope-stage2.webp",
      "/images/projects/audio-amplifier/pcb-layout-top.webp",
      "/images/projects/audio-amplifier/3d-model.webp",
      "/images/projects/audio-amplifier/schematic.webp",
    ],
    github: "https://github.com/zaccesss/two-stage-audio-amplifier",
    date: "2026",
    highlights: [
      "Two-stage design: TL071 active band-pass filter (Stage 1) and OPA551 unity-gain buffer (Stage 2)",
      "Gain: 10.67 dB, passband: 6.63 Hz to 28.54 kHz, output: 2.980 Vpp into 8 Ω (281 mW)",
      "Single 9 V supply with Vcc/2 virtual ground biasing and AC coupling",
      "Reverse polarity protection, LED indicator and on/off switch",
      "65 mm x 40 mm PCB laid out in Proteus with ground plane, mitred corners and DRC-clean design",
      "Validated across Proteus simulation, dual-supply breadboard, single-supply breadboard and PCB",
    ],
  }

export default _audio_amplifier
