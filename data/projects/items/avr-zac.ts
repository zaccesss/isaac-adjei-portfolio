import type { Project } from "../index"

const _avr_zac: Project = {
    id: "avr-zac",
    title: "avr-zac",
    description:
      "ATmega644P bare metal C projects with state machines, interrupts, PWM and ADC - actively being extended",
    longDescription:
      "A personal project to learn bare metal AVR C development, writing directly to hardware registers without any framework or abstraction layer. The ATmega644P runs at 20 MHz on a custom PCB designed by Richard Reeves (lab technician at Aston University) with an external crystal, LM317T voltage regulator and 10-way ISP headers breaking out all 32 I/O pins. Programming is handled by a Pololu USB AVR Programmer v2.1 via STK500v2, with the -B 10 ISP clock flag required to avoid timeout errors. Richard Reeves also provided components and guidance throughout.\n\nThe purpose of the project is to understand what microcontroller code is actually doing at the register level before using higher-level tools that abstract it away. Working without Arduino or any HAL means reading the datasheet for every peripheral before writing a single line of code. Understanding why EICRA sets the interrupt sense control, why EIMSK enables the specific interrupt and why sei() must come last builds intuition that transfers to any MCU architecture. Every project in the repo represents a new concept understood at that level, not just code that works.\n\nSeven projects progress from a basic LED blink through GPIO manipulation, button polling, interrupt-driven input, software PWM and ADC to a full nine-mode state machine. 00_fuse_test establishes the correct fuse configuration for the external crystal. 01_blink proves the toolchain with a double blink on PB0. 02_led_cycle sequences five LEDs using bit shifting on PORTB. 03_button_polling drives a buzzer by reading PIND. 04_interrupt_buzzer replaces polling with a hardware INT0 ISR, EICRA, EIMSK and sei(). 05_state_machine_basic builds a four-mode machine using enum, ISR and software debounce. The final project, 06_state_machine, implements nine modes cycling on each button press via a volatile mode variable updated inside an INT0 ISR: Chase, Blink All, Alternate, PWM Fade, Knight Rider, Binary Counter, Random (seeded from ADC noise on a floating pin), Reaction Game and Tetris Melody - the last two combining ADC noise seeding and buzzer tone sequencing with LED synchronisation.\n\nAll code can be built with PlatformIO in VS Code or Microchip Studio 7. The repo ships with WORKFLOW.md (full IDE setup, environment switching, build tasks and troubleshooting), docs/wiring.md (current breadboard connections and header pin tables), docs/hardware_notes.md (fuse settings, ISP clock speed, register map and ADC configuration), hardware/pcb_notes.md (component list, connector pinout, power supply circuit and soldering order), the original AVR Project PCB 2019 schematic PDF and the full ATmega644P datasheet. Eight session notes each have a reference document and hands-on lab exercises covering AVR C fundamentals, bit shifting and data types, inputs and interrupts, timers, hardware PWM, UART transmission, ADC and UART reception. MIT licensed and actively being extended.",
    technologies: ["C", "Embedded C", "ATmega644P", "PlatformIO", "Microchip Studio", "AVR", "State Machines", "Interrupts", "PWM", "ADC"],
    category: "embedded",
    featured: false,
    ongoing: true,
    images: [
      "/images/projects/avr-zac/chip.svg",
      "/images/projects/avr-zac/main.svg",
      "/images/projects/avr-zac/statemachine.svg",
    ],
    github: "https://github.com/zaccesss/avr-zac",
    date: "2026 - Present",
    highlights: [
      "7 projects from 00_fuse_test to 06_state_machine - bare metal register manipulation with no framework abstractions",
      "Nine-mode state machine: Chase, Blink All, Alternate, PWM Fade, Knight Rider, Binary Counter, Random, Reaction Game and Tetris Melody",
      "Custom PCB designed by Richard Reeves (Aston University) with LM317T regulator, external crystal and ISP header",
      "Pololu USB AVR Programmer v2.1 via STK500v2 - buildable with PlatformIO in VS Code or Microchip Studio 7",
      "Comprehensive documentation: WORKFLOW.md, wiring reference, hardware notes, PCB schematic and ATmega644P datasheet",
      "8 session notes with hands-on lab exercises covering AVR C, bit shifting, interrupts, timers, PWM, UART and ADC",
    ],
  }

export default _avr_zac
