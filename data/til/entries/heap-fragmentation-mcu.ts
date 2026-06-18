import type { TILEntry } from "../index"

const _heap_fragmentation_mcu: TILEntry = {
    id: "heap-fragmentation-mcu",
    title: "Dynamic allocation fragments the heap on MCUs: static allocation is the safer default",
    date: "2026-08-22",
    category: "Embedded",
    published: true,
    body: "On a microcontroller with a few kilobytes of SRAM, repeatedly calling [malloc and free](https://www.freertos.org/Documentation/02-Kernel/02-Kernel-features/09-Memory-management/01-Memory-management) creates small unusable holes in the heap. The total free memory looks fine but no single contiguous block is large enough to satisfy the next allocation: the system crashes with no obvious warning. FreeRTOS's heap_4 (and heap_5) implementations use a first-fit algorithm with block merging to reduce this, but the safest approach on constrained MCUs is to avoid dynamic allocation entirely: allocate everything statically at startup and size it for the worst case.",
    detail: [
      {
        type: "p",
        text: "FreeRTOS offers five heap implementations. heap_1 only allocates, never frees (ideal for tasks created at startup and never deleted). heap_2 allows freeing but has no block merging, so it fragments immediately. heap_3 wraps the standard library malloc/free with scheduler suspension. heap_4 merges adjacent free blocks on deallocation, greatly reducing fragmentation. heap_5 extends heap_4 to span multiple non-contiguous memory regions.",
      },
      {
        type: "embed",
        url: "https://open.spotify.com/embed/show/301T4WKFfxXWSiYqUbJsUW",
        variant: "spotify",
        caption: "Embedded FM: deep-dive conversations on embedded systems engineering",
      },
      {
        type: "link",
        url: "https://www.freertos.org/Documentation/02-Kernel/02-Kernel-features/09-Memory-management/01-Memory-management",
        label: "FreeRTOS: Memory Management",
        description: "Explains all five heap implementations, when to use each and the trade-offs between fragmentation resistance and code size.",
      },
    ],
    tags: ["embedded", "C", "FreeRTOS", "memory"],
  }

export default _heap_fragmentation_mcu
