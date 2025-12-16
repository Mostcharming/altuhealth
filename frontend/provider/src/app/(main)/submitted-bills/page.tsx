import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ClaimTable from "@/components/pages/claim/claimTable";
import PageMetricsClaims from "@/components/pages/claim/pageMetrics";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Provider Claims",
  description: "Manage claims within the AltuHealth provider panel.",
};

export default function Claims() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Submitted Bills" />
      <PageMetricsClaims />
      <ClaimTable />
    </div>
  );
}
