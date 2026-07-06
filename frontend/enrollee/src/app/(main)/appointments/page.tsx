import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AppointmentsPageClient from "@/components/pages/appointment/AppointmentsPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Appointments",
  description: "View and manage your appointments.",
};

export default function AppointmentsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="My Appointments" />
      <AppointmentsPageClient />
    </div>
  );
}
