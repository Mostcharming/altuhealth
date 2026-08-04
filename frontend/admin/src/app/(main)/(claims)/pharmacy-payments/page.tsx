import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PharmacyPaymentsPage from "@/components/pages/pharmacy/PharmacyPaymentsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pharmacy Payments | AltuHealth Admin",
  description: "View pharmacy reimbursement payment records.",
};

export default function PharmacyPayments() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Pharmacy Payments" />
      <PharmacyPaymentsPage />
    </div>
  );
}
