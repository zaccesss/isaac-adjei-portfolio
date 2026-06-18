import type { TILEntry } from "../index"

const _freertos_pdms_to_ticks: TILEntry = {
    id: "freertos-pdms-to-ticks",
    title: "`pdMS_TO_TICKS()` converts milliseconds to RTOS ticks portably across tick rate configs",
    date: "2026-06-09",
    category: "Embedded",
    published: true,
    body: "FreeRTOS timing functions take ticks, not milliseconds. If you hardcode `vTaskDelay(100)` you get 100 ticks, whose real-time duration depends on `configTICK_RATE_HZ`. At 1000 Hz that is 100 ms; at 100 Hz it is 1000 ms. [`pdMS_TO_TICKS(ms)`](https://freertos.org/Documentation/02-Kernel/05-RTOS-implementation-tutorial/02-Building-blocks/11-Tick-Resolution) does the conversion correctly regardless of the tick rate, so the same source code produces the same real-time delay on any configuration. Always use it instead of a bare integer literal.",
    detail: [
      {
        type: "code",
        lang: "c",
        code: `/* I delay for 250 ms regardless of the configured tick rate */
vTaskDelay(pdMS_TO_TICKS(250));

/* I set a 1 second timeout on a queue receive */
xQueueReceive(xQueue, &item, pdMS_TO_TICKS(1000));

/* The macro: (portTickType)((ms * configTICK_RATE_HZ) / 1000) */
/* Hardcoding 250 is only correct when configTICK_RATE_HZ == 1000 */`,
        caption: "pdMS_TO_TICKS() is a compile-time constant expression so there is no runtime overhead",
      },
      {
        type: "link",
        url: "https://freertos.org/Documentation/02-Kernel/05-RTOS-implementation-tutorial/02-Building-blocks/11-Tick-Resolution",
        label: "FreeRTOS: pdMS_TO_TICKS()",
        description: "API documentation including the macro definition and recommended use cases.",
      },
    ],
    tags: ["embedded", "FreeRTOS", "RTOS", "C"],
  }

export default _freertos_pdms_to_ticks
