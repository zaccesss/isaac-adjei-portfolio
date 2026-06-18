import type { TILEntry } from "../index"

const _volatile_in_c: TILEntry = {
    id: "volatile-in-c",
    title: "`volatile` tells the compiler a variable can change outside of program control",
    date: "2026-05-18",
    category: "C",
    published: true,
    body: "The [`volatile`](https://en.cppreference.com/w/c/language/volatile) qualifier tells the C compiler not to optimise reads or writes to a variable: every access must go to memory. Without it, the compiler may cache the value in a register and never re-read memory. This matters for memory-mapped hardware registers (an ISR can change the value between reads), for flags shared between a main loop and an interrupt handler and for busy-wait loops checking an external condition. It is not a synchronisation primitive and does not imply atomicity.",
    detail: [
      {
        type: "code",
        lang: "c",
        code: `/* Without volatile the compiler may optimise this into an infinite loop
   because it proves 'flag' never changes within this function */
int flag = 0;
while (!flag) { }   // may never exit

/* With volatile the compiler re-reads 'flag' from memory every iteration */
volatile int flag = 0;
while (!flag) { }   // always re-reads memory: correct for ISR flag

/* Hardware register must be volatile: reads the actual peripheral state */
#define GPIOA_IDR  (*((volatile uint32_t *)0x40020010))
uint32_t pin_state = GPIOA_IDR;   // guaranteed memory read, not cached`,
        caption: "volatile prevents the compiler caching hardware register values or ISR-updated flags",
      },
      {
        type: "note",
        text: "volatile does not make operations atomic. On a 32-bit MCU, writing a 64-bit value is still two separate bus transactions. For true atomicity between an ISR and main code use atomic types (C11 `_Atomic`) or disable interrupts around the critical section.",
      },
    ],
    tags: ["C", "embedded", "hardware", "systems"],
  }

export default _volatile_in_c
