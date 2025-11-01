import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Next.js E-commerce  Invoices | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js E-commerce  Invoices TailAdmin Dashboard Template",
};

export default function InvoicesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Invoices" />
    </div>
  );
}
