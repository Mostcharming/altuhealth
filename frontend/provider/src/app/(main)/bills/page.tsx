import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ClaimTable from "@/components/pages/claim/claimTable";
import PageMetricsClaims from "@/components/pages/claim/pageMetrics";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Claims",
  description: "Manage claims within the AltuHealth admin panel.",
};

export default function Claims() {
  return (
    <div>
      <PageBreadcrumb pageTitle="All Bills" />
      <PageMetricsClaims />
      <ClaimTable />
    </div>
  );
}
