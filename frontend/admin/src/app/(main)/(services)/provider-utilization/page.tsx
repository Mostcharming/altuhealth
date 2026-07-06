import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UtilizationReportDashboard from "@/components/pages/utilizationReports/UtilizationReportDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Provider Utilization Reports",
  description: "Provider rendered services, claims, authorization, and payout utilization reports.",
};

export default function ProvidersUtilization() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Provider Utilization Reports" />
      <UtilizationReportDashboard
        type="provider"
        title="Provider Utilization"
        description="Reports on services rendered, drugs and service items, claims submitted, authorizations, and payment advice volume by provider."
      />
    </div>
  );
}
