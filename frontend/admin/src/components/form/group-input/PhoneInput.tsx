// "use client";
// import React, { useEffect, useState } from "react";

// interface CountryCode {
//   code: string;
//   label: string;
// }

// interface PhoneInputProps {
//   countries: CountryCode[];
//   placeholder?: string;
//   id?: string;
//   onChange?: (phoneNumber: string) => void;
//   selectPosition?: "start" | "end"; // New prop for dropdown position
//   defaultValue?: string; // optional initial phone value from parent
//   defaultCountry?: string; // optional initial country code
// }

// const PhoneInput: React.FC<PhoneInputProps> = ({
//   countries,
//   placeholder = "+1 (555) 000-0000",
//   onChange,
//   selectPosition = "start", // Default position is 'start'
//   defaultValue,
//   defaultCountry,
// }) => {
//   const countryCodes: Record<string, string> = countries.reduce(
//     (acc, { code, label }) => ({ ...acc, [code]: label }),
//     {}
//   );

//   // Extract country and phone number from defaultValue
//   const extractCountryAndPhone = (value: string) => {
//     if (!value) {
//       return {
//         country: defaultCountry ?? (countries[0] && countries[0].code) ?? "US",
//         phone: "",
//       };
//     }

//     // Try to find a matching country code in the value
//     for (const { code, label } of countries) {
//       if (value.startsWith(label)) {
//         // Remove the country code from the phone number
//         const phone = value.substring(label.length).trim();
//         return { country: code, phone };
//       }
//     }

//     // If no country code found, use default country
//     return {
//       country: defaultCountry ?? (countries[0] && countries[0].code) ?? "US",
//       phone: value,
//     };
//   };

//   const { country: initialCountry, phone: initialPhone } =
//     extractCountryAndPhone(defaultValue ?? "");

//   const [selectedCountry, setSelectedCountry] =
//     useState<string>(initialCountry);
//   const [phoneNumber, setPhoneNumber] = useState<string>(initialPhone);

//   // Update phone number when defaultValue prop changes
//   useEffect(() => {
//     if (defaultValue) {
//       if (!defaultValue) {
//         return;
//       }

//       // Try to find a matching country code in the value
//       let foundCountry =
//         defaultCountry ?? (countries[0] && countries[0].code) ?? "US";
//       let foundPhone = defaultValue;

//       for (const { code, label } of countries) {
//         if (defaultValue.startsWith(label)) {
//           foundCountry = code;
//           foundPhone = defaultValue.substring(label.length).trim();
//           break;
//         }
//       }

//       setSelectedCountry(foundCountry);
//       setPhoneNumber(foundPhone);
//     }
//   }, [defaultValue, countries, defaultCountry]);

//   const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const newCountry = e.target.value;
//     setSelectedCountry(newCountry);
//     // When country changes, populate the input with just the prefix
//     const countryPrefix = countryCodes[newCountry];
//     setPhoneNumber(countryPrefix);
//     if (onChange) {
//       onChange(countryPrefix);
//     }
//   };

//   const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     let newInput = e.target.value;
//     const countryPrefix = countryCodes[selectedCountry];

//     // Prevent users from deleting the country prefix
//     if (!newInput.startsWith(countryPrefix)) {
//       newInput = countryPrefix + (newInput ? " " : "");
//     }

//     setPhoneNumber(newInput);
//     if (onChange) {
//       onChange(newInput);
//     }
//   };

//   return (
//     <div className="relative flex">
//       {/* Dropdown position: Start */}
//       {selectPosition === "start" && (
//         <div className="absolute">
//           <select
//             value={selectedCountry}
//             onChange={handleCountryChange}
//             className="appearance-none bg-none rounded-l-lg border-0 border-r border-gray-200 bg-transparent py-3 pl-3.5 pr-8 leading-tight text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:text-gray-400"
//           >
//             {countries.map((country) => (
//               <option
//                 key={country.code}
//                 value={country.code}
//                 className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
//               >
//                 {country.code}
//               </option>
//             ))}
//           </select>
//           <div className="absolute inset-y-0 flex items-center text-gray-700 pointer-events-none bg-none right-3 dark:text-gray-400">
//             <svg
//               className="stroke-current"
//               width="20"
//               height="20"
//               viewBox="0 0 20 20"
//               fill="none"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396"
//                 stroke="currentColor"
//                 strokeWidth="1.5"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               />
//             </svg>
//           </div>
//         </div>
//       )}

