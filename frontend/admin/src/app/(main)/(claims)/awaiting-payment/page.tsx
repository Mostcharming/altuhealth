import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AwaitingPaymentClaimTable from "@/components/pages/awaiting-payment-claim/awaitingPaymentClaimTable";
import PageMetricsClaims from "@/components/pages/claim/pageMetrics";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Awaiting Payment Claims",
  description:
    "Manage awaiting payment claims within the AltuHealth admin panel.",
};

export default function AwaitingPaymentClaims() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Awaiting Payment Claims" />
      <PageMetricsClaims />
      <AwaitingPaymentClaimTable />
    </div>
  );
}
