"use client";
import CrmMetrics from "@/components/crm/CrmMetrics";
import CrmStatisticsChart from "@/components/crm/CrmStatisticsChart";
import EstimatedRevenue from "@/components/crm/EstimatedRevenue";
import SalePieChart from "@/components/crm/SalePieChart";
import UpcomingSchedule from "@/components/crm/UpcomingSchedule";
import { useProviderDashboardData } from "@/hooks/useDashboardData";

export default function Crm() {
  const { data, isLoading } = useProviderDashboardData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <CrmMetrics data={data?.metrics} isLoading={isLoading} />
      </div>

      <div className="col-span-12 xl:col-span-8">
        <CrmStatisticsChart
          data={data?.statisticsChart}
          isLoading={isLoading}
        />
      </div>

      <div className="col-span-12 xl:col-span-4">
        <EstimatedRevenue data={data?.bills} isLoading={isLoading} />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <SalePieChart data={data?.authorizationCodes} isLoading={isLoading} />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <UpcomingSchedule data={data?.appointments} isLoading={isLoading} />
      </div>
    </div>
  );
}
