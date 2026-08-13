import type { BlogPost } from "../index"

const _interrupt_driven_embedded_design: BlogPost = {
    slug: "interrupt-driven-embedded-design",
    title: "Interrupt-Driven Design: Writing Non-Blocking Firmware for Microcontrollers",
    date: "2026-07-15",
    type: "blog",
    cover_image: "/images/blog/covers/interrupt-driven-embedded-design.webp",
    description:
      "Why polling loops kill embedded systems and how to replace them with interrupt service routines. Covers ISR setup, volatile variables, debounce, critical sections and the rules that separate good embedded firmware from bad.",
    tags: ["Embedded", "C", "Microcontroller", "Hardware", "Firmware"],
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
        text: "An interrupt is a hardware signal that pauses the current execution context and jumps to a predefined function called an Interrupt Service Routine or ISR. When the ISR returns, execution resumes exactly where it left off. The CPU saves and restores the relevant registers automatically. From the perspective of the main loop, the interrupt happened between two instructions.",
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
        text: "A common pattern is a ring buffer populated by a UART receive interrupt. Each byte that arrives fires the ISR, which writes the byte into the buffer and advances the write pointer. The main loop reads from the buffer and advances the read pointer independently. This decouples the hardware event rate from the processing rate: the ISR is fast, the main loop can be slow and no bytes are lost as long as the buffer does not fill.",
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
        text: "When something seems broken in an interrupt-driven system, the diagnostic checklist is: check that the interrupt is enabled in both the peripheral and NVIC, check that the vector name in the handler exactly matches what the linker expects (a typo results in the default_handler running instead, often resetting the device) and check that volatile is on every shared variable. Most interrupt bugs are one of these three.",
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
          { text: "Phillip Johnston: Better Embedded System Software - interrupt design patterns", url: "https://embeddedartistry.com/blog/2017/08/28/interrupt-handler-rules-of-thumb/" },
          { text: "avr-zac project - the ATmega644P project referenced in this post", url: "https://github.com/zaccesss/avr-zac" },
          { text: "Microchip AVR Interrupt Handling application note (AVR004)", url: "https://ww1.microchip.com/downloads/en/AppNotes/doc1493.pdf" },
        ],
      },
    ],
  }

export default _interrupt_driven_embedded_design
