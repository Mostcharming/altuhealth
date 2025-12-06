import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMetricsEnrolleeDependents from "@/components/pages/enrolleeDependents/pageMetrics";
import RetailDependentsTable from "@/components/pages/retailDependents/retailDependentsTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Retail Dependents Management",
  description:
    "Manage retail dependents and their details within the AltuHealth admin panel.",
};

export default function RetailDependents() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Retail Dependents Management" />
      <PageMetricsEnrolleeDependents buttonText="Add New Dependent" />
      <RetailDependentsTable />
    </div>
  );
}
