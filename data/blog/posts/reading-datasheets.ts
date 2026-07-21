import type { BlogPost } from "../index"

const _reading_datasheets: BlogPost = {
    slug: "reading-datasheets",
    title: "Reading Datasheets: The Skill Nobody Teaches You",
    date: "2026-08-10",
    type: "notes",
    cover_image: "/images/blog/covers/reading-datasheets.webp",
    description:
      "Datasheets are dense, inconsistently structured and written for engineers who already know the terminology. Here is how to navigate them, find what you actually need and use them to debug hardware problems.",
    tags: ["Embedded", "Hardware", "Microcontroller", "Learning", "Electronics"],
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
        text: "For a microcontroller like the ATmega644P, the block diagram shows the CPU core, flash and SRAM, the USART, SPI and I2C peripherals, the ADC, the timers and the I/O ports and how they all connect to the internal bus. Once you understand the block diagram, you know which chapter to look in for any feature.",
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
        text: "Timing diagrams show the required sequence and timing of signals for a peripheral to work correctly. For I2C, the diagram shows the START condition (SDA falling while SCL is high), the data bit timing (SDA stable while SCL is high, transitions when SCL is low) and the STOP condition (SDA rising while SCL is high). If your I2C is unreliable, the timing diagram tells you what to measure on an oscilloscope to find the fault.",
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
          { text: "I2C bus primer - a concise protocol reference (NXP retired its own UM10204 PDF)", url: "https://www.i2c-bus.org/i2c-primer/" },
          { text: "The Art of Electronics - Horowitz and Hill - chapter 1 covers passive components and their real-world behaviour as described in datasheets", url: "https://www.amazon.co.uk/Art-Electronics-Paul-Horowitz/dp/0521809266" },
          { text: "Making Embedded Systems - Elecia White - chapter 2 covers hardware/software boundaries and datasheet-driven development", url: "https://www.oreilly.com/library/view/making-embedded-systems/9781449308889/" },
          { text: "sigrok / PulseView - open-source logic analyser for validating signal timing from datasheets", url: "https://sigrok.org/wiki/PulseView" },
          { text: "Wikipedia: Datasheet - structure and conventions", url: "https://en.wikipedia.org/wiki/Datasheet" },
        ],
      },
    ],
  }

export default _reading_datasheets
