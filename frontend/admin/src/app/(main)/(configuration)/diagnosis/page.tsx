import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMetricsUnits from "@/components/pages/diagnosis/pageMetrics";
import UnitTable from "@/components/pages/diagnosis/unitTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Diagnosis",
  description: "Manage Diagnosis within the AltuHealth admin panel.",
};

export default function Units() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Diagnosis setup" />
      <PageMetricsUnits buttonText="Create a diganosis" />
      <UnitTable />
    </div>
  );
}
