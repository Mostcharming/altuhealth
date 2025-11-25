import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMetricsUnits from "@/components/pages/exclude/pageMetrics";
import UnitTable from "@/components/pages/exclude/unitTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Plans",
  description: "Manage Plans within the AltuHealth admin panel.",
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
