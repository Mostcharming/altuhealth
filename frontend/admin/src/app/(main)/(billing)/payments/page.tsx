import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PaymentTable from "@/components/pages/payment/paymentTable";
import PageMetricsClaims from "@/components/pages/claim/pageMetrics";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Payments",
  description: "Manage payments within the AltuHealth admin panel.",
};

export default function Payments() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Payments" />
      <PageMetricsClaims />
      <PaymentTable />
    </div>
  );
}
