// I wrap react-phone-number-input here so every phone field gets consistent styling that matches shadcn inputs.
// I use Tailwind attribute selectors on the library's CSS class names because the library injects its own markup.
"use client"

import PhoneInput from "react-phone-number-input"
import "react-phone-number-input/style.css"

interface PhoneFieldProps {
  value: string
  onChange: (value: string) => void
}

export default function PhoneField({ value, onChange }: PhoneFieldProps) {
  return (
    <div className="[&_.PhoneInput]:flex [&_.PhoneInput]:items-center [&_.PhoneInput]:gap-2 [&_.PhoneInputInput]:flex-1 [&_.PhoneInputInput]:border [&_.PhoneInputInput]:border-border [&_.PhoneInputInput]:rounded [&_.PhoneInputInput]:px-3 [&_.PhoneInputInput]:py-1.5 [&_.PhoneInputInput]:text-sm [&_.PhoneInputInput]:bg-background [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:focus:ring-2 [&_.PhoneInputInput]:focus:ring-ring [&_.PhoneInputCountrySelect]:absolute [&_.PhoneInputCountrySelect]:opacity-0 [&_.PhoneInputCountry]:relative [&_.PhoneInputCountry]:flex [&_.PhoneInputCountry]:items-center [&_.PhoneInputCountry]:cursor-pointer [&_.PhoneInputCountryIcon]:w-6 [&_.PhoneInputCountryIcon]:h-4">
      <PhoneInput
        international
        defaultCountry="GB"
        value={value || undefined}
        onChange={(v) => onChange(v ?? "")}
        placeholder="Phone"
      />
    </div>
  )
}
