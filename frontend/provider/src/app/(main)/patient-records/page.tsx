import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import MedicalRecordsTable from "@/components/pages/medicalRecords/MedicalRecordsTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Provider Patient Records",
  description: "Search and view patient medical records.",
};

export default function PatientRecords() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Patient Records" />
      <MedicalRecordsTable
        title="Patient Records"
        description="Enter a patient email address or policy number to view their medical history."
        requireSearch
      />
    </div>
  );
}
