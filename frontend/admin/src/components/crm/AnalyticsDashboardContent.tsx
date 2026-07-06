"use client";
import { useAnalyticsDashboardData } from "@/hooks/useAnalyticsDashboardData";
import CrmMetrics from "./CrmMetrics";
import CrmRecentOrderTable from "./CrmRecentOrderTable";
import SalePieChart from "./SalePieChart";
import UpcomingSchedule from "./UpcomingSchedule";

export default function AnalyticsDashboardContent() {
  const { data, loading, error } = useAnalyticsDashboardData();

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <p className="text-sm font-medium text-red-800 dark:text-red-400">
          Error loading analytics dashboard data: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <CrmMetrics data={data?.metrics} isLoading={loading} />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <SalePieChart data={data?.saleChart} isLoading={loading} />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <UpcomingSchedule data={data?.upcomingSessions} isLoading={loading} />
      </div>

      <div className="col-span-12">
        <CrmRecentOrderTable data={data?.doctors} isLoading={loading} />
      </div>
    </div>
  );
}
