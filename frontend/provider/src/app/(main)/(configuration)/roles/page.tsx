import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMetrics from "@/components/pages/roles/pageMetrics";
import RoleTable from "@/components/pages/roles/RoleTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Provider Roles",
  description:
    "Manage roles and permissions within the AltuHealth provider panel.",
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
