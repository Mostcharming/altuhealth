import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import MedicalHistoryPageClient from "@/components/pages/medicalHistory/MedicalHistoryPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Medical History",
  description: "View your medical history records.",
};

export default function MedicalHistoryPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="My Medical History" />
      <MedicalHistoryPageClient />
    </div>
  );
}
