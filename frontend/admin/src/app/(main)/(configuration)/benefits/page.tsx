import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMetricsUnits from "@/components/pages/benefit/pageMetrics";
import UnitTable from "@/components/pages/benefit/unitTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Benefits Categories",
  description: "Manage Benefit Categories within the AltuHealth admin panel.",
};

export default function Units() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Benefits Categories" />
      <PageMetricsUnits buttonText="Create a benefit category" />
      <UnitTable />
    </div>
  );
}
