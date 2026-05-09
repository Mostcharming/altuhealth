import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import NotificationLogTable from "@/components/pages/notificationLog/notificationLogTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Notification Logs",
  description: "View notification logs within the AltuHealth admin panel.",
};

export default function NotificationLogs() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Notification Logs" />
      <NotificationLogTable />
    </div>
  );
}
