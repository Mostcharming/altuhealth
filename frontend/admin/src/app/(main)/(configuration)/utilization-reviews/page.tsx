import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UtilizationReportDashboard from "@/components/pages/utilizationReports/UtilizationReportDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Company Utilization Reports",
  description: "Company enrollee, dependent, subscription, and app utilization reports.",
};

export default function UtilizationReviews() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Company Utilization Reports" />
      <UtilizationReportDashboard
        type="company"
        title="Company Utilization"
        description="Reports on company staff enrollment, enrollees, dependents, claims, authorization activity, and expiring subscriptions."
      />
    </div>
  );
}
