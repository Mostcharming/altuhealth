import AccountDeletionRequestsTable from "@/components/pages/accountDeletionRequests/AccountDeletionRequestsTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Deletion Requests | AltuHealth Admin",
  description: "Review and manage enrollee account deletion requests.",
};

export default function AccountDeletionRequestsPage() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <AccountDeletionRequestsTable />
    </div>
  );
}
