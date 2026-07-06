import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMetricsPaymentBatch from "@/components/pages/paymentBatch/pageMetrics";
import PaymentBatchTable from "@/components/pages/paymentBatch/paymentBatchTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Payment Batches",
  description: "Manage Payment Batches within the AltuHealth admin panel.",
};

export default function PaymentBatches() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Payment Batches" />
      <PageMetricsPaymentBatch buttonText="Add New Payment Batch" />
      <PaymentBatchTable />
    </div>
  );
}
