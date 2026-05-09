import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import NotificationTemplateDetail from "@/components/pages/notificationTemplates/templateDetail";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notification Template Details | AltuHealth",
  description: "View notification template details",
};

export default function NotificationTemplateDetailPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Notification Template Details" />
      <NotificationTemplateDetail />
    </div>
  );
}
