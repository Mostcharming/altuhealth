import ApprovalsTable from "@/components/pages/approvals/approvalsTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Approvals",
  description: "Manage approvals within the AltuHealth admin panel.",
};

export default function Approvals() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <ApprovalsTable />
    </div>
  );
}
