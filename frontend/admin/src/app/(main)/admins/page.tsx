import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMetricsAdmins from "@/components/pages/admin/pageMetrics";
import AdminTable from "@/components/pages/admin/unitTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin",
  description: "Manage Admin Users within the AltuHealth admin panel.",
};

export default function Units() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Admins" />
      <PageMetricsAdmins buttonText="Create a user" />
      <AdminTable />
    </div>
  );
}
