"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import PageBreadcrumbSub from "@/components/common/PageBreadCrumbSub";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { useModal } from "@/hooks/useModal";
import { apiClient } from "@/lib/apiClient";
import capitalizeWords from "@/lib/capitalize";
import { formatDate, formatPrice } from "@/lib/formatDate";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentAdviceDetail() {
  const params = useParams();
  const id = params.id as string;
  const [paymentAdvice, setPaymentAdvice] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const errorModal = useModal();
  const successModal = useModal();
  const [errorMessage, setErrorMessage] = useState(
    "Failed to load payment advice. Please try again."
  );

  useEffect(() => {
    const fetchPaymentAdvice = async () => {
      try {
        setLoading(true);
        const response = await apiClient(`/admin/payment-advices/${id}`);

        if (response.data) {
          setPaymentAdvice(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch payment advice:", error);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to fetch payment advice"
        );
        errorModal.openModal();
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPaymentAdvice();
    }
  }, [id, errorModal]);

  useEffect(() => {
    document.title = "AltuHealth Admin Payment Advice Details";
  }, []);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400";
      case "draft":
        return "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400";
      case "approved":
        return "bg-info-100 text-info-700 dark:bg-info-900/30 dark:text-info-400";
      case "sent":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "acknowledged":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "failed":
        return "bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const pageTitle = paymentAdvice
    ? paymentAdvice.paymentAdviceNumber
    : "Payment Advice Details";

  return (
    <div>
      {loading ? (
        <SpinnerThree />
      ) : (
        <>
          <PageBreadcrumbSub
            parentTitle="Payment Advices"
            parentHref="/payment-advice"
            currentTitle={pageTitle}
          />
          <div className="space-y-6 mt-6">
            {/* Header Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {paymentAdvice?.paymentAdviceNumber}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {paymentAdvice?.provider?.name}
                  </p>
                </div>
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusBadgeColor(
                    paymentAdvice?.status
                  )}`}
                >
                  {capitalizeWords(paymentAdvice?.status)}
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Total Amount */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total Amount
                    </p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
                      {formatPrice(paymentAdvice?.totalAmount || 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Date */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Payment Date
                </p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white mt-2">
                  {paymentAdvice?.paymentDate
                    ? formatDate(paymentAdvice.paymentDate)
                    : "-"}
                </p>
              </div>

              {/* Due Date */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Due Date
                </p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white mt-2">
                  {paymentAdvice?.dueDate
                    ? formatDate(paymentAdvice.dueDate)
                    : "-"}
                </p>
              </div>

              {/* Number of Claims */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Number of Claims
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
                  {paymentAdvice?.numberOfClaims || 0}
                </p>
              </div>

              {/* Payment Method */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Payment Method
                </p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white mt-2">
                  {capitalizeWords(paymentAdvice?.paymentMethod || "N/A")}
                </p>
              </div>

              {/* Provider */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Provider
                </p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white mt-2">
                  {paymentAdvice?.provider?.name ||
                    paymentAdvice?.provider?.code ||
                    "Unknown"}
                </p>
                {paymentAdvice?.provider?.email && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {paymentAdvice.provider.email}
                  </p>
                )}
              </div>
            </div>

            {/* Bank Details */}
            {paymentAdvice?.paymentMethod === "bank_transfer" && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Bank Details
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {paymentAdvice?.bankName && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Bank Name
                      </p>
                      <p className="text-gray-900 dark:text-white mt-1">
                        {paymentAdvice.bankName}
                      </p>
                    </div>
                  )}
                  {paymentAdvice?.accountName && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Account Name
                      </p>
                      <p className="text-gray-900 dark:text-white mt-1">
                        {paymentAdvice.accountName}
                      </p>
                    </div>
                  )}
                  {paymentAdvice?.bankAccountNumber && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Account Number
                      </p>
                      <p className="text-gray-900 dark:text-white mt-1">
                        {paymentAdvice.bankAccountNumber}
                      </p>
                    </div>
                  )}
                  {paymentAdvice?.accountType && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Account Type
                      </p>
                      <p className="text-gray-900 dark:text-white mt-1">
                        {paymentAdvice.accountType}
                      </p>
                    </div>
                  )}
                  {paymentAdvice?.sortCode && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Sort Code
                      </p>
                      <p className="text-gray-900 dark:text-white mt-1">
                        {paymentAdvice.sortCode}
                      </p>
                    </div>
                  )}
                  {paymentAdvice?.routingNumber && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Routing Number
                      </p>
                      <p className="text-gray-900 dark:text-white mt-1">
                        {paymentAdvice.routingNumber}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {paymentAdvice?.description && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Description
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {paymentAdvice.description}
                </p>
              </div>
            )}

            {/* Notes */}
            {paymentAdvice?.notes && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Additional Notes
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {paymentAdvice.notes}
                </p>
              </div>
            )}

            {/* Metadata */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Metadata
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {paymentAdvice?.createdAt && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Created At
                    </p>
                    <p className="text-gray-900 dark:text-white mt-1">
                      {formatDate(paymentAdvice.createdAt)}
                    </p>
                  </div>
                )}
                {paymentAdvice?.updatedAt && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Updated At
                    </p>
                    <p className="text-gray-900 dark:text-white mt-1">
                      {formatDate(paymentAdvice.updatedAt)}
                    </p>
                  </div>
                )}
                {paymentAdvice?.approvedDate && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Approved Date
                    </p>
                    <p className="text-gray-900 dark:text-white mt-1">
                      {formatDate(paymentAdvice.approvedDate)}
                    </p>
                  </div>
                )}
                {paymentAdvice?.sentDate && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Sent Date
                    </p>
                    <p className="text-gray-900 dark:text-white mt-1">
                      {formatDate(paymentAdvice.sentDate)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <SuccessModal
        successModal={successModal}
        handleSuccessClose={() => successModal.closeModal()}
      />

      <ErrorModal
        message={errorMessage}
        errorModal={errorModal}
        handleErrorClose={() => errorModal.closeModal()}
      />
    </div>
  );
}
