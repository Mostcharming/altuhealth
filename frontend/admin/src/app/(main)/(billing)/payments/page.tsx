import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PaymentMetrics from "@/components/pages/payment/pageMetrics";
import PaymentTable from "@/components/pages/payment/paymentTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Payments",
  description: "Manage payments within the AltuHealth admin panel.",
};

export default function Payments() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Payments" />
      <PaymentMetrics buttonText="Record New Payment" />
      <PaymentTable />
    </div>
  );
}
