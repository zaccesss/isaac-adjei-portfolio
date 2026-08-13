import type { TILEntry } from "../index"

const _branch_prediction_sorted_arrays: TILEntry = {
    id: "branch-prediction-sorted-arrays",
    title: "Sorting an array before processing it can double performance due to branch prediction",
    date: "2026-08-06",
    category: "Architecture",
    published: true,
    body: "The classic benchmark: sum values in an array that exceed a threshold. On an unsorted array the CPU branch predictor cannot learn the pattern of which branches are taken, so it mispredicts roughly 50% of the time. Each misprediction flushes the pipeline: on a modern CPU with a 15-stage pipeline that is 15 wasted cycles per mistake. On a sorted array the predictor quickly learns that all early elements are below the threshold and all later ones are above: misprediction rate drops to near zero. This is the same principle behind loop unrolling and branchless comparisons.",
    detail: [
      {
        type: "embed",
        url: "https://www.youtube.com/embed/nczJ58WvtYo",
        caption: "Computerphile: How Branch Prediction Works in CPUs",
      },
      {
        type: "p",
        text: "For embedded systems: if you have a performance-critical loop with a branch, consider whether sorting the input first is feasible or whether a branchless version (using bitwise arithmetic to avoid the conditional entirely) is cleaner. On microcontrollers without branch prediction, branchless code is often more predictable in execution time, which also matters for real-time guarantees.",
      },
      {
        type: "link",
        url: "https://stackoverflow.com/questions/11227809/why-is-processing-a-sorted-array-faster-than-processing-an-unsorted-array",
        label: "Stack Overflow: Why is processing a sorted array faster?",
        description: "The famous question with an in-depth answer covering branch prediction, pipeline stalls and branchless alternatives. One of the highest-voted questions on Stack Overflow.",
      },
    ],
    tags: ["architecture", "performance", "CPU", "algorithms"],
  }

export default _branch_prediction_sorted_arrays
