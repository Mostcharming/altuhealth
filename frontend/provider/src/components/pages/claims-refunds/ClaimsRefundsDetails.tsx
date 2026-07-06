"use client";

import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { getPaymentAdviceById } from "@/lib/apis/paymentAdvice";
import capitalizeWords from "@/lib/capitalize";
import { formatDate, formatPrice } from "@/lib/formatDate";
import { PaymentAdvice } from "@/lib/store/paymentAdviceStore";
import Link from "next/link";
import React, { useEffect, useState } from "react";

type Props = {
  id: string;
};

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) => (
  <div className="border-b border-gray-100 py-4 last:border-b-0 dark:border-gray-800">
    <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
      {label}
    </p>
    <div className="mt-1 text-sm text-gray-800 dark:text-white/90">
      {value || "-"}
    </div>
  </div>
);

const ClaimsRefundsDetails: React.FC<Props> = ({ id }) => {
  const [paymentAdvice, setPaymentAdvice] = useState<PaymentAdvice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await getPaymentAdviceById(id);
        setPaymentAdvice(data?.data?.paymentAdvice ?? data?.paymentAdvice ?? null);
      } catch (err) {
        console.warn("Payment advice detail fetch failed", err);
        setError("Payment advice could not be loaded.");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [id]);

  if (loading) return <SpinnerThree />;

  if (error || !paymentAdvice) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {error || "Payment advice not found."}
        </p>
        <Link
          href="/claims-refunds"
          className="mt-4 inline-flex text-sm font-medium text-brand-500"
        >
          Back to payments
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Payment Advice
            </p>
            <h2 className="mt-1 text-xl font-semibold text-gray-800 dark:text-white/90">
              {paymentAdvice.paymentAdviceNumber}
            </h2>
          </div>
          <span className="inline-flex w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-900/30 dark:text-gray-300">
            {capitalizeWords(paymentAdvice.status.replace(/_/g, " "))}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] lg:col-span-2">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Payment Details
          </h3>
          <div className="mt-4 grid gap-x-8 md:grid-cols-2">
            <DetailRow
              label="Total Amount"
              value={formatPrice(paymentAdvice.totalAmount)}
            />
            <DetailRow
              label="Number of Claims"
              value={paymentAdvice.numberOfClaims}
            />
            <DetailRow
              label="Payment Date"
              value={
                paymentAdvice.paymentDate
                  ? formatDate(paymentAdvice.paymentDate)
                  : "-"
              }
            />
            <DetailRow
              label="Due Date"
              value={
                paymentAdvice.dueDate ? formatDate(paymentAdvice.dueDate) : "-"
              }
            />
            <DetailRow
              label="Payment Method"
              value={capitalizeWords(paymentAdvice.paymentMethod.replace(/_/g, " "))}
            />
            <DetailRow
              label="Batch"
              value={paymentAdvice.paymentBatch?.title || "-"}
            />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Bank Details
          </h3>
          <div className="mt-4">
            <DetailRow label="Bank Name" value={paymentAdvice.bankName} />
            <DetailRow
              label="Account Name"
              value={paymentAdvice.accountName}
            />
            <DetailRow
              label="Account Number"
              value={paymentAdvice.bankAccountNumber}
            />
            <DetailRow
              label="Account Type"
              value={paymentAdvice.accountType}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
          Notes
        </h3>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
          {paymentAdvice.description || paymentAdvice.notes || "-"}
        </p>
      </div>
    </div>
  );
};

export default ClaimsRefundsDetails;
