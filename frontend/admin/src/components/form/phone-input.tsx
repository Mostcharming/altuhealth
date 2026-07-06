"use client";

import { ChangeEvent, useState } from "react";
import Label from "./Label";

interface Country {
  code: string;
  label: string;
}

interface PhoneInputProps {
  countries: Country[];
  placeholder?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  selectPosition?: "start" | "end";
  label?: string;
}

export default function PhoneInput({
  countries,
  placeholder = "+1 (555) 000-0000",
  defaultValue = "",
  onChange,
  selectPosition = "start",
  label,
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countries[0] || { code: "US", label: "+1" }
  );
  const [inputValue, setInputValue] = useState(
    defaultValue.replace(/^\+\d+\s?/, "")
  );

  const handleCountryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = e.target.value;
    const country = countries.find((c) => c.code === selectedCode);
    if (country) {
      setSelectedCountry(country);
      updatePhone(inputValue, country);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    updatePhone(value, selectedCountry);
  };

  const updatePhone = (input: string, country: Country) => {
    const fullNumber = `${country.label} ${input}`.trim();
    onChange?.(fullNumber);
  };

  const selectClass =
    "h-11 px-3 py-2.5 rounded-lg border border-gray-300 bg-transparent text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800 focus:border-brand-300 focus:ring-brand-500/20";

  const inputClass =
    "h-11 w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-transparent text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700 focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800";

  return (
    <div>
      {label && <Label>{label}</Label>}
      <div className="flex gap-2">
        {selectPosition === "start" && (
          <select
            value={selectedCountry.code}
            onChange={handleCountryChange}
            className={selectClass}
          >
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.label}
              </option>
            ))}
          </select>
        )}

        <input
          type="tel"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          className={inputClass}
        />

        {selectPosition === "end" && (
          <select
            value={selectedCountry.code}
            onChange={handleCountryChange}
            className={selectClass}
          >
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.label}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
