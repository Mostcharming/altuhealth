import { AnalyticsMetricsData } from "@/hooks/useAnalyticsDashboardData";
import Badge from "../ui/badge/Badge";

interface CrmMetricsProps {
  data?: AnalyticsMetricsData;
  isLoading?: boolean;
}

export default function CrmMetrics({
  data,
  isLoading = false,
}: CrmMetricsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded dark:bg-gray-700 w-24" />
          <div className="mt-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-32" />
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-28" />
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded dark:bg-gray-700 w-24" />
          <div className="mt-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-32" />
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-28" />
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded dark:bg-gray-700 w-24" />
          <div className="mt-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-32" />
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-28" />
          </div>
        </div>
      </div>
    );
  }

  const mockData = [
    {
      id: 1,
      title: "Active Subscriptions",
      value: data?.activeSubscriptions?.count ?? 0,
      change: `${data?.activeSubscriptions?.trend === "up" ? "+" : "-"}${
        data?.activeSubscriptions?.percentage ?? 0
      }%`,
      direction: data?.activeSubscriptions?.trend ?? "up",
      comparisonText: "last month",
    },
    {
      id: 2,
      title: "Expired Subscriptions",
      value: data?.expiredSubscriptions?.count ?? 0,
      change: `${data?.expiredSubscriptions?.trend === "up" ? "+" : "-"}${
        data?.expiredSubscriptions?.percentage ?? 0
      }%`,
      direction: data?.expiredSubscriptions?.trend ?? "down",
      comparisonText: "last month",
    },
    {
      id: 3,
      title: "About to Expire",
      value: data?.aboutToExpire?.count ?? 0,
      change: `${data?.aboutToExpire?.trend === "up" ? "+" : "-"}${
        data?.aboutToExpire?.percentage ?? 0
      }%`,
      direction: data?.aboutToExpire?.trend ?? "up",
      comparisonText: "next 30 days",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-3">
      {/* <!-- Metric Item Start --> */}
      {mockData.map((item) => (
        <div
          key={item.id}
          className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
        >
          <h4 className="font-bold text-gray-800 text-title-sm dark:text-white/90">
            {item.value}
          </h4>

          <div className="flex items-end justify-between mt-4 sm:mt-5">
            <div>
              <p className="text-gray-700 text-theme-sm dark:text-gray-400">
                {item.title}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <Badge
                size="sm"
                color={
                  item.direction === "up"
                    ? "success"
                    : item.direction === "down"
                    ? "error"
                    : "warning"
                }
              >
                {" "}
                {item.change}
              </Badge>
              <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                {item.comparisonText}
              </span>
            </div>
          </div>
        </div>
      ))}
      {/* <!-- Metric Item End --> */}
    </div>
  );
}
