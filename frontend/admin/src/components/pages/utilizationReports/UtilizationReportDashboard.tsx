"use client";

import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { apiClient } from "@/lib/apiClient";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

type ReportType = "company" | "provider" | "retail";

type Metric = {
  label: string;
  value: number | string;
};

type ChartData = {
  categories?: string[];
  series?: number[];
  labels?: string[];
};

type ReportData = {
  metrics: Metric[];
  charts: Record<string, ChartData>;
  tables: Record<string, Array<Record<string, unknown>>>;
};

type Props = {
  type: ReportType;
  title: string;
  description: string;
};

const tableTitles: Record<string, string> = {
  topUtilization: "Top Utilization",
  subscriptionsExpiring: "Subscriptions Expiring",
  topClaims: "Top Claims",
};

function formatLabel(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (char) => char.toUpperCase());
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "number") {
    return value.toLocaleString();
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return new Date(value).toLocaleDateString();
  }
  return String(value);
}

function DataTable({
  title,
  rows,
}: {
  title: string;
  rows: Array<Record<string, unknown>>;
}) {
  const keys = useMemo(() => {
    const first = rows[0] || {};
    return Object.keys(first).filter((key) => !["id", "email"].includes(key));
  }, [rows]);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
          {title}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              {keys.map((key) => (
                <th
                  key={key}
                  className="p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400"
                >
                  {formatLabel(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {rows.length ? (
              rows.map((row, index) => (
                <tr
                  key={`${row.id || index}`}
                  className="hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  {keys.map((key) => (
                    <td
                      key={key}
                      className="p-4 text-sm text-gray-700 dark:text-gray-300"
                    >
                      {formatValue(row[key])}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={Math.max(keys.length, 1)}
                  className="p-6 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No records available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BarChart({ title, data }: { title: string; data: ChartData }) {
  const options: ApexOptions = {
    chart: { toolbar: { show: false }, fontFamily: "Outfit, sans-serif" },
    plotOptions: { bar: { borderRadius: 4, columnWidth: "45%" } },
    dataLabels: { enabled: false },
    xaxis: { categories: data.categories || [] },
    colors: ["#465FFF"],
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
        {title}
      </h3>
      <ReactApexChart
        options={options}
        series={[{ name: title, data: data.series || [] }]}
        type="bar"
        height={260}
      />
    </div>
  );
}

function DonutChart({ title, data }: { title: string; data: ChartData }) {
  const options: ApexOptions = {
    chart: { type: "donut", fontFamily: "Outfit, sans-serif" },
    labels: data.labels || [],
    legend: { position: "bottom" },
    dataLabels: { enabled: false },
    colors: ["#465FFF", "#0E9F6E", "#F59E0B", "#EF4444", "#7C3AED"],
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
        {title}
      </h3>
      <ReactApexChart
        options={options}
        series={data.series || []}
        type="donut"
        height={260}
      />
    </div>
  );
}

export default function UtilizationReportDashboard({
  type,
  title,
  description,
}: Props) {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await apiClient(`/admin/utilization-reports/${type}`);
        setData(response?.data || null);
        setErrorMessage("");
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load report.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [type]);

  if (loading) return <SpinnerThree />;

  if (errorMessage || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
        {errorMessage || "Report data is not available."}
      </div>
    );
  }

  const chartEntries = Object.entries(data.charts || {});
  const tableEntries = Object.entries(data.tables || {});

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {title}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {data.metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {metric.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {formatValue(metric.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {chartEntries.map(([key, chart]) =>
          chart.categories ? (
            <BarChart key={key} title={formatLabel(key)} data={chart} />
          ) : (
            <DonutChart key={key} title={formatLabel(key)} data={chart} />
          ),
        )}
      </div>

      <div className="space-y-6">
        {tableEntries.map(([key, rows]) => (
          <DataTable
            key={key}
            title={tableTitles[key] || formatLabel(key)}
            rows={rows}
          />
        ))}
      </div>
    </div>
  );
}
