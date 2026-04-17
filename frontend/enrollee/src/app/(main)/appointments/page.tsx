import AppointmentTable from "@/components/appointments/AppointmentTable";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Appointments",
  description: "View and manage your appointments.",
};

export default function AppointmentsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="My Appointments" />
      <AppointmentTable />
    </div>
  );
}
