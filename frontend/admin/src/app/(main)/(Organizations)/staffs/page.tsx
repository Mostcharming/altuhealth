import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMetricsStaffs from "@/components/pages/staffs/pageMetrics_new";
import StaffsTable from "@/components/pages/staffs/staffTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Staff Management",
  description:
    "Manage staff enrollment and details within the AltuHealth admin panel.",
};

export default function Staffs() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Staff Management" />
      <PageMetricsStaffs buttonText="Add New Staff" />
      <StaffsTable />
    </div>
  );
}
