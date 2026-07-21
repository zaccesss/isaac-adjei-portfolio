import type { TILEntry } from "../index"

const _i2c_clock_stretching: TILEntry = {
    id: "i2c-clock-stretching",
    title: "I2C clock stretching lets a slow peripheral pause the bus by holding SCL low",
    date: "2026-07-09",
    category: "Embedded",
    published: true,
    body: "The [I2C protocol](https://www.i2c-bus.org/i2c-primer/) lets a peripheral hold the clock line (SCL) low after the master releases it. This pauses data transfer until the peripheral is ready: it stretches the clock cycle. Not all master implementations support this: some STM32 HAL implementations have historically had bugs where the master stops waiting for SCL to go high and the transaction deadlocks. If you are using a sensor that clock-stretches (common in ADCs and environmental sensors that need computation time between command and read), verify your master actually handles stretching.",
    detail: [
      {
        type: "p",
        text: "The workaround for STM32 HAL I2C clock stretch issues is to use the LL (Low-Level) I2C driver instead of HAL, which gives direct register control and avoids the HAL timeout logic that can deadlock. Alternatively, ensure the peripheral's maximum clock stretch time is within the HAL timeout window by checking the sensor datasheet for `t_stretch_max`.",
      },
      {
        type: "note",
        text: "The symptom of missing clock stretch support is a NACK or garbled data on every second read, not a consistent failure. This makes it easy to mistake for a wiring issue. A logic analyser on SCL during a failing transaction will show the master releasing SCL and then immediately clocking again before the peripheral was ready.",
      },
      {
        type: "link",
        url: "https://www.i2c-bus.org/i2c-primer/",
        label: "I2C bus primer",
        description: "Section 3.1.9 covers clock stretching: when it is allowed, how long a peripheral can stretch and master requirements.",
      },
    ],
    tags: ["embedded", "I2C", "hardware", "STM32"],
  }

export default _i2c_clock_stretching
