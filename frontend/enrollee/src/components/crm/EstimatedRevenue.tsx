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

interface HealthPlanData {
  daysUntilRenewal: number;
  status: string;
}

interface EstimatedRevenueProps {
  data?: HealthPlanData;
  isLoading?: boolean;
}

const defaultData: HealthPlanData = {
  daysUntilRenewal: 0,
  status: "Inactive",
};

export default function EstimatedRevenue({
  data = defaultData,
  // isLoading = false,
}: EstimatedRevenueProps) {
  const [isOpen, setIsOpen] = useState(false);
  const planData = data || defaultData;

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  // Dummy data - replace with actual API data
  const daysUntilRenewal = planData.daysUntilRenewal;
  const renewalProgressPercent = (daysUntilRenewal / 365) * 100;
  const options: ApexOptions = {
    colors: ["#10B981"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 360,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: {
          size: "80%",
        },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5, // margin is in pixels
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -25,
            color: "#1D2939",
            formatter: function (val) {
              return Math.round(val) + " days";
            },
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: ["#10B981"],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Days Until Renewal"],
  };
  const series = [renewalProgressPercent];
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Health Plan Status
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Your coverage status and renewal details
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

      <div className="relative">
        <div id="chartDarkStyle">
          <ReactApexChart
            options={options}
            series={series}
            type="radialBar"
            height={360}
          />
        </div>
        <span className="absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-[60%] text-xs font-normal text-gray-500 dark:text-gray-400">
          Days Remaining
        </span>
      </div>

      <div className="pt-6 mt-6 space-y-5 border-t border-gary-200 dark:border-gray-800">
        <div>
          <p className="mb-2 text-gray-500 text-theme-sm dark:text-gray-400">
            Coverage Status
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-base font-semibold text-green-600 dark:text-green-400">
                  Active
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <p className="font-medium text-gray-700 text-theme-sm dark:text-gray-400">
                Active
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-gray-500 text-theme-sm dark:text-gray-400">
            Renewal Date
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-base font-semibold text-gray-800 dark:text-white/90">
                  {new Date(
                    Date.now() + daysUntilRenewal * 24 * 60 * 60 * 1000,
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
            <p className="font-medium text-gray-700 text-theme-sm dark:text-gray-400">
              {daysUntilRenewal} days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
