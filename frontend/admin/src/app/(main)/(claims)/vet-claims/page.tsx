import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMetricsClaims from "@/components/pages/claim/pageMetrics";
import VetClaimTable from "@/components/pages/vet-claim/vetClaimTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Vet Claims",
  description: "Manage vet claims within the AltuHealth admin panel.",
};

export default function VetClaims() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Vet/Review Claims" />
      <PageMetricsClaims />
      <VetClaimTable />
    </div>
  );
}
