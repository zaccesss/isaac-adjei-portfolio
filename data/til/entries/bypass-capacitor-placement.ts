import type { TILEntry } from "../index"

const _bypass_capacitor_placement: TILEntry = {
    id: "bypass-capacitor-placement",
    title: "Bypass capacitors must be placed as close as possible to the IC power pins to work",
    date: "2026-08-11",
    category: "Embedded",
    published: true,
    body: "A bypass (decoupling) capacitor smooths voltage spikes on the power supply of an IC. At high switching frequencies, the parasitic inductance of PCB traces makes even short runs significant: inductance is proportional to trace length. A 100 nF capacitor placed 10 mm away from the IC power pin may not suppress the spike at all because the trace inductance resonates with the capacitor and creates a notch at exactly the wrong frequency. During the audio amplifier build I learned this the hard way when a distant bypass cap did nothing for high-frequency noise.",
    detail: [
      {
        type: "p",
        text: "The general rule: a 100 nF ceramic capacitor as close as possible to each VCC pin, and a 10 µF bulk capacitor somewhere on the power rail to handle lower-frequency transients. For high-speed ICs (clock above 100 MHz), a second smaller cap (10 nF) placed even closer can handle the very fast edges. The return path matters as much as the cap placement: a ground pour under the IC with a short trace to the cap's ground pin completes the loop. A long ground trace adds inductance that undoes the benefit of placing the cap close.",
      },
      {
        type: "note",
        text: "The audio amplifier project taught me this empirically: moving the bypass cap from 15 mm to 2 mm from the op-amp VCC pin dropped high-frequency noise by 12 dB. The schematic was identical; only the layout changed.",
      },
    ],
    tags: ["hardware", "PCB", "embedded", "power"],
    relatedPost: "audio-amplifier-design",
  }

export default _bypass_capacitor_placement
