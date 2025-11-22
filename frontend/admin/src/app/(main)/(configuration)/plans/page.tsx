import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMetricsUnits from "@/components/pages/plan/pageMetrics";
import UnitTable from "@/components/pages/plan/unitTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Plans",
  description: "Manage Plans within the AltuHealth admin panel.",
};

export default function Units() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Plans" />
      <PageMetricsUnits buttonText="Create a plan" />
      <UnitTable />
    </div>
  );
}
