import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UtilizationReportDashboard from "@/components/pages/utilizationReports/UtilizationReportDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Retail Utilization Reports",
  description: "Retail enrollee, dependent, subscription, and utilization reports.",
};

export default function Companies() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Retail Enrollee Utilization Reports" />
      <UtilizationReportDashboard
        type="retail"
        title="Retail Enrollee Utilization"
        description="Reports on retail enrollees, dependents, subscription expiry, claims, authorization activity, and paid subscription value."
      />
    </div>
  );
}
