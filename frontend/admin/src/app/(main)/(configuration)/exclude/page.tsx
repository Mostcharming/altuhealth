import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMetricsUnits from "@/components/pages/exclude/pageMetrics";
import UnitTable from "@/components/pages/exclude/unitTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Exclusions",
  description: "Manage Exclusions within the AltuHealth admin panel.",
};

export default function Units() {
  return (
    <div>
      <PageBreadcrumb pageTitle="General Exclusions" />
      <PageMetricsUnits buttonText="Create a exclusion" />
      <UnitTable />
    </div>
  );
}
