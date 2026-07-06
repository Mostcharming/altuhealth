import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMetricsUnits from "@/components/pages/providerSpecialization/pageMetrics";
import UnitTable from "@/components/pages/providerSpecialization/unitTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Provider Specializations",
  description:
    "Manage Provider Specializations within the AltuHealth admin panel.",
};

export default function ProviderSpecializations() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Provider Specializations" />
      <PageMetricsUnits buttonText="Create a provider specialization" />
      <UnitTable />
    </div>
  );
}
