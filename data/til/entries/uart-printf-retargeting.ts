import type { TILEntry } from "../index"

const _uart_printf_retargeting: TILEntry = {
    id: "uart-printf-retargeting",
    title: "Retargeting `printf` to UART lets you use standard C stdio for debug output on an MCU",
    date: "2026-06-11",
    category: "Embedded",
    published: true,
    body: "On a bare-metal MCU there is no terminal, no stdout and no file system. But you can retarget the low-level write function that `printf` calls internally: on GCC/Newlib this is `_write()`, on Keil/armcc it is `fputc()`. Once you override it to transmit via [UART HAL](https://www.st.com/resource/en/user_manual/um1725-description-of-stm32f4-hal-and-lowlayer-drivers-stmicroelectronics.pdf), any `printf` call anywhere in the firmware goes out over the serial port. This is faster to set up than a dedicated logging library and uses the standard format specifiers you already know.",
    detail: [
      {
        type: "code",
        lang: "c",
        code: `/* Newlib _write retarget for STM32 HAL: I redirect stdout to UART2 */
#include <errno.h>
#include <sys/unistd.h>
#include "stm32f4xx_hal.h"

extern UART_HandleTypeDef huart2;

int _write(int file, char *data, int len) {
    if (file == STDOUT_FILENO || file == STDERR_FILENO) {
        HAL_StatusTypeDef status =
            HAL_UART_Transmit(&huart2, (uint8_t *)data, len, HAL_MAX_DELAY);
        if (status == HAL_OK) return len;
        errno = EIO;
        return -1;
    }
    errno = EBADF;
    return -1;
}`,
        caption: "Drop this into any STM32 Newlib project and printf goes out over UART2",
      },
      {
        type: "note",
        text: "HAL_MAX_DELAY means printf blocks until the UART finishes transmitting. In a FreeRTOS project this holds the scheduler. Replace with a DMA-backed ring buffer or a FreeRTOS queue for non-blocking output in production firmware.",
      },
      {
        type: "embed",
        url: "https://open.spotify.com/embed/show/301T4WKFfxXWSiYqUbJsUW",
        variant: "spotify",
        caption: "Embedded FM: embedded systems engineering conversations in depth",
      },
    ],
    tags: ["embedded", "C", "UART", "STM32", "debugging"],
  }

export default _uart_printf_retargeting
