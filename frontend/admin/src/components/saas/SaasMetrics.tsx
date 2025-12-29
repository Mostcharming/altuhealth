import { FinanceMetricsData } from "@/hooks/useFinanceDashboardData";

interface SaasMetricsProps {
  data?: FinanceMetricsData;
  isLoading?: boolean;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function SaasMetrics({
  data,
  isLoading = false,
}: SaasMetricsProps) {
  const getTrendColor = (trend?: "up" | "down") => {
    return trend === "down"
      ? "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500"
      : "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500";
  };

  const getTrendSign = (trend?: "up" | "down") => {
    return trend === "down" ? "-" : "+";
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="h-6 bg-gray-200 rounded dark:bg-gray-700 w-24" />
          </div>
        </div>
        <div className="grid rounded-2xl border border-gray-200 bg-white sm:grid-cols-2 xl:grid-cols-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-6 py-5 sm:border-r xl:border-b-0 dark:border-gray-800">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-28" />
            <div className="mt-4 h-6 bg-gray-200 rounded dark:bg-gray-700 w-32" />
          </div>
          <div className="border-b border-gray-200 px-6 py-5 xl:border-r xl:border-b-0 dark:border-gray-800">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-32" />
            <div className="mt-4 h-6 bg-gray-200 rounded dark:bg-gray-700 w-24" />
          </div>
          <div className="border-b border-gray-200 px-6 py-5 sm:border-r sm:border-b-0 dark:border-gray-800">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-36" />
            <div className="mt-4 h-6 bg-gray-200 rounded dark:bg-gray-700 w-28" />
          </div>
          <div className="px-6 py-5">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-32" />
            <div className="mt-4 h-6 bg-gray-200 rounded dark:bg-gray-700 w-32" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Overview
          </h3>
        </div>
      </div>
      <div className="grid rounded-2xl border border-gray-200 bg-white sm:grid-cols-2 xl:grid-cols-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-200 px-6 py-5 sm:border-r xl:border-b-0 dark:border-gray-800">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total Claims Paid
          </span>
          <div className="mt-2 flex items-end gap-3">
            <h4 className="text-title-xs sm:text-title-sm font-bold text-gray-800 dark:text-white/90">
              {isLoading
                ? "Loading..."
                : formatCurrency(data?.totalClaimsPaid?.amount ?? 0)}
            </h4>
            <div>
              <span
                className={`flex items-center gap-1 rounded-full py-0.5 pr-2.5 pl-2 text-sm font-medium ${getTrendColor(
                  data?.totalClaimsPaid?.trend
                )}`}
              >
                {getTrendSign(data?.totalClaimsPaid?.trend)}
                {data?.totalClaimsPaid?.percentage ?? 0}%
              </span>
            </div>
          </div>
        </div>
        <div className="border-b border-gray-200 px-6 py-5 xl:border-r xl:border-b-0 dark:border-gray-800">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total Pending Claims
          </span>
          <div className="mt-2 flex items-end gap-3">
            <h4 className="text-title-xs sm:text-title-sm font-bold text-gray-800 dark:text-white/90">
              {isLoading ? "Loading..." : data?.totalPendingClaims?.count ?? 0}
            </h4>
            <div>
              <span
                className={`flex items-center gap-1 rounded-full py-0.5 pr-2.5 pl-2 text-sm font-medium ${getTrendColor(
                  data?.totalPendingClaims?.trend
                )}`}
              >
                {getTrendSign(data?.totalPendingClaims?.trend)}
                {data?.totalPendingClaims?.percentage ?? 0}%
              </span>
            </div>
          </div>
        </div>
        <div className="border-b border-gray-200 px-6 py-5 sm:border-r sm:border-b-0 dark:border-gray-800">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Invoice Generated
            </span>
            <div className="mt-2 flex items-end gap-3">
              <h4 className="text-title-xs sm:text-title-sm font-bold text-gray-800 dark:text-white/90">
                {isLoading
                  ? "Loading..."
                  : data?.totalInvoiceGenerated?.count ?? 0}
              </h4>
              <div>
                <span
                  className={`flex items-center gap-1 rounded-full py-0.5 pr-2.5 pl-2 text-sm font-medium ${getTrendColor(
                    data?.totalInvoiceGenerated?.trend
                  )}`}
                >
                  {getTrendSign(data?.totalInvoiceGenerated?.trend)}
                  {data?.totalInvoiceGenerated?.percentage ?? 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-5">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total Revenue Collected
          </span>
          <div className="mt-2 flex items-end gap-3">
            <h4 className="text-title-xs sm:text-title-sm font-bold text-gray-800 dark:text-white/90">
              {isLoading
                ? "Loading..."
                : formatCurrency(data?.totalRevenueCollected?.amount ?? 0)}
            </h4>
            <div>
              <span
                className={`flex items-center gap-1 rounded-full py-0.5 pr-2.5 pl-2 text-sm font-medium ${getTrendColor(
                  data?.totalRevenueCollected?.trend
                )}`}
              >
                {getTrendSign(data?.totalRevenueCollected?.trend)}
                {data?.totalRevenueCollected?.percentage ?? 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
