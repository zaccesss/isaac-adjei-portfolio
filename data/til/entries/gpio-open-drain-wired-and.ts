import type { TILEntry } from "../index"

const _gpio_open_drain_wired_and: TILEntry = {
    id: "gpio-open-drain-wired-and",
    title: "GPIO open-drain mode enables wired-AND without external logic gates",
    date: "2026-08-20",
    category: "Embedded",
    published: true,
    body: "In push-pull mode a GPIO actively drives high or low. In open-drain mode it can only pull low or release the line to float: the external pull-up resistor pulls it high when no device is pulling down. If you connect multiple open-drain outputs to the same line, the line is low if ANY device pulls low: this is wired-AND. [I2C](https://www.nxp.com/docs/en/user-guide/UM10204.pdf) uses this for both SDA and SCL so that any device on the bus can signal a busy state or stretch the clock without needing to coordinate bus ownership first.",
    detail: [
      {
        type: "p",
        text: "The pull-up resistor value matters: too high (e.g. 100 kΩ) makes the rise time slow when all devices release the line; too low (e.g. 100 Ω) wastes power. The I2C spec gives maximum rise time requirements based on bus speed: 1000 ns for standard mode (100 kHz) and 300 ns for fast mode (400 kHz). You work backwards from the rise time requirement to the maximum pull-up resistance for your bus capacitance.",
      },
      {
        type: "note",
        text: "I2C uses wired-AND on SCL specifically to allow clock stretching: a slow peripheral holds SCL low to pause the master. This works because both master and peripheral are open-drain on SCL. A master that drives SCL push-pull cannot support clock stretching.",
      },
      {
        type: "link",
        url: "https://www.nxp.com/docs/en/user-guide/UM10204.pdf",
        label: "NXP: I2C-bus specification (UM10204)",
        description: "The definitive I2C specification. Section 3 covers electrical characteristics including pull-up sizing and timing.",
      },
    ],
    tags: ["embedded", "I2C", "GPIO", "hardware"],
  }

export default _gpio_open_drain_wired_and
