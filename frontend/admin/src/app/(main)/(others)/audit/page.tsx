import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AuditLogTable from "@/components/pages/auditLog/auditLogTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Audit Logs",
  description: "View audit logs within the AltuHealth admin panel.",
};

export default function AuditLogs() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Audit Logs" />
      <AuditLogTable />
    </div>
  );
}
