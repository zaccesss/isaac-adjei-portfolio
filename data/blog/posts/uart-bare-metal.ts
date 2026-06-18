import type { BlogPost } from "../index"

const _uart_bare_metal: BlogPost = {
    slug: "uart-bare-metal",
    title: "UART From Scratch: Serial Communication Without a Library",
    date: "2026-06-01",
    type: "research",
    cover_image: "/images/blog/covers/uart-bare-metal.webp",
    description:
      "How to set up UART on an AVR microcontroller using bare metal C, configure baud rate registers, transmit and receive bytes and debug embedded systems over a serial monitor.",
    tags: ["UART", "Embedded", "AVR", "C", "Serial"],
    published: true,
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
        type: "h2",
        text: "Interrupt-Driven Receive",
      },
      {
        type: "p",
        text: "Polling for received bytes blocks the CPU. If your main loop is doing anything meaningful, polling is impractical above 9600 baud because you will miss bytes while the CPU is busy. The alternative is the receive complete interrupt: UART fires USART_RX_vect when a byte arrives. The ISR copies it into a ring buffer. The main loop reads from the buffer independently. The UART hardware and your application code run concurrently.",
      },
      {
        type: "code",
        lang: "c",
        text: `#define RX_BUF_SIZE 64

volatile uint8_t rx_buf[RX_BUF_SIZE];
volatile uint8_t rx_head = 0, rx_tail = 0;

// I enable the receive complete interrupt in uart_init:
//   UCSR0B |= (1 << RXCIE0);
//   sei();

ISR(USART0_RX_vect) {
    uint8_t next = (rx_head + 1) % RX_BUF_SIZE;
    if (next != rx_tail) {          // only store if not full
        rx_buf[rx_head] = UDR0;
        rx_head = next;
    }
    // If full: byte is silently dropped. For robust systems,
    // set a flag and handle the overflow in the main loop.
}

uint8_t uart_rx_available(void) {
    return rx_head != rx_tail;
}

uint8_t uart_rx_read(void) {
    while (!uart_rx_available());   // block until data arrives
    uint8_t b = rx_buf[rx_tail];
    rx_tail = (rx_tail + 1) % RX_BUF_SIZE;
    return b;
}`,
      },
      {
        type: "h2",
        text: "Baud Rate Accuracy and Double Speed Mode",
      },
      {
        type: "p",
        text: "Standard mode divides the clock by 16 per baud period. Double speed mode (U2X = 1 in UCSR0A) divides by 8, which gives a finer baud rate resolution at high clock frequencies. The formula becomes: UBRR = (F_CPU / (8 * BAUD)) - 1. At 20 MHz and 115200 baud, normal mode gives UBRR = 10 with 1.4% error. Double speed mode gives UBRR = 20 with 1.4% error too in this case, but at other clock/baud combinations U2X significantly reduces the error. The ATmega datasheet has a comparison table for both modes.",
      },
      {
        type: "p",
        text: "UART tolerates approximately ±2-3% baud rate error in practice. Beyond that, the receiver samples at the wrong point within a bit period, causing occasional bit errors that accumulate over a multi-byte frame. If you are getting intermittent corrupted data at higher baud rates, recalculate your UBRR value and check the actual error percentage in the datasheet table. Changing the crystal frequency is often the cleanest fix.",
      },
      {
        type: "h2",
        text: "Debugging with an Oscilloscope",
      },
      {
        type: "p",
        text: "When UART is completely silent or producing garbage, an oscilloscope is the right tool. Connect the probe to the TX pin and send a known byte. A correctly functioning UART at 9600 baud will show a pulse approximately 104 microseconds wide for each bit period. Count the bits: start bit (low), then 8 data bits, then stop bit (high). If the pulse widths look wrong, the baud rate register is incorrect or F_CPU does not match the actual clock. If you see nothing at all, the TX pin may not be the correct pin or the UART peripheral clock is not enabled.",
      },
      {
        type: "p",
        text: "A logic analyser is even more useful because it can decode UART frames automatically. Most sub-£20 logic analysers support UART decoding in [PulseView](https://sigrok.org/wiki/PulseView) or similar software. Set the baud rate, capture the TX line during transmission and the decoded bytes appear in the interface. This makes it immediately obvious if you are sending the right bytes but with a baud rate mismatch, or if the data itself is wrong.",
      },
      {
        type: "h2",
        text: "UART in the avr-zac Project",
      },
      {
        type: "p",
        text: "The [avr-zac](https://github.com/zaccesss/avr-zac) LED controller uses UART for a debugging interface: a command-line style protocol where you can send single-character commands over the serial monitor to jump to any of the nine display modes, adjust brightness parameters and query the current state. This is entirely enabled by the printf-over-UART setup described above. During development it eliminated most of the guess-and-check cycle that bare-metal embedded debugging otherwise requires. The ability to print 'mode=4 brightness=187' to the terminal and have it appear in real time is worth the two hours of UART setup.",
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
          { text: "Wikipedia: Universal asynchronous receiver-transmitter (UART) - protocol overview and history", url: "https://en.wikipedia.org/wiki/Universal_asynchronous_receiver-transmitter" },
          { text: "Wikipedia: Baud - definition and relationship to bit rate", url: "https://en.wikipedia.org/wiki/Baud" },
          { text: "AVR306: Using the AVR UART in C - Microchip application note", url: "https://ww1.microchip.com/downloads/en/AppNotes/doc1451.pdf" },
          { text: "AVR-libc reference manual: Standard IO facilities and fdev_setup_stream", url: "https://www.nongnu.org/avr-libc/user-manual/group__avr__stdio.html" },
          { text: "PulseView / sigrok - open-source logic analyser software for decoding UART frames", url: "https://sigrok.org/wiki/PulseView" },
          { text: "avr-zac repository - the project where UART debugging is used in practice", url: "https://github.com/zaccesss/avr-zac" },
          { text: "FTDI: USB to Serial Converter application notes", url: "https://ftdichip.com/document/application-notes/" },
        ],
      },
    ],
  }

export default _uart_bare_metal
