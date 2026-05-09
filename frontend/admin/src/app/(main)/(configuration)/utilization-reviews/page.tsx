import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMetricsUtilizationReviews from "@/components/pages/utilizationReviews/pageMetrics";
import UtilizationReviewTable from "@/components/pages/utilizationReviews/reviewTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Utilization Reviews",
  description: "Manage Utilization Reviews within the AltuHealth admin panel.",
};

export default function UtilizationReviews() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Utilization Reviews" />
      <PageMetricsUtilizationReviews buttonText="Create a review" />
      <UtilizationReviewTable />
    </div>
  );
}
