/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import InvoiceDetailsPage from "@/components/pages/invoice/InvoiceDetailsPage";
import { Metadata } from "next";

interface InvoicePageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata(
  { params }: InvoicePageProps,
  parent: any
): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Invoice #${id} - AltuHealth Admin`,
    description: `View invoice details for invoice #${id}`,
  };
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { id } = await params;

  return (
    <div>
      <PageBreadcrumb pageTitle={`Invoice #${id}`} />
      <InvoiceDetailsPage invoiceId={id} />
    </div>
  );
}