//       {/* Input field */}
//       <input
//         type="tel"
//         value={phoneNumber}
//         onChange={handlePhoneNumberChange}
//         placeholder={placeholder}
//         className={`dark:bg-dark-900 h-11 w-full ${
//           selectPosition === "start" ? "pl-[84px]" : "pr-[84px]"
//         } rounded-lg border border-gray-300 bg-transparent py-3 px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
//       />

//       {/* Dropdown position: End */}
//       {selectPosition === "end" && (
//         <div className="absolute right-0">
//           <select
//             value={selectedCountry}
//             onChange={handleCountryChange}
//             className="appearance-none bg-none rounded-r-lg border-0 border-l border-gray-200 bg-transparent py-3 pl-3.5 pr-8 leading-tight text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:text-gray-400"
//           >
//             {countries.map((country) => (
//               <option
//                 key={country.code}
//                 value={country.code}
//                 className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
//               >
//                 {country.code}
//               </option>
//             ))}
//           </select>
//           <div className="absolute inset-y-0 flex items-center text-gray-700 pointer-events-none right-3 dark:text-gray-400">
//             <svg
//               className="stroke-current"
//               width="20"
//               height="20"
//               viewBox="0 0 20 20"
//               fill="none"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396"
//                 stroke="currentColor"
//                 strokeWidth="1.5"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               />
//             </svg>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PhoneInput;

"use client";
import React, { useState } from "react";

interface CountryCode {
  code: string;
  label: string;
}

interface PhoneInputProps {
  countries: CountryCode[];
  placeholder?: string;
  id?: string;
  onChange?: (phoneNumber: string) => void;
  selectPosition?: "start" | "end"; // New prop for dropdown position
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  countries,
  placeholder = "+1 (555) 000-0000",
  onChange,
  selectPosition = "start", // Default position is 'start'
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>("US");
  const [phoneNumber, setPhoneNumber] = useState<string>("+1");

  const countryCodes: Record<string, string> = countries.reduce(
    (acc, { code, label }) => ({ ...acc, [code]: label }),
    {}
  );

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value;
    setSelectedCountry(newCountry);
    setPhoneNumber(countryCodes[newCountry]);
    if (onChange) {
      onChange(countryCodes[newCountry]);
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhoneNumber = e.target.value;
    setPhoneNumber(newPhoneNumber);
    if (onChange) {
      onChange(newPhoneNumber);
    }
  };

  return (
    <div className="relative flex">
      {/* Dropdown position: Start */}
      {selectPosition === "start" && (
        <div className="absolute">
          <select
            value={selectedCountry}
            onChange={handleCountryChange}
            className="appearance-none bg-none rounded-l-lg border-0 border-r border-gray-200 bg-transparent py-3 pl-3.5 pr-8 leading-tight text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:text-gray-400"
          >
            {countries.map((country) => (
              <option
                key={country.code}
                value={country.code}
                className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
              >
                {country.code}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 flex items-center text-gray-700 pointer-events-none bg-none right-3 dark:text-gray-400">
            <svg
              className="stroke-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Input field */}
      <input
        type="tel"
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        placeholder={placeholder}
        className={`dark:bg-dark-900 h-11 w-full ${
          selectPosition === "start" ? "pl-[84px]" : "pr-[84px]"
        } rounded-lg border border-gray-300 bg-transparent py-3 px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
      />

      {/* Dropdown position: End */}
      {selectPosition === "end" && (
        <div className="absolute right-0">
          <select
            value={selectedCountry}
            onChange={handleCountryChange}
            className="appearance-none bg-none rounded-r-lg border-0 border-l border-gray-200 bg-transparent py-3 pl-3.5 pr-8 leading-tight text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:text-gray-400"
          >
            {countries.map((country) => (
              <option
                key={country.code}
                value={country.code}
                className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
              >
                {country.code}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 flex items-center text-gray-700 pointer-events-none right-3 dark:text-gray-400">
            <svg
              className="stroke-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneInput;
