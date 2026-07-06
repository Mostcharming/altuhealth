import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TicketDetails from "@/components/support/TicketDetails";
import TicketReplyContent from "@/components/support/TicketReplyContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ticket Details | Altu Health Admin",
  description:
    "View and manage ticket details and replies in the Altu Health admin panel.",
};

export default function SupportReply() {
  return (
    <div className="overflow-hidden xl:h-[calc(100vh-100px)]">
      <PageBreadcrumb pageTitle="Support Ticket Details" />
      <div className="grid h-full grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="xl:col-span-8 2xl:col-span-9">
          <TicketReplyContent />
        </div>
        <div className="xl:col-span-4 2xl:col-span-3">
          <TicketDetails />
        </div>
      </div>
    </div>
  );
}
