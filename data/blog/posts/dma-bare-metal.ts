import type { BlogPost } from "../index"

const _dma_bare_metal: BlogPost = {
    slug: "dma-bare-metal",
    title: "DMA Explained: Moving Data Without the CPU",
    date: "2026-07-01",
    type: "research",
    cover_image: "/images/blog/covers/dma-bare-metal.webp",
    description:
      "How Direct Memory Access works on microcontrollers, why it matters for high-throughput embedded systems and how to configure a DMA transfer on an STM32 without relying on HAL.",
    tags: ["DMA", "STM32", "Embedded", "C", "Performance"],
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
  }

export default _dma_bare_metal
