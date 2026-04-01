"use client";

import Button from "@/components/ui/button/Button";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { getInvoiceById } from "@/lib/apis/invoice";
import { formatDate, formatPrice } from "@/lib/formatDate";
import { Invoice } from "@/lib/store/invoiceStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import InvoiceDetailsTable from "./InvoiceDetailsTable";

interface InvoiceDetailsPageProps {
  invoiceId: string;
}

export default function InvoiceDetailsPage({
  invoiceId,
}: InvoiceDetailsPageProps) {
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const response = await getInvoiceById(invoiceId);
        const invoiceData = response?.data?.data || response?.data;
        setInvoice(invoiceData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch invoice:", err);
        setError("Failed to load invoice details");
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <SpinnerThree />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] w-full p-8">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || "Invoice not found"}
          </p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] w-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h3 className="font-medium text-gray-800 text-theme-xl dark:text-white/90">
            Invoice
          </h3>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-400 mt-1">
            ID : #{invoice.invoiceNumber}
          </h4>
        </div>

        <div className="flex gap-3 items-center">
          <div className="text-right">
            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 mb-2">
              {invoice.status?.charAt(0).toUpperCase() +
                invoice.status?.slice(1)}
            </span>
            <br />
            <span
              className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                invoice.paymentStatus === "paid"
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                  : invoice.paymentStatus === "unpaid"
                  ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                  : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
              }`}
            >
              {invoice.paymentStatus?.charAt(0).toUpperCase() +
                invoice.paymentStatus?.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="p-5 xl:p-8">
        <div className="flex flex-col gap-6 mb-9 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400">
              From
            </span>

            <h5 className="mb-2 text-base font-semibold text-gray-800 dark:text-white/90">
              ALTUHEALTH LIMITED
            </h5>

            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              AltuHealth Place, 4 Irewole St, <br />
              opposite DSTV Office, off Allen Avenue, <br />
              Opebi, Ikeja 100218, Lagos
            </p>

            <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Issued On:
            </span>

            <span className="block text-sm text-gray-500 dark:text-gray-400">
              {formatDate(invoice.invoiceDate)}
            </span>
          </div>

          <div className="h-px w-full bg-gray-200 dark:bg-gray-800 sm:h-[158px] sm:w-px"></div>

          <div className="sm:text-right">
            <span className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400">
              To
            </span>

            <h5 className="mb-2 text-base font-semibold text-gray-800 dark:text-white/90">
              {invoice.customerName}
            </h5>

            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              {invoice.customerAddress && (
                <>
                  {invoice.customerAddress}
                  <br />
                </>
              )}
              {invoice.customerPhone && (
                <>
                  {invoice.customerPhone}
                  <br />
                </>
              )}
              {invoice.customerEmail && <>{invoice.customerEmail}</>}
            </p>

            <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Due On:
            </span>

            <span className="block text-sm text-gray-500 dark:text-gray-400">
              {invoice.dueDate
                ? formatDate(invoice.dueDate)
                : "No due date set"}
            </span>
          </div>
        </div>

        {/* Invoice Table */}
        <InvoiceDetailsTable lineItems={invoice.lineItems} />

        <div className="pb-6 my-6 text-right border-b border-gray-100 dark:border-gray-800">
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            Sub Total amount:{" "}
            {formatPrice(parseFloat(String(invoice.subtotal)))}{" "}
            {invoice.currency || "NGN"}
          </p>
          {parseFloat(String(invoice.discountAmount)) > 0 && (
            <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
              Discount:{" "}
              {formatPrice(parseFloat(String(invoice.discountAmount)))}{" "}
              {invoice.currency || "NGN"}
            </p>
          )}
          {parseFloat(String(invoice.taxAmount)) > 0 && (
            <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
              Tax: {formatPrice(parseFloat(String(invoice.taxAmount)))}{" "}
              {invoice.currency || "NGN"}
            </p>
          )}

          <p className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Total : {formatPrice(parseFloat(String(invoice.totalAmount)))}{" "}
            {invoice.currency || "NGN"}
          </p>

          {parseFloat(String(invoice.paidAmount)) > 0 && (
            <>
              <p className="mt-3 text-sm text-green-600 dark:text-green-400">
                Paid Amount:{" "}
                {formatPrice(parseFloat(String(invoice.paidAmount)))}{" "}
                {invoice.currency || "NGN"}
              </p>
              {parseFloat(String(invoice.balanceAmount)) > 0 && (
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  Balance:{" "}
                  {formatPrice(parseFloat(String(invoice.balanceAmount)))}{" "}
                  {invoice.currency || "NGN"}
                </p>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button variant="outline" onClick={() => router.back()}>
            Back to Invoices
          </Button>

          <Button onClick={handlePrint}>
            <svg
              className="fill-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.99578 4.08398C6.58156 4.08398 6.24578 4.41977 6.24578 4.83398V6.36733H13.7542V5.62451C13.7542 5.42154 13.672 5.22724 13.5262 5.08598L12.7107 4.29545C12.5707 4.15983 12.3835 4.08398 12.1887 4.08398H6.99578ZM15.2542 6.36902V5.62451C15.2542 5.01561 15.0074 4.43271 14.5702 4.00891L13.7547 3.21839C13.3349 2.81151 12.7733 2.58398 12.1887 2.58398H6.99578C5.75314 2.58398 4.74578 3.59134 4.74578 4.83398V6.36902C3.54391 6.41522 2.58374 7.40415 2.58374 8.61733V11.3827C2.58374 12.5959 3.54382 13.5848 4.74561 13.631V15.1665C4.74561 16.4091 5.75297 17.4165 6.99561 17.4165H13.0041C14.2467 17.4165 15.2541 16.4091 15.2541 15.1665V13.6311C16.456 13.585 17.4163 12.596 17.4163 11.3827V8.61733C17.4163 7.40414 16.4561 6.41521 15.2542 6.36902ZM4.74561 11.6217V12.1276C4.37292 12.084 4.08374 11.7671 4.08374 11.3827V8.61733C4.08374 8.20312 4.41953 7.86733 4.83374 7.86733H15.1663C15.5805 7.86733 15.9163 8.20312 15.9163 8.61733V11.3827C15.9163 11.7673 15.6269 12.0842 15.2541 12.1277V11.6217C15.2541 11.2075 14.9183 10.8717 14.5041 10.8717H5.49561C5.08139 10.8717 4.74561 11.2075 4.74561 11.6217ZM6.24561 12.3717V15.1665C6.24561 15.5807 6.58139 15.9165 6.99561 15.9165H13.0041C13.4183 15.9165 13.7541 15.5807 13.7541 15.1665V12.3717H6.24561Z"
                fill=""
              />
            </svg>
            Print
          </Button>
        </div>
      </div>
    </div>
  );
}
