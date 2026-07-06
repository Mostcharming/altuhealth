import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DependentsPageClient from "@/components/pages/dependent/DependentsPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Dependents",
  description: "View and manage your dependents.",
};

export default function DependentsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="My Dependents" />
      <DependentsPageClient />
    </div>
  );
}
