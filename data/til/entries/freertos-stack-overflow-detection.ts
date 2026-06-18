import type { TILEntry } from "../index"

const _freertos_stack_overflow_detection: TILEntry = {
    id: "freertos-stack-overflow-detection",
    title: "FreeRTOS has two methods for detecting stack overflows and they catch different failure modes",
    date: "2026-08-29",
    category: "Embedded",
    published: true,
    body: "FreeRTOS can detect task stack overflows at runtime using configCHECK_FOR_STACK_OVERFLOW. Method 1 checks whether the stack pointer moved outside the valid range at the moment of a context switch. Method 2 fills the stack with a known pattern (0xA5) at task creation and checks the last 16 bytes at each context switch. Both trigger vApplicationStackOverflowHook if a violation is found.",
    detail: [
      {
        type: "p",
        text: "The key difference between the two methods is what they can and cannot catch. Method 1 only checks the stack pointer at the exact moment of the context switch. If the stack overflowed deeply during task execution and then recovered (a transient overflow), Method 1 misses it entirely. Method 2 is slower because it checks the watermark pattern on every switch, but it catches overflows that already happened and left a trace.",
      },
      {
        type: "code",
        lang: "c",
        code: `// In FreeRTOSConfig.h
#define configCHECK_FOR_STACK_OVERFLOW 2  // 1 = pointer check only, 2 = pattern check

// The hook must be implemented in your application code.
// It must NOT return. Typical actions: halt, log, or trigger a watchdog reset.
void vApplicationStackOverflowHook(TaskHandle_t xTask, char *pcTaskName) {
    (void)xTask;
    (void)pcTaskName;
    taskDISABLE_INTERRUPTS();
    for (;;);  // halt
}`,
        caption: "configCHECK_FOR_STACK_OVERFLOW=2 with a minimal halt hook",
      },
      {
        type: "note",
        text: "Method 2 only checks the last 16 bytes of the stack, not the entire region. A very fast overflow that jumps past those bytes undetected is still possible. For production critical systems, combine runtime detection with static analysis (worst-case stack depth tools) at design time.",
      },
    ],
    tags: ["FreeRTOS", "embedded", "RTOS", "stack", "debugging"],
    source: { label: "FreeRTOS: Stack Overflow Detection", url: "https://www.freertos.org/Stacks-and-stack-overflow-checking.html" },
  }

export default _freertos_stack_overflow_detection
