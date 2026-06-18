import type { TILEntry } from "../index"

const _spi_cpol_cpha: TILEntry = {
    id: "spi-cpol-cpha",
    title: "SPI CPOL and CPHA choose which clock edge data is sampled on: mismatch means garbage",
    date: "2026-05-22",
    category: "Embedded",
    published: true,
    body: "SPI has four clock modes defined by two bits: [CPOL](https://learn.sparkfun.com/tutorials/serial-peripheral-interface-spi/all) (clock polarity: idle high or idle low) and CPHA (clock phase: sample on first or second edge). A device is only guaranteed to correctly receive data in the mode it was designed for. If master and peripheral are in different modes, the data appears shifted or garbled with no error signal: SPI has no acknowledgement mechanism. The device datasheet always specifies which mode (0, 1, 2 or 3) to use.",
    detail: [
      {
        type: "code",
        lang: "c",
        code: `/* STM32 HAL SPI mode constants */
/* Mode 0: CPOL=0 CPHA=0: most common for sensors */
hspi1.Init.CLKPolarity = SPI_POLARITY_LOW;
hspi1.Init.CLKPhase   = SPI_PHASE_1EDGE;

/* Mode 1: CPOL=0 CPHA=1 */
hspi1.Init.CLKPolarity = SPI_POLARITY_LOW;
hspi1.Init.CLKPhase   = SPI_PHASE_2EDGE;

/* Mode 3: CPOL=1 CPHA=1: used by many SD cards and some ADCs */
hspi1.Init.CLKPolarity = SPI_POLARITY_HIGH;
hspi1.Init.CLKPhase   = SPI_PHASE_2EDGE;`,
        caption: "Always check the datasheet SPI mode before wiring up: there is no negotiation",
      },
      {
        type: "embed",
        url: "https://open.spotify.com/embed/show/301T4WKFfxXWSiYqUbJsUW",
        variant: "spotify",
        caption: "Embedded FM: hardware and embedded systems engineering conversations",
      },
    ],
    tags: ["embedded", "SPI", "hardware", "STM32"],
  }

export default _spi_cpol_cpha
