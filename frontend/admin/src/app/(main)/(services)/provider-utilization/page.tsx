import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMetricsProviders from "@/components/pages/providerUtilization/pageMetrics";
import ProviderTable from "@/components/pages/providerUtilization/unitTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Providers Utilization",
  description: "Manage Providers within the AltuHealth admin panel.",
};

export default function ProvidersUtilization() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Providers Utilization" />
      <PageMetricsProviders buttonText="Add New Provider" />
      <ProviderTable />
    </div>
  );
}
