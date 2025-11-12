import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMetrics from "@/components/pageTop/pageMetrics";
import RoleTable from "@/components/table/RoleTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Roles",
  description:
    "Manage roles and permissions within the AltuHealth admin panel.",
};

export default function Roles() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Roles" />
      <PageMetrics buttonText="Create a role" />
      <RoleTable />
    </div>
  );
}
