import type { TILEntry } from "../index"

const _vhdl_process_sensitivity_list: TILEntry = {
    id: "vhdl-process-sensitivity-list",
    title: "Missing signals from a VHDL process sensitivity list causes simulation/synthesis mismatch",
    date: "2026-08-25",
    category: "Hardware",
    published: true,
    body: "In VHDL, a process is only triggered when a signal in its sensitivity list changes. If you forget to include a signal the process reads, the simulation will not update when that signal changes: but synthesis tools infer the correct combinational logic anyway, ignoring the sensitivity list. This means simulation and synthesised hardware behave differently: one of the hardest categories of hardware bug to catch because your testbench passes but the FPGA does not behave as expected.",
    detail: [
      {
        type: "code",
        lang: "vhdl",
        code: `-- Bug: 'b' is read but missing from the sensitivity list
-- Simulation freezes when 'b' changes; synthesis generates correct logic
process(a)
begin
  output <= a AND b;  -- 'b' missing from sensitivity list
end process;

-- Fix: include all signals read inside the process
process(a, b)
begin
  output <= a AND b;
end process;

-- VHDL-2008 fix: process(all) includes everything automatically
process(all)
begin
  output <= a AND b;
end process;`,
        caption: "process(all) is the VHDL-2008 way to avoid sensitivity list bugs entirely",
      },
      {
        type: "note",
        text: "Most synthesis tools (Vivado, Quartus) warn about incomplete sensitivity lists. In simulation, the mismatch manifests as the output not updating when expected. Always cross-check simulation behaviour against the synthesised bitstream on real hardware.",
      },
    ],
    tags: ["VHDL", "FPGA", "hardware", "HDL"],
  }

export default _vhdl_process_sensitivity_list
