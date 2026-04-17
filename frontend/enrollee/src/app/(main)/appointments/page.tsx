import AppointmentTable from "@/components/appointments/AppointmentTable";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMetricsAppointments from "@/components/pages/appointment/pageMetrics";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Appointments",
  description: "View and manage your appointments.",
};

export default function AppointmentsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="My Appointments" />
      <PageMetricsAppointments buttonText="Book an Appointment" />
      <AppointmentTable />
    </div>
  );
}
