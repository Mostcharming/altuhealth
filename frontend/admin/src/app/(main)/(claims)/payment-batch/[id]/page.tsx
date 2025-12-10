"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import PageBreadcrumbSub from "@/components/common/PageBreadCrumbSub";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import BatchDetailModal from "@/components/pages/paymentBatch/BatchDetailModal";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { useModal } from "@/hooks/useModal";
import { EyeIcon } from "@/icons";
import { apiClient } from "@/lib/apiClient";
import capitalizeWords from "@/lib/capitalize";
import { formatDate, formatPrice } from "@/lib/formatDate";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentBatchDetail() {
  const params = useParams();
  const id = params.id as string;
  const [paymentBatch, setPaymentBatch] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [markingAsPaid, setMarkingAsPaid] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailClaims, setDetailClaims] = useState<any[]>([]);
  const [detailConflicts, setDetailConflicts] = useState<any[]>([]);
  const errorModal = useModal();
  const successModal = useModal();
  const [errorMessage, setErrorMessage] = useState(
    "Failed to mark payment batch as paid. Please try again."
  );

  useEffect(() => {
    const fetchPaymentBatch = async () => {
      try {
        setLoading(true);
        const response = await apiClient(
          `/admin/payment-batches/${id}/with-details`
        );

        if (response.data) {
          // Fetch provider details for each detail record
          if (response.data.details && response.data.details.length > 0) {
            const enrichedDetails = await Promise.all(
              response.data.details.map(async (detail: any) => {
                try {
                  const providerResponse = await apiClient(
                    `/admin/providers/${detail.providerId}`
                  );
                  return {
                    ...detail,
                    provider: providerResponse.data,
                  };
                } catch (error) {
                  console.error(
                    `Failed to fetch provider ${detail.providerId}:`,
                    error
                  );
                  return detail;
                }
              })
            );
            response.data.details = enrichedDetails;
          }
          setPaymentBatch(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch payment batch:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPaymentBatch();
    }
  }, [id]);

  useEffect(() => {
    document.title = "AltuHealth Admin Payment Batch Details";
  }, []);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400";
      case "pending":
        return "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400";
      case "Processing":
        return "bg-info-100 text-info-700 dark:bg-info-900/30 dark:text-info-400";
      case "failed":
        return "bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400";
      case "partial":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const pageTitle = paymentBatch
    ? capitalizeWords(paymentBatch?.title)
    : "Payment Batch Details";

  const handleMarkAsPaid = async () => {
    try {
      setMarkingAsPaid(true);
      await apiClient(`/admin/payment-batches/${id}`, {
        method: "PUT",
        body: {
          ...paymentBatch,
          isPaid: true,
        },
      });

      // if (response.data?.paymentBatch) {
      //   setPaymentBatch(response.data.paymentBatch);
      // } else {
      setPaymentBatch({
        ...paymentBatch,
        isPaid: true,
      });
      // }
      successModal.openModal();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to mark payment batch as paid. Please try again."
      );
      errorModal.openModal();
    } finally {
      setMarkingAsPaid(false);
    }
  };

  const handleViewDetail = async (detail: any) => {
    try {
      setSelectedDetail(detail);

      // Fetch claims for this detail
      const claimsResponse = await apiClient(
        `/admin/payment-batches/details/${detail.id}/claims?limit=all`
      );
      setDetailClaims(claimsResponse.data?.list || []);

      // Fetch conflicts for this detail
      const conflictsResponse = await apiClient(
        `/admin/payment-batches/details/${detail.id}/conflicts?limit=all`
      );
      setDetailConflicts(conflictsResponse.data?.list || []);

      setIsDetailModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch detail data:", error);
      setDetailClaims([]);
      setDetailConflicts([]);
      setIsDetailModalOpen(true);
    }
  };

  return (
    <div>
      {loading ? (
        <SpinnerThree />
      ) : (
        <>
          <PageBreadcrumbSub
            parentTitle="Payment Batches"
            parentHref="/payment-batch"
            currentTitle={pageTitle}
          />
          <div className="space-y-6 mt-6">
            {/* Header Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Title: {capitalizeWords(paymentBatch?.title)}
                  </h1>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Description: {paymentBatch?.description}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusBadgeColor(
                      paymentBatch?.status
                    )}`}
                  >
                    {capitalizeWords(paymentBatch?.status)}
                  </span>
                  {!paymentBatch?.isPaid && (
                    <button
                      onClick={handleMarkAsPaid}
                      disabled={markingAsPaid}
                      className="px-4 py-2 rounded bg-success-500 text-white hover:bg-success-600 disabled:opacity-50 text-sm font-medium transition-colors"
                    >
                      {markingAsPaid ? "Marking..." : "Mark as Paid"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Basic Info Card */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Basic Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Number of Providers
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {paymentBatch?.numberOfProviders || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Number of Batches
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {paymentBatch?.numberOfBatches || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Conflict Count
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {paymentBatch?.conflictCount || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Financial Info Card */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Financial Summary
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Total Claims Amount
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatPrice(paymentBatch.totalClaimsAmount) ?? "0.00"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Reconciliation Amount
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatPrice(paymentBatch.reconciliationAmount) ?? "0.00"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Payment Status
                    </p>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        paymentBatch?.isPaid
                          ? "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400"
                          : "bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400"
                      }`}
                    >
                      {paymentBatch?.isPaid ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dates Card */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Important Dates
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Created Date
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {paymentBatch?.createdAt
                        ? formatDate(paymentBatch.createdAt)
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Payment Date
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {paymentBatch?.paymentDate
                        ? formatDate(paymentBatch.paymentDate)
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Due Date
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {paymentBatch?.dueDate
                        ? formatDate(paymentBatch.dueDate)
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Paid/Unpaid Statistics Card */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Payment Statistics
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Number Paid
                      </p>
                      <p className="text-lg font-semibold text-success-700 dark:text-success-400">
                        {paymentBatch?.numberPaid || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Number Unpaid
                      </p>
                      <p className="text-lg font-semibold text-error-700 dark:text-error-400">
                        {paymentBatch?.numberUnpaid || 0}
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Paid Amount
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatPrice(paymentBatch.paidAmount) ?? "0.00"}
                      </p>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Unpaid Amount
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatPrice(paymentBatch.unpaidAmount) ?? "0.00"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            {paymentBatch?.notes && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Notes
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-400">
                  {paymentBatch.notes}
                </p>
              </div>
            )}

            {/* Batch Details Table */}
            {paymentBatch?.details && paymentBatch.details.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Batch Details
                  </h3>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800">
                        <th className="p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400">
                          Provider Name
                        </th>
                        <th className="p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400">
                          Period
                        </th>
                        <th className="p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400">
                          Claims Count
                        </th>
                        <th className="p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400">
                          Reconciliation Count
                        </th>
                        <th className="p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400">
                          Claims Amount
                        </th>
                        <th className="p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400">
                          Reconciliation Amount
                        </th>
                        <th className="p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400">
                          Status
                        </th>
                        <th className="p-4 text-center text-xs font-medium text-gray-700 dark:text-gray-400">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {paymentBatch.details.map(
                        (detail: any, index: number) => (
                          <tr
                            key={index}
                            className="hover:bg-gray-50 dark:hover:bg-gray-900"
                          >
                            <td className="p-4 text-sm text-gray-700 dark:text-gray-400">
                              {capitalizeWords(
                                detail.provider?.name || detail.providerId
                              )}
                            </td>
                            <td className="p-4 text-sm text-gray-700 dark:text-gray-400">
                              {detail.period}
                            </td>
                            <td className="p-4 text-sm text-gray-700 dark:text-gray-400">
                              {detail.claimsCount || 0}
                            </td>
                            <td className="p-4 text-sm text-gray-700 dark:text-gray-400">
                              {detail.reconciliationCount || 0}
                            </td>
                            <td className="p-4 text-sm text-gray-700 dark:text-gray-400">
                              {formatPrice(detail.claimsAmount) ?? "0.00"}
                            </td>
                            <td className="p-4 text-sm text-gray-700 dark:text-gray-400">
                              {formatPrice(detail.reconciliationAmount) ??
                                "0.00"}
                            </td>
                            <td className="p-4 text-sm">
                              <span
                                className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(
                                  detail.paymentStatus
                                )}`}
                              >
                                {capitalizeWords(detail.paymentStatus)}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => handleViewDetail(detail)}
                                className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90"
                                title="View Details"
                              >
                                <EyeIcon />
                              </button>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <BatchDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedDetail(null);
          setDetailClaims([]);
          setDetailConflicts([]);
        }}
        detail={selectedDetail}
        claims={detailClaims}
        conflicts={detailConflicts}
      />

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
