import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PaymentDetailsPage from "@/components/pages/payment/PaymentDetailsPage";
import { Metadata } from "next";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export const metadata: Metadata = {
  title: "AltuHealth Admin - Payment Details",
  description: "View payment details",
};

export default async function PaymentDetail({ params }: Props) {
  const { id } = await params;

  return (
    <div>
      <PageBreadcrumb pageTitle="Payment Details" />
      <PaymentDetailsPage paymentId={id} />
    </div>
  );
}
