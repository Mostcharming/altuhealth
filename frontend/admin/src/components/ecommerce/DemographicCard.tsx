"use client";
import type { DemographicData } from "@/hooks/useDashboardData";
import { MoreDotIcon } from "@/icons";
import Image from "next/image";
import { useState } from "react";
import CountryMap from "./CountryMap";

interface DemographicCardProps {
  data?: DemographicData[];
  isLoading?: boolean;
}

export default function DemographicCard({
  data,
  isLoading = false,
}: DemographicCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded dark:bg-gray-700 w-48" />
        <div className="h-64 bg-gray-200 rounded dark:bg-gray-700 mt-4" />
      </div>
    );
  }

  const demographicData = data && data.length > 0 ? data : [];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Enrollee Demographic
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Number of enrollee based on country
          </p>
        </div>

        <div className="relative h-fit">
          <button onClick={toggleDropdown} className="dropdown-toggle">
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
        </div>
      </div>
      <div className="px-4 py-6 my-6 overflow-hidden border border-gary-200 rounded-2xl bg-gray-50 dark:border-gray-800 dark:bg-gray-900 sm:px-6">
        <div
          id="mapOne"
          className="mapOne map-btn -mx-4 -my-6 h-[212px] w-[252px] 2xsm:w-[307px] xsm:w-[358px] sm:-mx-6 md:w-[668px] lg:w-[634px] xl:w-[393px] 2xl:w-[554px]"
        >
          <CountryMap demographicData={demographicData} />
        </div>
      </div>

      <div className="space-y-5">
        {demographicData.length > 0 ? (
          demographicData.map((country, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="items-center w-full rounded-full max-w-8">
                  <Image
                    width={48}
                    height={48}
                    src={country.flag}
                    alt={country.country}
                    className="w-full"
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                    {country.country}
                  </p>
                  <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                    {country.enrollees} Enrollees
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="items-center w-full rounded-full max-w-8">
                <Image
                  width={48}
                  height={48}
                  src="/images/country/country-ng.svg"
                  alt="nigeria"
                  className="w-full"
                />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                  Nigeria
                </p>
                <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                  0 Enrollees
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
