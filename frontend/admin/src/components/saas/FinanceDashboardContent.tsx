"use client";
import { useFinanceDashboardData } from "@/hooks/useFinanceDashboardData";
import ActivitiesCard from "./ActivitiesCard";
import ChurnRateChart from "./ChurnRate";
import FunnelChart from "./FunnelChart";
import GrowthChart from "./GrowthRate";
import ProductPerformanceTab from "./ProductPerformanceTab";
import SaasInvoiceTable from "./SaasInvoiceTable";
import SaasMetrics from "./SaasMetrics";

export default function FinanceDashboardContent() {
  const { data, loading, error } = useFinanceDashboardData();

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <p className="text-sm font-medium text-red-800 dark:text-red-400">
          Error loading finance dashboard data: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SaasMetrics data={data?.metrics} isLoading={loading} />

      <div className="gap-6 space-y-5 sm:space-y-6 xl:grid xl:grid-cols-12 xl:space-y-0">
        <div className="xl:col-span-7 2xl:col-span-8">
          <div className="space-y-5 sm:space-y-6">
            <div className="grid gap-5 sm:gap-6 lg:grid-cols-2">
              <ChurnRateChart data={data?.churnRate} isLoading={loading} />
              <GrowthChart data={data?.growthRate} isLoading={loading} />
            </div>

            {/* Funnel */}
            <FunnelChart data={data?.funnelChart} isLoading={loading} />

            {/* Table */}
            <SaasInvoiceTable data={data?.invoices} isLoading={loading} />
          </div>
        </div>
        <div className="space-y-5 sm:space-y-6 xl:col-span-5 2xl:col-span-4">
          {/* Product Performance */}
          <ProductPerformanceTab
            data={data?.productPerformance}
            isLoading={loading}
          />

          {/* Activities */}
          <ActivitiesCard data={data?.activities} isLoading={loading} />
        </div>
      </div>
    </div>
  );
}
