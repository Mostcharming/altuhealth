import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PharmacyRequestsPage from "@/components/pages/pharmacy/PharmacyRequestsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pharmacy Requests | AltuHealth Admin",
  description: "Log and review enrollee pharmacy reimbursement requests.",
};

export default function PharmacyRequests() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Pharmacy Requests" />
      <PharmacyRequestsPage />
    </div>
  );
}
