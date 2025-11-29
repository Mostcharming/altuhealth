import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMetricsProviders from "@/components/pages/provider/pageMetrics";
import ProviderTable from "@/components/pages/provider/unitTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Providers",
  description: "Manage Providers within the AltuHealth admin panel.",
};

export default function Providers() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Providers" />
      <PageMetricsProviders buttonText="Add New Provider" />
      <ProviderTable />
    </div>
  );
}
