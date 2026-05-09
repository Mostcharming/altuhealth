import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import SupportTicketsList from "@/components/support/SupportList";
import SupportMetrics from "@/components/support/SupportMetrics";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support Tickets | Altu Health Admin",
  description:
    "Manage support tickets and customer inquiries in the Altu Health admin panel.",
};

export default function SupportListPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Support Tickets" />
      <SupportMetrics />
      <SupportTicketsList />
    </div>
  );
}
