"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import ChartTab from "../common/ChartTab";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface StatisticsChartData {
  medicationsClaimed: number;
  medicationsPercentage: number;
  visitsCompleted: number;
  visitsPercentage: number;
  monthlyData: {
    medications: number[];
    visits: number[];
  };
}

interface CrmStatisticsChartProps {
  data?: StatisticsChartData;
  isLoading?: boolean;
}

const defaultData: StatisticsChartData = {
  medicationsClaimed: 0,
  medicationsPercentage: 0,
  visitsCompleted: 0,
  visitsPercentage: 0,
  monthlyData: {
    medications: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    visits: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
};

export default function CrmStatisticsChart({
  data = defaultData,
  isLoading = false,
}: CrmStatisticsChartProps) {
  const chartData = data || defaultData;
  const options: ApexOptions = {
    legend: {
      show: false,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#465FFF", "#9CB9FF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 220,
      type: "area",
      toolbar: {
        show: false,
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            height: 220,
          },
        },
      },
      {
        breakpoint: 1600,
        options: {
          chart: {
            height: 220,
          },
        },
      },
      {
        breakpoint: 2600,
        options: {
          chart: {
            height: 250,
          },
        },
      },
    ],
    stroke: {
      curve: "straight",
      width: [2, 2],
    },
    markers: {
      size: 0,
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      x: {
        format: "dd MMM yyyy",
      },
    },
    xaxis: {
      type: "category",
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      title: {
        text: undefined, // Removed the `fontSize: "0px"` workaround.
      },
    },
  };

  const series = [
    {
      name: "Medications",
      data: chartData.monthlyData.medications,
    },
    {
      name: "Medical Visits",
      data: chartData.monthlyData.visits,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Healthcare Usage
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Your medical activity throughout the year
          </p>
        </div>
        <ChartTab />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:gap-9">
        <div className="flex items-start gap-2">
          <div>
            <h4 className="text-base font-bold text-gray-800 dark:text-white/90 sm:text-theme-xl">
              {chartData.medicationsClaimed}
            </h4>
            <span className="text-gray-500 text-theme-xs dark:text-gray-400">
              Medications Claimed
            </span>
          </div>
          <span className="mt-1.5 flex items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-theme-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
            {chartData.medicationsPercentage}%
          </span>
        </div>
        <div className="flex items-start gap-2">
          <div>
            <h4 className="text-base font-bold text-gray-800 dark:text-white/90 sm:text-theme-xl">
              {chartData.visitsCompleted}
            </h4>
            <span className="text-gray-500 text-theme-xs dark:text-gray-400">
              Medical Visits Completed
            </span>
          </div>
          <span className="mt-1.5 flex items-center gap-1 rounded-full bg-error-50 px-2 py-0.5 text-theme-xs font-medium text-error-600 dark:bg-error-500/15 dark:text-error-500">
            {chartData.visitsPercentage}%
          </span>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-4  min-w-[650px] xl:min-w-full pl-2">
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={220}
          />
        </div>
      </div>
    </div>
  );
}
