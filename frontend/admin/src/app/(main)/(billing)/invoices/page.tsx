import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import InvoiceTable from "@/components/pages/invoice/invoiceTable";
import PageMetricsClaims from "@/components/pages/claim/pageMetrics";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Invoices",
  description: "Manage invoices within the AltuHealth admin panel.",
};

export default function Invoices() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Invoices" />
      <PageMetricsClaims />
      <InvoiceTable />
    </div>
  );
}
