"use client";
import { MoreDotIcon } from "@/icons";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function ChurnRateChart() {
  const claimsRateSeries = [
    {
      name: "Claims Rate",
      data: [0, 0, 0, 0, 0, 0, 0],
    },
  ];

  const claimsRateOptions: ApexOptions = {
    chart: {
      type: "area",
      height: 60,
      sparkline: {
        enabled: true,
      },
      animations: {
        enabled: true,
        speed: 800,
      },
      toolbar: {
        show: false,
      },
    },
    colors: ["#10b981"],
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.6,
        opacityTo: 0.1,
        stops: [0, 100],
      },
    },
    tooltip: {
      fixed: {
        enabled: false,
      },
      x: {
        show: false,
      },
      y: {
        formatter: (value) => value.toFixed(2) + "%",
      },
      marker: {
        show: false,
      },
    },
  };
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Enrollee Claims Rate
          </h3>
          <p className="text-theme-sm mt-1 text-gray-500 dark:text-gray-400">
            Percentage of enrollees making claims
          </p>
        </div>
        <div className="relative h-fit">
          <button onClick={toggleDropdown} className="dropdown-toggle">
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-40 p-2"
          >
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              View More
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Delete
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
      <div className="flex justify-between">
        <div>
          <h3 className="text-title-xs font-semibold text-gray-800 dark:text-white/90">
            0%
          </h3>
          <p className="text-theme-xs mt-1 text-gray-500 dark:text-gray-400">
            <span className="text-success-500 mr-1 inline-block">0%</span>
            than last Week
          </p>
        </div>
        <div className="max-w-full">
          <div id="chartTwentyOne">
            <ReactApexChart
              className="h-12 w-24"
              options={claimsRateOptions}
              series={claimsRateSeries}
              type="area"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
