import type { TILEntry } from "../index"

const _adc_reference_voltage_quality: TILEntry = {
    id: "adc-reference-voltage-quality",
    title: "ADC accuracy is only as good as its reference voltage",
    date: "2026-08-04",
    category: "Embedded",
    published: true,
    body: "An ADC converts an analogue voltage to a digital value by comparing it to a reference. If the reference voltage drifts by 1%, every reading drifts by 1%: and the ADC has no way to detect this. On STM32 you can use the internal VREFINT (nominally 1.2 V) measured against the actual supply, but for precision applications a dedicated voltage reference IC (e.g. [LM4040](https://www.ti.com/product/LM4040-N), [REF3312](https://www.ti.com/product/REF3312)) with low temperature drift is worth the extra component. During a sensor project I saw 3-bit errors that disappeared when I switched from MCU VDD to a dedicated 2.5 V reference.",
    detail: [
      {
        type: "p",
        text: "Key parameters to compare when choosing a voltage reference: initial accuracy (how far off it is out of the box, in %), temperature coefficient (drift with temperature, in ppm/°C) and long-term stability. For a battery-powered sensor operating across 0-40°C, a 50 ppm/°C reference can introduce 2 mV of drift across the temperature range, which at 3.3 V and 12-bit resolution is several ADC counts of error.",
      },
      {
        type: "embed",
        url: "https://open.spotify.com/embed/show/301T4WKFfxXWSiYqUbJsUW",
        variant: "spotify",
        caption: "Embedded FM: hardware and embedded systems engineering in depth",
      },
    ],
    tags: ["embedded", "ADC", "hardware", "STM32"],
  }

export default _adc_reference_voltage_quality
