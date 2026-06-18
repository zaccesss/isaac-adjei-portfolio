import type { BlogPost } from "../index"

const _rtos_fundamentals: BlogPost = {
    slug: "rtos-fundamentals",
    title: "What an RTOS Actually Does: Tasks, Scheduling and Why It Matters",
    date: "2026-06-15",
    type: "research",
    cover_image: "/images/blog/covers/rtos-fundamentals.webp",
    description:
      "A practical introduction to real-time operating systems: what a task scheduler does, why timing guarantees matter in embedded systems and how FreeRTOS implements preemptive multitasking on a microcontroller.",
    tags: ["RTOS", "FreeRTOS", "Embedded", "C", "Scheduling"],
    published: true,
    content: [
      {
        type: "p",
        text: "Most embedded tutorials run everything in a single main loop with a series of if statements and delay calls. For a blinking LED or a simple sensor read, this works fine. For a system that must respond to a button press within 10ms while simultaneously reading a sensor at 100Hz and transmitting over UART, the bare super-loop breaks down. This is the problem a real-time operating system (RTOS) solves.",
      },
      {
        type: "p",
        text: "An RTOS is not a full operating system in the Linux sense. It does not manage a filesystem, run processes with virtual memory or handle arbitrary user applications. It does one thing: schedule tasks on a single processor in a way that gives each task predictable timing guarantees. That predictability is what real-time means in RTOS - not fast, but guaranteed to meet deadlines.",
      },
      {
        type: "p",
        text: "A real-time operating system (RTOS) is software that guarantees a computer will respond to events within a fixed time limit. Unlike a general-purpose OS like Windows or Linux, which optimises for average performance, an RTOS optimises for predictability: it can guarantee that a specific task will start within a defined deadline, even when many other tasks are running simultaneously.",
      },
      {
        type: "h2",
        text: "Tasks and the Scheduler",
      },
      {
        type: "p",
        text: "In [FreeRTOS](https://www.freertos.org) (the most widely used open-source RTOS), a task is a function with its own stack and execution state. Each task has a priority from 0 (lowest) to configMAX_PRIORITIES-1 (highest). The scheduler runs the highest-priority task that is ready to execute. If a higher-priority task becomes ready while a lower-priority task is running, the scheduler preempts the running task immediately and switches to the higher-priority one. This is preemptive multitasking.",
      },
      {
        type: "p",
        text: "The context switch happens at a configurable tick rate, typically 1000 Hz (every 1ms). On each tick, the scheduler checks whether a higher-priority task has become ready and if so performs a context switch: saves the current task's register state and stack pointer, loads the next task's state and resumes execution. The context switch overhead on a Cortex-M4 is typically under 10 microseconds including all register saves.",
      },
      {
        type: "h2",
        text: "Why Timing Guarantees Matter",
      },
      {
        type: "p",
        text: "Consider a system controlling a brushless motor driver. The current control loop must run at exactly 20 kHz: 50 microseconds between iterations. If the control loop runs late by even 20 microseconds, the motor current overshoots and can trigger an overcurrent fault or damage windings. In a bare super-loop, any task that takes longer than expected delays every subsequent task. An RTOS with a high-priority task for the control loop and a dedicated timer interrupt guarantees the loop runs on time regardless of what lower-priority tasks are doing.",
      },
      {
        type: "p",
        text: "Hard real-time systems have deadlines that must never be missed: a missed deadline is a system failure. Soft real-time systems have deadlines that should usually be met but occasional misses are acceptable. Consumer electronics are typically soft real-time. Industrial motor controllers and flight control systems are hard real-time. FreeRTOS is suitable for soft real-time and many hard real-time applications when correctly configured.",
      },
      {
        type: "h2",
        text: "Creating Tasks in FreeRTOS",
      },
      {
        type: "code",
        lang: "c",
        text: `#include "FreeRTOS.h"
#include "task.h"

// I run the sensor read at high priority so it is never delayed by lower tasks
void sensor_task(void *pvParameters) {
    (void)pvParameters;
    TickType_t xLastWakeTime = xTaskGetTickCount();
    const TickType_t xPeriod = pdMS_TO_TICKS(10);  // 100 Hz

    for (;;) {
        read_sensor_and_store();
        // I use vTaskDelayUntil instead of vTaskDelay to keep the period exact
        vTaskDelayUntil(&xLastWakeTime, xPeriod);
    }
}

// I run the display update at lower priority - a missed frame is not critical
void display_task(void *pvParameters) {
    (void)pvParameters;
    for (;;) {
        render_display_frame();
        vTaskDelay(pdMS_TO_TICKS(33));  // ~30 fps
    }
}

int main(void) {
    hardware_init();
    xTaskCreate(sensor_task,  "Sensor",  256, NULL, 3, NULL);
    xTaskCreate(display_task, "Display", 512, NULL, 1, NULL);
    vTaskStartScheduler();
    // I never reach here if the scheduler started successfully
    for (;;);
}`,
      },
      {
        type: "h2",
        text: "Queues and Inter-Task Communication",
      },
      {
        type: "p",
        text: "Tasks running concurrently need to share data safely. Accessing a global variable from two tasks without synchronisation is a race condition: if the scheduler preempts a task mid-write, another task may read a partially written value. FreeRTOS provides queues for passing data between tasks safely. A queue is a fixed-size FIFO buffer. One task writes to it (xQueueSend) and another reads from it (xQueueReceive). Both operations can block for a configurable timeout, which avoids busy-waiting.",
      },
      {
        type: "p",
        text: "Mutexes and semaphores protect shared resources. A mutex (mutual exclusion) is a binary semaphore with priority inheritance: if a high-priority task is waiting for a mutex held by a low-priority task, the low-priority task temporarily runs at the high-priority task's priority to release the mutex as quickly as possible. This prevents priority inversion, a scheduling hazard that famously caused the Mars Pathfinder rover to reset repeatedly until the issue was diagnosed in 1997.",
      },
      {
        type: "h2",
        text: "Stack Size and Heap",
      },
      {
        type: "p",
        text: "Each FreeRTOS task has a dedicated stack allocated from the FreeRTOS heap at task creation. Stack overflow is silent by default: if a task overflows its stack, it corrupts adjacent memory and the system behaves unpredictably. FreeRTOS provides a stack overflow hook (vApplicationStackOverflowHook) and a watermark measurement function (uxTaskGetStackHighWaterMark) to detect and debug stack usage. A common practice is to set the stack size generously during development, measure the watermark and reduce it to the minimum safe value before release.",
      },
      {
        type: "h2",
        text: "FreeRTOS Memory Management",
      },
      {
        type: "p",
        text: "FreeRTOS provides five heap implementations (heap_1.c through heap_5.c), each with different trade-offs. heap_1 never frees memory - suitable for systems that create all tasks at startup and never delete them; it is deterministic and has no fragmentation. heap_2 allows freeing but does not coalesce adjacent free blocks, leading to fragmentation over time. heap_4 coalesces adjacent free blocks and is the most commonly used scheme for general-purpose applications. heap_5 extends heap_4 to support non-contiguous memory regions, which matters on microcontrollers with separate fast SRAM banks.",
      },
      {
        type: "p",
        text: "Dynamic allocation inside tasks (malloc, new) is risky in RTOS systems for two reasons: it is not thread-safe by default, and heap fragmentation can cause allocation failures at unpredictable times. The safest approach for production embedded code is to allocate all memory statically at startup using static task creation (xTaskCreateStatic) and static queue buffers, and use heap_1 which never fragments. This trades flexibility for determinism - a good trade in safety-critical applications.",
      },
      {
        type: "h2",
        text: "Task Notifications: A Lighter Alternative to Semaphores",
      },
      {
        type: "p",
        text: "FreeRTOS task notifications (introduced in FreeRTOS 8.2) are a faster, lower-memory alternative to binary semaphores and event groups for many common signalling patterns. Each task has a 32-bit notification value. An ISR or another task can set bits in this value, increment it or write directly to it. The notified task can block waiting for specific bits to be set.",
      },
      {
        type: "code",
        lang: "c",
        text: `// I use task notification instead of a binary semaphore - less overhead,
// no separate semaphore object to allocate or manage.

TaskHandle_t sensor_task_handle;

void dma_complete_isr(void) {
    BaseType_t higher_priority_woken = pdFALSE;
    vTaskNotifyGiveFromISR(sensor_task_handle, &higher_priority_woken);
    portYIELD_FROM_ISR(higher_priority_woken);
}

void sensor_task(void *pvParameters) {
    for (;;) {
        // I block here until the DMA ISR gives the notification
        ulTaskNotifyTake(pdTRUE, portMAX_DELAY);
        process_dma_buffer();
    }
}`,
      },
      {
        type: "h2",
        text: "Tickless Idle and Power Saving",
      },
      {
        type: "p",
        text: "The FreeRTOS tick interrupt fires 1000 times per second by default, even when all tasks are blocked and nothing useful is happening. This costs power. The tickless idle mode suppresses the tick interrupt when the scheduler knows all tasks will remain blocked for N ticks, programs a hardware timer to wake up before the soonest expiry and puts the processor into a low-power sleep state. On STM32 this can reduce current consumption from milliamps to microamps during idle periods.",
      },
      {
        type: "p",
        text: "Enabling tickless idle requires setting configUSE_TICKLESS_IDLE to 1 in FreeRTOSConfig.h and providing a portSUPPRESS_TICKS_AND_SLEEP implementation (or using the one provided for your specific hardware). The implementation must handle the timer programming, sleep entry and wake-up accounting so the RTOS clock remains accurate after waking.",
      },
      {
        type: "h2",
        text: "When Not to Use an RTOS",
      },
      {
        type: "p",
        text: "An RTOS adds overhead: the scheduler, context switch mechanism, stack for each task and the FreeRTOS kernel itself typically add 5-10 KB of flash and a few hundred bytes of RAM on a Cortex-M device. For a microcontroller with 32 KB flash and 2 KB RAM - an ATmega328P, for instance - this is a significant fraction of available resources. For simple systems with one or two periodic tasks and no concurrency requirements, a bare super-loop with well-structured timer interrupts is often the better choice.",
      },
      {
        type: "p",
        text: "The decision rule I use: if the system has three or more concurrent concerns with different timing requirements, if blocking one operation should not block unrelated operations, or if any operation involves waiting for external events (network, sensor, user input) while other work continues - an RTOS is worth the overhead. If the system does one thing repeatedly with a predictable cycle, bare-metal is simpler and will always be simpler.",
      },
      {
        type: "quote",
        text: "An RTOS does not make your system faster. It makes your system predictable.",
        source: "Embedded systems engineering principle",
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "video",
        youtubeId: "F321087yYy4",
        title: "Introduction to RTOS Part 1 - What is a Real-Time Operating System? - Digi-Key Electronics",
        description: "A clear overview of what a real-time operating system is, how the scheduler works and why timing guarantees matter in embedded systems.",
      },
      {
        type: "ol-links",
        items: [
          { text: "FreeRTOS: Mastering the FreeRTOS Real Time Kernel (free PDF)", url: "https://www.freertos.org/Documentation/RTOS_book.html" },
          { text: "FreeRTOS official documentation and API reference", url: "https://www.freertos.org/Documentation/RTOS_book.html" },
          { text: "Mars Pathfinder priority inversion bug - Glenn Reeves, JPL (1997)", url: "https://www.rapitasystems.com/blog/what-really-happened-software-mars-pathfinder-spacecraft" },
          { text: "Buttazzo, G.: Hard Real-Time Computing Systems (Springer, 3rd ed.)", url: "https://link.springer.com/book/10.1007/978-1-4614-0676-1" },
          { text: "Joseph Yiu: The Definitive Guide to ARM Cortex-M3 and Cortex-M4 Processors", url: "https://www.sciencedirect.com/book/9780124080829/the-definitive-guide-to-arm-cortex-m3-and-cortex-m4-processors" },
          { text: "Wikipedia: Real-time operating system - background and classification", url: "https://en.wikipedia.org/wiki/Real-time_operating_system" },
          { text: "POSIX.1b real-time extensions (IEEE Std 1003.1b)", url: "https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap02.html" },
          { text: "FreeRTOS stack overflow detection and checking", url: "https://www.freertos.org/Stacks-and-stack-overflow-checking.html" },
          { text: "Making Embedded Systems - Elecia White - chapter on RTOS and task design", url: "https://www.oreilly.com/library/view/making-embedded-systems/9781449308889/" },
        ],
      },
    ],
  }

export default _rtos_fundamentals
