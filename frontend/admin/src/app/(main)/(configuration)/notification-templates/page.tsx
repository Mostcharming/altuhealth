import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import NotificationTemplatesTable from "@/components/pages/notificationTemplates/templatesTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Notification Templates",
  description:
    "Manage notification templates within the AltuHealth admin panel.",
};

export default function NotificationTemplates() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Notification Templates" />
      <NotificationTemplatesTable />
    </div>
  );
}
