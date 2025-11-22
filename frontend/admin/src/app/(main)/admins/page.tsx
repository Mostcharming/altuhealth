import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMetricsUnits from "@/components/pages/units/pageMetrics";
import UnitTable from "@/components/pages/units/unitTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin",
  description: "Manage Admin Users within the AltuHealth admin panel.",
};

export default function Units() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Admins" />
      <PageMetricsUnits buttonText="Create a user" />
      <UnitTable />
    </div>
  );
}
