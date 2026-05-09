"use client";
import { useDashboardData } from "@/hooks/useDashboardData";
import DemographicCard from "./DemographicCard";
import { EcommerceMetrics } from "./EcommerceMetrics";
import MonthlySalesChart from "./MonthlySalesChart";
import MonthlyTarget from "./MonthlyTarget";
import RecentOrders from "./RecentOrders";
import StatisticsChart from "./StatisticsChart";

export default function DashboardContent() {
  const { data, loading, error } = useDashboardData();

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <p className="text-sm font-medium text-red-800 dark:text-red-400">
          Error loading dashboard data: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <EcommerceMetrics data={data?.metrics} isLoading={loading} />
        <MonthlySalesChart data={data?.monthlySales} isLoading={loading} />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget data={data?.staffEnrollment} isLoading={loading} />
      </div>

      <div className="col-span-12">
        <StatisticsChart data={data?.statistics} isLoading={loading} />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <DemographicCard data={data?.demographics} isLoading={loading} />
      </div>

      <div className="col-span-12 xl:col-span-7">
        <RecentOrders data={data?.recentProviders} isLoading={loading} />
      </div>
    </div>
  );
}
