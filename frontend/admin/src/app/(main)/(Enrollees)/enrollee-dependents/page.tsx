import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import EnrolleeDependentsTable from "@/components/pages/enrolleeDependents/enrolleeDependentsTable";
import PageMetricsEnrolleeDependents from "@/components/pages/enrolleeDependents/pageMetrics";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Enrollee Dependents Management",
  description:
    "Manage enrollee dependents and their details within the AltuHealth admin panel.",
};

export default function EnrolleeDependents() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Enrollee Dependents Management" />
      <PageMetricsEnrolleeDependents buttonText="Create Dependent" />
      <EnrolleeDependentsTable />
    </div>
  );
}
