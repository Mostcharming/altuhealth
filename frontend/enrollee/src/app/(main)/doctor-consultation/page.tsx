import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DoctorConsultationChat from "@/components/doctor-consultation/DoctorConsultationChat";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Doctor Consultation | Altuhealth",
  description: "Consult with doctors via video call or messaging",
};

export default function DoctorConsultation() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Consult a Doctor" />
      <div className="h-[calc(100vh-150px)] overflow-hidden sm:h-[calc(100vh-174px)]">
        <div className="flex flex-col h-full gap-6 xl:flex-row xl:gap-5">
          <DoctorConsultationChat />
        </div>
      </div>
    </div>
  );
}
