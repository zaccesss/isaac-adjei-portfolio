import type { TILEntry } from "../index"

const _amd_developer_cloud: TILEntry = {
    id: "amd-developer-cloud",
    title: "AMD introduced a paid Developer Cloud to give developers access to MI300X GPUs",
    date: "2026-06-15",
    category: "AI/ML",
    published: true,
    body: "AMD launched the [AMD Developer Cloud](https://devcloud.amd.com) to let developers try Instinct accelerators (MI300X) with ROCm already set up, hosted via DigitalOcean. The pricing is $1.99/hr for a single MI300X and $15.92/hr for 8x. New signups get 25 free GPU hours (~$50 credit) valid for 10 days. The important takeaway: AMD is making it possible to test ROCm GPU code without owning hardware, which matters because the biggest barrier to CUDA alternatives has always been hardware access.",
    detail: [
      {
        type: "p",
        text: "The MI300X is AMD's data-centre GPU with 192 GB of HBM3 memory, significantly more than the NVIDIA H100 (80 GB). That memory capacity matters for running very large models without model parallelism across multiple GPUs.",
      },
      {
        type: "note",
        text: "[ROCm](https://rocm.docs.amd.com/) (Radeon Open Compute) is AMD's GPU computing stack, analogous to CUDA. The main barrier has always been ecosystem: most ML frameworks target CUDA first. The Developer Cloud removes the hardware access barrier, making it easier to test whether a ROCm port actually works before committing to AMD hardware.",
      },
      {
        type: "link",
        url: "https://devcloud.amd.com",
        label: "AMD Developer Cloud",
        description: "Pricing, instance types and ROCm documentation for the MI300X developer access programme.",
      },
    ],
    tags: ["AMD", "ROCm", "GPU", "AI", "cloud"],
    source: { label: "AMD Developer Cloud", url: "https://www.amd.com/en/blogs/2025/enabling-the-future-of-ai-introducing-amd-rocm-7-and-the-amd-developer-cloud.html" },
  }

export default _amd_developer_cloud
