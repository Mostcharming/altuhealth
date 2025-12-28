"use client";
import type { MetricsData } from "@/hooks/useDashboardData";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";
import Badge from "../ui/badge/Badge";

interface EcommerceMetricsProps {
  data?: MetricsData;
  isLoading?: boolean;
}

export const EcommerceMetrics = ({
  data,
  isLoading = false,
}: EcommerceMetricsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 animate-pulse">
          <div className="w-12 h-12 bg-gray-200 rounded-xl dark:bg-gray-700" />
          <div className="mt-5 space-y-2">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-20" />
            <div className="h-8 bg-gray-200 rounded dark:bg-gray-700 w-16" />
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 animate-pulse">
          <div className="w-12 h-12 bg-gray-200 rounded-xl dark:bg-gray-700" />
          <div className="mt-5 space-y-2">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-20" />
            <div className="h-8 bg-gray-200 rounded dark:bg-gray-700 w-16" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Companies
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {data?.companies.count ?? 0}
            </h4>
          </div>
          <Badge color={data?.companies.trend === "up" ? "success" : "error"}>
            {data?.companies.trend === "up" ? (
              <ArrowUpIcon />
            ) : (
              <ArrowDownIcon className="text-error-500" />
            )}
            {data?.companies.percentage ?? 0}%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Enrollees
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {data?.enrollees.count ?? 0}
            </h4>
          </div>

          <Badge color={data?.enrollees.trend === "up" ? "success" : "error"}>
            {data?.enrollees.trend === "up" ? (
              <ArrowUpIcon />
            ) : (
              <ArrowDownIcon className="text-error-500" />
            )}
            {data?.enrollees.percentage ?? 0}%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
};
