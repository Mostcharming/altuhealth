"use client";
import CrmMetrics from "@/components/crm/CrmMetrics";
import CrmStatisticsChart from "@/components/crm/CrmStatisticsChart";
import EstimatedRevenue from "@/components/crm/EstimatedRevenue";
import SalePieChart from "@/components/crm/SalePieChart";
import UpcomingSchedule from "@/components/crm/UpcomingSchedule";
import MissingProfilePictureModal from "@/components/modals/MissingProfilePictureModal";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function Crm() {
  const { data, isLoading, error } = useDashboardData();

  if (isLoading) {
    return (
      <>
        <MissingProfilePictureModal />
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <MissingProfilePictureModal />
        <div className="rounded-2xl border border-error-200 bg-error-50 p-6 text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
          <h2 className="font-semibold">Unable to load your dashboard</h2>
          <p className="mt-1 text-sm">
            {error || "No dashboard data was returned. Please try again."}
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <MissingProfilePictureModal />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <CrmMetrics data={data.metrics} isLoading={isLoading} />
        </div>

        <div className="col-span-12 xl:col-span-8">
          <CrmStatisticsChart
            data={data.statisticsChart}
            isLoading={isLoading}
          />
        </div>

        <div className="col-span-12 xl:col-span-4">
          <EstimatedRevenue data={data.healthPlan} isLoading={isLoading} />
        </div>

        <div className="col-span-12 xl:col-span-6">
          <SalePieChart data={data.benefits} isLoading={isLoading} />
        </div>

        <div className="col-span-12 xl:col-span-6">
          <UpcomingSchedule data={data.appointments} isLoading={isLoading} />
        </div>
      </div>
    </>
  );
}
