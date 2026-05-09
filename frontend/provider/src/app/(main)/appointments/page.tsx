import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AppointmentTable from "@/components/pages/appointment/appointmentTable";
import PageMetricsClaims from "@/components/pages/claim/pageMetrics";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Provider Appointments",
  description: "Manage appointments within the AltuHealth provider panel.",
};

export default function Appointments() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Appointments" />
      <PageMetricsClaims />
      <AppointmentTable />
    </div>
  );
}
