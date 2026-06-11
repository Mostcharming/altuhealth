import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ClaimsRefundsDetails from "@/components/pages/claims-refunds/ClaimsRefundsDetails";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Provider Payment Details",
  description: "View a payment or refund made to your provider account.",
};

export default async function ClaimsRefundsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <PageBreadcrumb pageTitle="Payment Details" />
      <ClaimsRefundsDetails id={id} />
    </div>
  );
}
