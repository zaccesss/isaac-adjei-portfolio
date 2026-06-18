import type { TILEntry } from "../index"

const _pwm_timer_maths: TILEntry = {
    id: "pwm-timer-maths",
    title: "PWM duty cycle on a microcontroller comes from the ratio of compare register to period",
    date: "2026-05-15",
    category: "Embedded",
    published: true,
    body: "A hardware timer counts from 0 to ARR (Auto-Reload Register), then resets. The output pin goes high at 0 and goes low when the counter reaches CCR (Capture/Compare Register). So duty cycle = CCR / (ARR + 1). The PWM frequency = timer clock / (prescaler * (ARR + 1)). Changing CCR at runtime changes duty cycle without touching the frequency: this is how you dim an LED or control a servo without software delays.",
    detail: [
      {
        type: "code",
        lang: "c",
        code: `/* STM32 PWM setup for 50 Hz servo control at 1 MHz timer clock */
/* ARR = 19999: period = 20 ms (50 Hz) */
/* CCR range 1000-2000: 1 ms to 2 ms pulse width */

/* I set 90 degrees: 1.5 ms pulse (CCR = 1500 at 1 MHz) */
TIM3->CCR1 = 1500;
/* Duty cycle = 1500 / (19999 + 1) = 7.5% */

/* I compute the period register for a target frequency */
uint32_t timer_clock_hz = 1000000;   /* 1 MHz after prescaler */
uint32_t target_freq_hz = 50;        /* 50 Hz for servo */
uint32_t arr = (timer_clock_hz / target_freq_hz) - 1;  /* 19999 */
TIM3->ARR = arr;`,
        caption: "The -1 in (ARR + 1) accounts for the counter including 0 in its count",
      },
      {
        type: "note",
        text: "For LED dimming, any PWM frequency above ~60 Hz eliminates visible flicker. For motor control, higher frequencies (20 kHz+) reduce audible whine. For servo control, 50 Hz is the standard because servos measure the pulse width directly rather than the duty cycle.",
      },
    ],
    tags: ["embedded", "C", "PWM", "STM32", "hardware"],
  }

export default _pwm_timer_maths
