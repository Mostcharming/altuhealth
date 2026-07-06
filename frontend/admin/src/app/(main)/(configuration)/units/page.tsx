import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMetricsUnits from "@/components/pages/units/pageMetrics";
import UnitTable from "@/components/pages/units/unitTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Units",
  description: "Manage units within the AltuHealth admin panel.",
};

export default function Units() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Units" />
      <PageMetricsUnits buttonText="Create a unit" />
      <UnitTable />
    </div>
  );
}
