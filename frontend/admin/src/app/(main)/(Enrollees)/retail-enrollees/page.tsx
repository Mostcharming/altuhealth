import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import EnrolleeDependentsTable from "@/components/pages/enrolleeDependents/enrolleeDependentsTable";
import PageMetricsEnrolleeDependents from "@/components/pages/enrolleeDependents/pageMetrics";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Retail Enrollee Management",
  description: "Manage retail enrollee within the AltuHealth admin panel.",
};

export default function EnrolleeDependents() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Retail Enrollee Management" />
      <PageMetricsEnrolleeDependents buttonText="Add New Enrollee" />
      <EnrolleeDependentsTable />
    </div>
  );
}
