import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import MedicalRecordsTable from "@/components/pages/medicalRecords/MedicalRecordsTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Provider Medical History",
  description: "View medical history submitted by your provider account.",
};

export default function MedicalHistory() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Medical History" />
      <MedicalRecordsTable
        title="Medical History"
        description="Review recent medical history records created by your provider account, or search a patient by email or policy number."
      />
    </div>
  );
}
