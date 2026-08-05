import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PharmacyRequestDetails from "@/components/pages/pharmacy/PharmacyRequestDetails";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pharmacy Request Review | AltuHealth Admin",
  description: "Review and process an enrollee pharmacy reimbursement request.",
};

export default async function PharmacyRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
      <PageBreadcrumb pageTitle="Pharmacy Request Review" />
      <PharmacyRequestDetails id={id} />
    </div>
  );
}
