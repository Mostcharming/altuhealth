import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdmissionTrackerTable from "@/components/pages/admissionTracker/admissionTrackerTable";
import PageMetricsClaims from "@/components/pages/claim/pageMetrics";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Provider Admission Trackers",
  description:
    "Manage admission trackers within the AltuHealth provider panel.",
};

export default function AdmissionTrackers() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Admission Trackers" />
      <PageMetricsClaims />
      <AdmissionTrackerTable />
    </div>
  );
}
