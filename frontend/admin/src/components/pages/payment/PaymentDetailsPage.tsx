"use client";

import Button from "@/components/ui/button/Button";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { getPaymentById } from "@/lib/apis/payment";
import capitalizeWords from "@/lib/capitalize";
import { formatDate, formatPrice } from "@/lib/formatDate";
import { Payment } from "@/lib/store/paymentStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface PaymentDetailsPageProps {
  paymentId: string;
}

export default function PaymentDetailsPage({
  paymentId,
}: PaymentDetailsPageProps) {
  const router = useRouter();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        setLoading(true);
        const response = await getPaymentById(paymentId);
        const paymentData = response?.data?.data || response?.data;
        setPayment(paymentData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch payment:", err);
        setError("Failed to load payment details");
      } finally {
        setLoading(false);
      }
    };

    if (paymentId) {
      fetchPayment();
    }
  }, [paymentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <SpinnerThree />
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] w-full p-8">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || "Payment not found"}
          </p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400";
      case "failed":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
      case "refunded":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400";
    }
  };

  const getVerificationColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
      case "unverified":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400";
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] w-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h3 className="font-medium text-gray-800 text-theme-xl dark:text-white/90">
            Payment Details
          </h3>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-400 mt-1">
            {payment.paymentNumber}
          </h4>
        </div>

        <div className="flex gap-3 items-center">
          <div className="text-right">
            <span
              className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                payment.status
              )} mb-2`}
            >
              {capitalizeWords(payment.status)}
            </span>
            <br />
            <span
              className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getVerificationColor(
                payment.verificationStatus
              )}`}
            >
              {capitalizeWords(payment.verificationStatus)}
            </span>
          </div>
        </div>
      </div>

      <div className="p-5 xl:p-8">
        {/* Payment Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div>
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                Payment Number
              </span>
              <p className="text-gray-800 dark:text-white/90 font-semibold">
                {payment.paymentNumber}
              </p>
            </div>

            <div>
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                Payment Amount
              </span>
              <p className="text-gray-800 dark:text-white/90 font-semibold text-lg">
                {formatPrice(payment.paymentAmount)} {payment.currency || "NGN"}
              </p>
            </div>

            <div>
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                Payment Date
              </span>
              <p className="text-gray-800 dark:text-white/90">
                {payment.paymentDate ? formatDate(payment.paymentDate) : "-"}
              </p>
            </div>

            <div>
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                Payment Method
              </span>
              <p className="text-gray-800 dark:text-white/90">
                {capitalizeWords(payment.paymentMethod.replace(/_/g, " "))}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                Invoice Reference
              </span>
              <p className="text-gray-800 dark:text-white/90 font-semibold">
                {payment.Invoice?.invoiceNumber ||
                  payment.invoiceId?.substring(0, 8) ||
                  "-"}
              </p>
            </div>

            <div>
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                Customer Name
              </span>
              <p className="text-gray-800 dark:text-white/90">
                {payment.Invoice?.customerName || "-"}
              </p>
            </div>

            <div>
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                Transaction Reference
              </span>
              <p className="text-gray-800 dark:text-white/90">
                {payment.transactionReference || "-"}
              </p>
            </div>

            <div>
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                Status
              </span>
              <p className="text-gray-800 dark:text-white/90">
                {capitalizeWords(payment.status)}
              </p>
            </div>
          </div>
        </div>

        {/* Method-Specific Details */}
        {payment.paymentMethod === "bank_transfer" && (
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-gray-800 dark:text-white/90 mb-4">
              Bank Transfer Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                  Bank Name
                </span>
                <p className="text-gray-800 dark:text-white/90">
                  {payment.bankName || "-"}
                </p>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                  Account Name
                </span>
                <p className="text-gray-800 dark:text-white/90">
                  {payment.accountName || "-"}
                </p>
              </div>
            </div>
          </div>
        )}

        {payment.paymentMethod === "cheque" && (
          <div className="mb-8 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <h4 className="font-semibold text-gray-800 dark:text-white/90 mb-4">
              Cheque Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                  Cheque Number
                </span>
                <p className="text-gray-800 dark:text-white/90">
                  {payment.chequeNumber || "-"}
                </p>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                  Cheque Date
                </span>
                <p className="text-gray-800 dark:text-white/90">
                  {payment.chequeDate ? formatDate(payment.chequeDate) : "-"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Refund Information */}
        {payment.status === "refunded" && payment.refundAmount && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <h4 className="font-semibold text-gray-800 dark:text-white/90 mb-4">
              Refund Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                  Refund Amount
                </span>
                <p className="text-gray-800 dark:text-white/90 font-semibold">
                  {formatPrice(payment.refundAmount)}{" "}
                  {payment.currency || "NGN"}
                </p>
              </div>
              {payment.refundDate && (
                <div>
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                    Refund Date
                  </span>
                  <p className="text-gray-800 dark:text-white/90">
                    {formatDate(payment.refundDate)}
                  </p>
                </div>
              )}
              {payment.refundReason && (
                <div className="md:col-span-2">
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                    Refund Reason
                  </span>
                  <p className="text-gray-800 dark:text-white/90">
                    {payment.refundReason}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Verification & Processing Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div className="space-y-4">
            <div>
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                Verification Status
              </span>
              <p className="text-gray-800 dark:text-white/90">
                {capitalizeWords(payment.verificationStatus)}
              </p>
            </div>

            {payment.verifiedAt && (
              <div>
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                  Verified At
                </span>
                <p className="text-gray-800 dark:text-white/90">
                  {formatDate(payment.verifiedAt)}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                Processed By
              </span>
              <p className="text-gray-800 dark:text-white/90">
                {payment.processedByType || "System"}-{" "}
                {payment.processedByAdmin?.firstName || "N/A"}{" "}
                {payment.processedByAdmin?.lastName || "N/A"}
              </p>
            </div>

            {payment.createdAt && (
              <div>
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                  Created At
                </span>
                <p className="text-gray-800 dark:text-white/90">
                  {formatDate(payment.createdAt)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Description/Notes */}
        {payment.description && (
          <div className="mb-8">
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
              Description/Notes
            </span>
            <p className="text-gray-800 dark:text-white/90">
              {payment.description}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-start">
          <Button variant="outline" onClick={() => router.back()}>
            Back to Payments
          </Button>
        </div>
      </div>
    </div>
  );
}
