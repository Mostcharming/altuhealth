import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMetricsRetailDependents from "@/components/pages/retailDependents/pageMetricsRetailDependents";
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
      <PageMetricsRetailDependents buttonText="Add New Dependent" />
      <RetailDependentsTable />
    </div>
  );
}
