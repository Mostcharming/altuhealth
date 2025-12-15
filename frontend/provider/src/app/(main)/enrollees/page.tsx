import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import EnrolleeTable from "@/components/pages/enrollee/enrolleeTable";
import PageMetricsEnrollees from "@/components/pages/enrollee/pageMetrics";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Provider Enrollees",
  description: "Manage enrollees within the AltuHealth provider panel.",
};

export default function Enrollees() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Enrollees" />
      <PageMetricsEnrollees />
      <EnrolleeTable />
    </div>
  );
}
