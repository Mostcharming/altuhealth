import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import MessageTable from "@/components/pages/message/messageTable";
import PageMetricsMessages from "@/components/pages/message/pageMetrics";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Messages",
  description:
    "Manage messages and conversations within the AltuHealth admin panel.",
};

export default function Messages() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Messages" />
      <PageMetricsMessages />
      <MessageTable />
    </div>
  );
}
