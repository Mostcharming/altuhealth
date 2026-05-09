import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMetricsRetailEnrollee from "@/components/pages/retailEnrollee/pageMetrics";
import RetailEnrolleeTable from "@/components/pages/retailEnrollee/retailEnrolleeTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Retail Enrollee Management",
  description: "Manage retail enrollees within the AltuHealth admin panel.",
};

export default function RetailEnrollee() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Retail Enrollee Management" />
      <PageMetricsRetailEnrollee buttonText="Add New Enrollee" />
      <RetailEnrolleeTable />
    </div>
  );
}
