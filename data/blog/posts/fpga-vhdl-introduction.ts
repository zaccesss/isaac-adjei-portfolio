import type { BlogPost } from "../index"

const _fpga_vhdl_introduction: BlogPost = {
    slug: "fpga-vhdl-introduction",
    title: "Getting Started with FPGAs: What They Are and How to Think About Them",
    date: "2026-05-29",
    type: "blog",
    cover_image: "/images/blog/covers/fpga-vhdl-introduction.webp",
    description:
      "A beginner-friendly introduction to FPGAs and VHDL: what an FPGA actually is, how it differs from a microcontroller, why hardware description languages feel so different from programming and the mental model shift you need to make sense of it all.",
    tags: ["FPGA", "VHDL", "Embedded", "Hardware", "Digital Logic", "Beginners"],
    published: true,
    content: [
      {
        type: "p",
        text: "If you have never encountered an FPGA before, the best way to understand what it is is to start with what it is not. It is not a microcontroller. It is not a processor. It does not execute instructions. It does not have a CPU inside. It is something fundamentally different: a chip whose internal logic connections can be reconfigured by the user, effectively letting you build custom hardware circuits using software tools.",
      },
      {
        type: "p",
        text: "An FPGA (Field-Programmable Gate Array) is not a microcontroller. It is not a processor. It is an array of configurable logic blocks connected by a programmable routing fabric. When you program an FPGA you are not writing software that runs on hardware - you are configuring the hardware itself. This distinction is the first thing to internalise and it is the reason FPGA programming feels so different from everything else.",
      },
      {
        type: "h2",
        text: "Before We Start: The Right Mental Model",
      },
      {
        type: "p",
        text: "Think about a standard Arduino program. You write setup() and loop(). The microcontroller executes your code line by line at millions of instructions per second. It reads a sensor, does some maths, writes to a pin. It is fast but fundamentally sequential - it does one thing at a time.",
      },
      {
        type: "p",
        text: "Now imagine instead of programming a chip to do things, you were wiring up a circuit from individual logic gates - AND gates, OR gates, flip-flops - on a breadboard. That circuit does not execute code. It is always on, always computing its output based on its inputs, every cycle simultaneously. Change the inputs and the outputs change instantly. There is no processor reading instructions. The computation is in the wiring itself.",
      },
      {
        type: "p",
        text: "An FPGA is essentially a chip full of those breadboard logic components, except instead of physically wiring them you describe the connections in a hardware description language and a tool called a synthesiser figures out how to configure the chip's internal routing to match your design. The result is real hardware that you designed, running inside a chip.",
      },
      {
        type: "h2",
        text: "What an FPGA Actually Contains",
      },
      {
        type: "p",
        text: "A modern FPGA contains three main types of resources. Logic elements (called LUTs - look-up tables - in most architectures) are small configurable truth tables that implement any boolean function of their inputs. Flip-flops store state. Block RAMs are fixed hard memories typically 18 Kbit or 36 Kbit in size, used for FIFOs, lookup tables and local storage. Higher-end FPGAs also contain DSP blocks (hardware multiplier-adder units), clock management tiles and, on devices like the [Xilinx](https://www.xilinx.com) Zynq, hardened [ARM](https://developer.arm.com) processor cores alongside the programmable fabric.",
      },
      {
        type: "p",
        text: "When you synthesise a VHDL or Verilog design, the synthesis tool maps your logic description onto these physical resources. A 4-input adder might consume four LUTs and five flip-flops. A 1024x8 dual-port RAM maps to a single Block RAM. The number and type of resources available determines what you can fit on a given FPGA. Understanding resource utilisation is as important for FPGA design as understanding memory layout is for embedded software.",
      },
      {
        type: "h2",
        text: "Hardware Description Is Not Programming",
      },
      {
        type: "p",
        text: "The hardest mental shift for a software engineer approaching FPGAs is that VHDL (and Verilog) describe hardware structure, not program execution. In software, you write a sequence of instructions that the processor executes one after another. In VHDL, you describe concurrent logic elements that all operate simultaneously every clock cycle. There is no notion of a function call that takes time to execute - combinational logic propagates instantaneously (subject to propagation delay) and registered logic updates on clock edges.",
      },
      {
        type: "p",
        text: "Consider a 4-bit adder. In C you write: result = a + b. The processor executes this one instruction. In VHDL you describe: the sum output is the bitwise XOR of a and b with carry propagation from bit 0 to bit 3. The synthesis tool maps this to four LUTs with carry chain connections. The adder exists as permanent hardware. It is always computing a + b, every cycle, whether you read the result or not.",
      },
      {
        type: "h2",
        text: "VHDL: The Basic Structure",
      },
      {
        type: "p",
        text: "Every VHDL design has two parts: an entity (the interface - inputs and outputs) and an architecture (the implementation). This separation mirrors the distinction between a component's specification and its realisation, which is useful when the same interface has multiple implementations.",
      },
      {
        type: "code",
        lang: "vhdl",
        text: `-- I define the interface of a simple D flip-flop
entity d_ff is
    port (
        clk : in  std_logic;
        rst : in  std_logic;
        d   : in  std_logic;
        q   : out std_logic
    );
end entity d_ff;

-- I describe the behaviour: register D on rising clock edge, async reset
architecture rtl of d_ff is
begin
    process(clk, rst)
    begin
        if rst = '1' then
            q <= '0';
        elsif rising_edge(clk) then
            q <= d;
        end if;
    end process;
end architecture rtl;`,
      },
      {
        type: "h2",
        text: "Timing Constraints and the Critical Path",
      },
      {
        type: "p",
        text: "In software, performance is measured in instructions per second. In FPGA design, performance is constrained by the critical path: the longest combinational logic path between two registered stages. The maximum clock frequency is determined by how long signals take to propagate through this path. Adding pipeline registers between logic stages shortens each stage's critical path and allows a higher clock frequency at the cost of increased latency. This pipeline design pattern is fundamental to high-performance FPGA implementations.",
      },
      {
        type: "p",
        text: "Timing constraints tell the synthesis and place-and-route tools what clock frequency you require. The tools then attempt to map your design so that all paths meet the constraint. A timing violation - a path that does not meet the constraint - means the design will not work reliably at that frequency. Resolving timing violations is one of the core skills of FPGA engineering.",
      },
      {
        type: "h2",
        text: "When to Use an FPGA",
      },
      {
        type: "p",
        text: "FPGAs are the right tool when you need deterministic timing that a processor cannot guarantee, when you need to process multiple data streams in true parallel or when you need to implement a custom interface at a speed or precision that software cannot achieve. Signal processing, high-frequency trading, radar, SDR (software-defined radio) and video processing are natural FPGA domains. For general control logic, a microcontroller is simpler and cheaper. The decision is always about whether you need the parallelism and timing determinism that only reconfigurable hardware provides.",
      },
      {
        type: "h2",
        text: "A Simple Example: Blinking an LED",
      },
      {
        type: "p",
        text: "The FPGA equivalent of 'Hello World' is blinking an LED. On a microcontroller you write a loop: set pin high, delay, set pin low, delay. On an FPGA you describe a counter that increments every clock cycle and toggles an output when it reaches a certain value. There is no loop. There is no delay function. There is a counter that physically exists in the hardware, always counting, with the LED output permanently connected to its most significant bit.",
      },
      {
        type: "code",
        lang: "vhdl",
        text: `entity blink is
    port (
        clk : in  std_logic;
        led : out std_logic
    );
end entity blink;

-- I blink an LED at ~1 Hz on a 50 MHz board by counting to 2^25
architecture rtl of blink is
    signal counter : unsigned(25 downto 0) := (others => '0');
begin
    process(clk)
    begin
        if rising_edge(clk) then
            counter <= counter + 1;
        end if;
    end process;
    -- I connect the LED to the MSB - no delay calls, just a wire to a bit
    led <= std_logic(counter(25));
end architecture rtl;`,
      },
      {
        type: "h2",
        text: "FPGA vs Microcontroller: Which to Use?",
      },
      {
        type: "ul",
        items: [
          "Use a microcontroller when: you need to run an algorithm, respond to user input, communicate over protocols or control a simple system. An Arduino or STM32 will do this faster to develop and cheaper to buy.",
          "Use an FPGA when: you need to process multiple streams simultaneously, implement a custom high-speed interface, need sub-microsecond deterministic timing or are implementing a signal processing pipeline.",
          "Cost consideration: FPGAs are significantly more expensive. A capable dev board (Xilinx Artix-7 or Intel Cyclone 10) costs £50-300. A microcontroller board costs £5-30. The power of an FPGA needs justifying.",
        ],
      },
      {
        type: "h2",
        text: "Getting Started: Tools and Boards",
      },
      {
        type: "p",
        text: "The two major FPGA vendors are AMD (formerly Xilinx) and Intel (formerly Altera). Both provide free development environments: [Vivado](https://www.xilinx.com/products/design-tools/vivado.html) (AMD, download from amd.com) and Quartus Prime Lite (Intel, download from intel.com). Both are large downloads - 50-80 GB - but the free tiers cover a wide range of entry-level devices. For a beginner board, the Basys 3 (Digilent, Xilinx Artix-7) is the most widely used in university courses. The iCEstick (Lattice iCE40) is a cheaper alternative that works with the fully open-source IceStorm toolchain (Yosys synthesiser plus nextpnr place-and-route), which is easier to understand than Vivado or Quartus. The Nand2Tetris course at nand2tetris.org builds a complete computer from logic gates up and gives you the conceptual foundation that makes VHDL make sense before you write a single line of it.",
      },
      {
        type: "quote",
        text: "An FPGA is a blank canvas of logic. The art is knowing what to draw.",
        source: "Digital design principle",
      },
      {
        type: "h2",
        text: "References and Tools",
      },
      {
        type: "ol-links",
        items: [
          { text: "Wikipedia: Field-programmable gate array - architecture, history and applications", url: "https://en.wikipedia.org/wiki/Field-programmable_gate_array" },
          { text: "Wikipedia: VHDL - hardware description language overview and standard history", url: "https://en.wikipedia.org/wiki/VHDL" },
          { text: "AMD Vivado Design Suite - free download for Xilinx/AMD FPGAs", url: "https://www.amd.com/en/products/software/adaptive-socs-and-fpgas/vivado.html" },
          { text: "Intel Quartus Prime Lite - free download for Intel FPGAs", url: "https://www.intel.com/content/www/us/en/products/details/fpga/development-tools/quartus-prime/resource.html" },
          { text: "Digilent Basys 3 - most widely used FPGA learning board (Xilinx Artix-7)", url: "https://digilent.com/reference/programmable-logic/basys-3/start" },
          { text: "Lattice iCEstick - low-cost iCE40 FPGA with open-source toolchain", url: "https://www.latticesemi.com/icestick" },
          { text: "IceStorm/YosysHQ open-source FPGA toolchain (Yosys + nextpnr)", url: "https://github.com/YosysHQ/icestorm" },
          { text: "VHDL reference manual (UCI) - quick syntax reference", url: "https://www.ics.uci.edu/~jmoorkan/vhdlref/" },
          { text: "Nand2Tetris - build a computer from logic gates to OS, free", url: "https://www.nand2tetris.org/" },
          { text: "nandgame.com - interactive logic gate puzzles that build intuition before writing VHDL", url: "https://nandgame.com" },
          { text: "VHDL Language Reference Manual (IEEE Std 1076-2019)", url: "https://standards.ieee.org/ieee/VHDL/7537/" },
        ],
      },
    ],
  }

export default _fpga_vhdl_introduction
