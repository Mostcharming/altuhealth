import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ClaimsRefundsTable from "@/components/pages/claims-refunds/ClaimsRefundsTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Provider Payments & Refunds",
  description: "View payments and refunds made to your provider account.",
};

export default function ClaimsRefunds() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Payments & Refunds" />
      <ClaimsRefundsTable />
    </div>
  );
}
