import type { TILEntry } from "../index"

const _cpu_pipeline_raw_hazard: TILEntry = {
    id: "cpu-pipeline-raw-hazard",
    title: "A RAW hazard in a CPU pipeline causes a stall unless forwarding is implemented",
    date: "2026-07-07",
    category: "Architecture",
    published: true,
    body: "A Read-After-Write (RAW) data hazard occurs when an instruction needs a result that the previous instruction has not written back yet. In a 5-stage pipeline (Fetch, Decode, Execute, Memory, Writeback), if instruction N+1 reads a register that instruction N writes, the value is not in the register file until the Writeback stage. Without forwarding, the pipeline must stall for two cycles. Forwarding (bypassing) routes the result directly from the Execute or Memory stage output to the input of the next instruction's Execute stage, eliminating the stall.",
    detail: [
      {
        type: "embed",
        url: "https://www.youtube.com/embed/1U4v_2J0Qwk",
        caption: "Ben Eater: Introduction to CPU Pipelining: hazards, stalls and forwarding explained from first principles",
      },
      {
        type: "p",
        text: "RISC-V handles RAW hazards in software by inserting NOP instructions between dependent instructions when forwarding is not available. ARM Cortex-M processors use full forwarding so most RAW hazards are resolved without stalls. The exception is load-use hazards: if instruction N+1 reads a register that instruction N loads from memory, the data is not available until after the Memory stage, one cycle too late for forwarding to avoid all stalls. A one-cycle load-use stall is unavoidable in a simple 5-stage pipeline.",
      },
    ],
    tags: ["architecture", "CPU", "pipeline", "hardware"],
  }

export default _cpu_pipeline_raw_hazard
