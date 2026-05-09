import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMetricsPaymentAdvice from "@/components/pages/paymentAdvice/pageMetrics";
import PaymentAdviceTable from "@/components/pages/paymentAdvice/paymentAdviceTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Payment Advices",
  description: "Manage Payment Advices within the AltuHealth admin panel.",
};

export default function PaymentAdvices() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Payment Advices" />
      <PageMetricsPaymentAdvice buttonText="Add New Payment Advice" />
      <PaymentAdviceTable />
    </div>
  );
}
