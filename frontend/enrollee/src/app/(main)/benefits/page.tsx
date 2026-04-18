import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import EnrolleeBenefitsPageClient from "@/components/pages/benefits/EnrolleeBenefitsPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enrollee Benefits",
  description: "View your benefit coverage and utilization.",
};

export default function EnrolleeBenefitsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Enrollee Benefits" />
      <EnrolleeBenefitsPageClient />
    </div>
  );
}
