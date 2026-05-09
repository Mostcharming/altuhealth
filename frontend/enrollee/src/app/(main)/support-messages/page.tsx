import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import SupportMessagesList from "@/components/support/SupportMessagesList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support Messages | Altu Health",
  description: "View and manage your support messages and tickets.",
};

export default function SupportMessagesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Support Messages" />
      <SupportMessagesList />
    </div>
  );
}
