"use client";
import ConsultationBox from "./ConsultationBox";
import ConsultationSidebar from "./ConsultationSidebar";

export default function DoctorConsultationChat() {
  return (
    <div className="flex flex-col h-full gap-6 w-full xl:flex-row xl:gap-5">
      <ConsultationSidebar />
      <ConsultationBox />
    </div>
  );
}
