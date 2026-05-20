export const metadata = { robots: "noindex, nofollow" }

type Spec = { label: string; value: string }

type Device = {
  name: string
  subtitle?: string
  specs: Spec[]
  warranty?: string
  notes?: string
}

function DeviceCard({ device }: { device: Device }) {
  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-border/50">
        <p className="font-semibold text-sm">{device.name}</p>
        {device.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{device.subtitle}</p>}
        {device.warranty && (
          <p className="text-xs text-muted-foreground mt-0.5">Warranty: {device.warranty}</p>
        )}
      </div>
      <div className="divide-y divide-border/40">
        {device.specs.map(({ label, value }) => (
          <div key={label} className="flex items-start gap-3 px-4 py-2">
            <span className="text-xs text-muted-foreground w-28 shrink-0 pt-0.5">{label}</span>
            <span className="text-xs flex-1">{value}</span>
          </div>
        ))}
      </div>
      {device.notes && (
        <p className="px-4 pb-3 pt-2 text-xs text-muted-foreground border-t border-border/50">{device.notes}</p>
      )}
    </div>
  )
}

function Section({ title, devices }: { title: string; devices: Device[] }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {devices.map((d) => <DeviceCard key={d.name} device={d} />)}
      </div>
    </div>
  )
}

export default function TechPage() {
  return (
    <div className="flex flex-col gap-10 max-w-4xl">
      <h1 className="text-xl font-semibold">Tech</h1>

      <Section title="Computers" devices={[
        {
          name: "MacBook Air 13-inch (M5)",
          subtitle: "Isaac's MacBook Air - macOS Tahoe 26.4.1",
          warranty: "Expires 15 March 2027",
          specs: [
            { label: "Chip", value: "Apple M5 - 10 cores / 10 threads (4 performance + 6 efficiency)" },
            { label: "Memory", value: "24 GB" },
            { label: "Graphics", value: "Apple M5 (10-core GPU)" },
            { label: "Storage", value: "494.33 GB (Macintosh HD)" },
            { label: "Display", value: "13.6-inch Built-in Liquid Retina, 2560 × 1664, 60 Hz" },
            { label: "Model", value: "Mac17,3 - Production year 2026" },
            { label: "Serial", value: "C02X9FXX9Y" },
          ],
        },
        {
          name: "Gaming PC (ZACCESS)",
          subtitle: "ASUS PRIME B760M-A WIFI D4 - Windows 11 Pro 64-bit",
          specs: [
            { label: "CPU", value: "12th Gen Intel Core i5-12400T - 6 cores / 12 threads, 1.80 GHz base" },
            { label: "GPU", value: "NVIDIA GeForce RTX 4060 - 8 GB VRAM (shared ~16 GB total)" },
            { label: "RAM", value: "16 GB DIMM, 2666 MT/s (2/4 slots used)" },
            { label: "Storage", value: "~1.8 TB NVMe SSD (TS2TMTE250S)" },
            { label: "Networking", value: "Intel Wi-Fi 6 AX201 160MHz + Realtek 2.5GbE Ethernet" },
            { label: "Displays", value: "Lenovo R27fc-30 (1920×1080 @ 239Hz) + Samsung Odyssey G5 (2560×1440 @ 165Hz)" },
            { label: "OS build", value: "10.0.26200 (Build 26200) - Secure Boot ON, VBS Running" },
            { label: "BIOS", value: "American Megatrends 1658, dated 22/05/2024" },
          ],
        },
        {
          name: "Lenovo ThinkPad P14s Gen 5 AMD (ZACCESS-LNV)",
          subtitle: "Windows 11 Home - Version 25H2 (Build 26200)",
          specs: [
            { label: "CPU", value: "AMD Ryzen 7 PRO 8840HS - 8 cores / 16 threads, 3.30 GHz base" },
            { label: "GPU", value: "AMD Radeon 780M (iGPU) - 3.9 GB dedicated + 5.8 GB shared + NPU" },
            { label: "RAM", value: "16 GB DDR5-5600 SODIMM (1/2 slots, 11.7 GB usable)" },
            { label: "Storage", value: "WD PC SN740 NVMe 512 GB (477 GB reported)" },
            { label: "Display", value: "1920 × 1200 @ 60 Hz" },
            { label: "External", value: "LG 24-inch 120 Hz" },
            { label: "Networking", value: "Qualcomm FastConnect 6900 Wi-Fi 6E + Realtek PCIe GbE" },
            { label: "BIOS", value: "LENOVO R2LET37W (1.18) dated 25/11/2025 - Secure Boot ON" },
            { label: "Model", value: "21MFS04A00 / SKU: ThinkPad P14s Gen 5 AMD" },
          ],
        },
      ]} />

      <Section title="Mobile Devices" devices={[
        {
          name: "iPhone 14 Pro Max",
          subtitle: "Isaac's iPhone - iOS 18.6.2",
          specs: [
            { label: "Storage", value: "512 GB (254.57 GB used / 257.43 GB free)" },
            { label: "Model", value: "MQA33ZD/A" },
            { label: "Serial", value: "CWGYQCM2C9" },
            { label: "IMEI", value: "35 717334 120233 5 / 35 717334 105271 4" },
            { label: "Carrier", value: "Vodafone UK 64.0.1 - No SIM restrictions" },
            { label: "Wi-Fi", value: "28:02:2E:51:1F:57" },
            { label: "iCloud", value: "2 TB plan (~267.4 GB used) - Find My ON, iCloud Backup ON" },
            { label: "Coverage", value: "Expired" },
          ],
          notes: "Top storage: Spotify 95 GB, WhatsApp 9.4 GB, Snapchat 7.3 GB, Photos 6.2 GB, TikTok 5 GB",
        },
        {
          name: "iPad Pro 13-inch (M5)",
          subtitle: "Isaac's iPad - iPadOS 26.2",
          warranty: "Expires 17/12/2026",
          specs: [
            { label: "Storage", value: "256 GB (41.16 GB available)" },
            { label: "Model", value: "ME7W4KN/A" },
            { label: "Serial", value: "K0V9243YMX" },
            { label: "IMEI", value: "35 235570 375931 8" },
            { label: "Carrier", value: "Vodafone UK (vodafone UK 67.0) - Modem 2.02.03" },
            { label: "Wi-Fi", value: "44:9E:8B:1E:5A:78" },
            { label: "Battery", value: "100% max capacity, 12 cycles - Normal health" },
            { label: "Made", value: "July 2025 - First used December 2025" },
          ],
        },
        {
          name: "Apple Watch Series 5",
          subtitle: "watchOS 10.6.1",
          specs: [
            { label: "Serial", value: "G99Z600UMLDX" },
            { label: "IMEI", value: "35 637710 131894 9" },
            { label: "Find My", value: "On" },
          ],
        },
      ]} />

      <Section title="Gaming" devices={[
        {
          name: "PlayStation 5 (Disc Edition)",
          subtitle: "Storage: 667.2 GB usable (20.14 GB free at last capture)",
          specs: [
            { label: "CPU", value: "8× Zen 2 cores @ 3.5 GHz (variable)" },
            { label: "GPU", value: "10.28 TFLOPs, 36 CUs @ 2.23 GHz (variable)" },
            { label: "RAM", value: "16 GB GDDR6 (256-bit)" },
            { label: "Storage", value: "Custom NVMe SSD (825 GB marketed / 667.2 GB usable)" },
            { label: "Drive", value: "4K UHD Blu-ray" },
            { label: "Audio", value: "Tempest 3D AudioTech" },
            { label: "Max output", value: "4K @ 120fps" },
            { label: "BC", value: "PS4 backward compatible" },
            { label: "Dimensions", value: "260 × 390 × 104 mm, ~4.5 kg" },
          ],
        },
      ]} />

      <Section title="Monitors" devices={[
        {
          name: "Lenovo R27fc-30",
          subtitle: "Connected to Gaming PC (RTX 4060)",
          specs: [
            { label: "Resolution", value: "1920 × 1080" },
            { label: "Refresh rate", value: "239.65 Hz (desktop)" },
            { label: "Bit depth", value: "8-bit RGB, SDR" },
            { label: "VRR", value: "Not supported" },
            { label: "Other modes", value: "165, 144, 120, 100, 75, 60 Hz" },
          ],
        },
        {
          name: "Samsung Odyssey G5",
          subtitle: "Connected to Gaming PC (RTX 4060)",
          specs: [
            { label: "Resolution", value: "2560 × 1440" },
            { label: "Refresh rate", value: "164.84 Hz (desktop)" },
            { label: "Bit depth", value: "8-bit RGB, SDR" },
            { label: "VRR", value: "Not supported" },
            { label: "Other modes", value: "120, 75, 60, 50 Hz" },
          ],
        },
        {
          name: "LG 24-inch (Home)",
          subtitle: "Connected to Lenovo ThinkPad",
          specs: [
            { label: "Size", value: "24 inches" },
            { label: "Refresh rate", value: "120 Hz" },
            { label: "Model", value: "TBC - add later" },
          ],
        },
      ]} />

      <Section title="Instruments and Peripherals" devices={[
        {
          name: "VISIONKEY-100 Portable Digital Keyboard Piano",
          subtitle: "88-key full-size - Stand Pack (Product Ref: 236941)",
          specs: [
            { label: "Keys", value: "88 velocity-sensitive synthetic keys (7+ octaves)" },
            { label: "Polyphony", value: "32 notes" },
            { label: "Sounds", value: "129 sounds / 128 rhythms / 30 songs" },
            { label: "Display", value: "LCD" },
            { label: "Bluetooth", value: "5.0 (pair phone/laptop for play-along)" },
            { label: "Inputs/Outputs", value: "3.5mm mic in, 3.5mm sustain pedal, 3.5mm headphones, 3.5mm line-in" },
            { label: "Power", value: "USB-C, 5V/1A" },
            { label: "Weight", value: "4.85 kg - 1234 × 67 × 210 mm" },
            { label: "Included", value: "Sustain pedal, music rest, power adapter, USB-C cable, stand, bench, headphones" },
          ],
        },
      ]} />
    </div>
  )
}
