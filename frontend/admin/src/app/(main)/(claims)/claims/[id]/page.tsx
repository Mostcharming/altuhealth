"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import PageBreadcrumbSub from "@/components/common/PageBreadCrumbSub";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import ClaimDetailModal from "@/components/pages/claim/claimDetailModal";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { useModal } from "@/hooks/useModal";
import { EyeIcon } from "@/icons";
import { apiClient } from "@/lib/apiClient";
import capitalizeWords from "@/lib/capitalize";
import { formatDate, formatPrice } from "@/lib/formatDate";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ClaimDetail() {
  const params = useParams();
  const id = params.id as string;
  const [claim, setClaim] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEncounter, setSelectedEncounter] = useState<any | null>(null);
  const [isEncounterModalOpen, setIsEncounterModalOpen] = useState(false);
  const [encounterDetails, setEncounterDetails] = useState<any[]>([]);
  const errorModal = useModal();
  const successModal = useModal();
  const [errorMessage, setErrorMessage] = useState(
    "Failed to load claim details. Please try again."
  );

  useEffect(() => {
    const fetchClaim = async () => {
      try {
        // setLoading(true);
        const response = await apiClient(`/admin/claims/${id}`);

        if (response.data) {
          setClaim(response.data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch claim:", error);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to fetch claim. Please try again."
        );
        errorModal.openModal();
        setLoading(false);
      }
    };

    if (id) {
      fetchClaim();
    }
  }, [id]);

  useEffect(() => {
    document.title = "AltuHealth Admin Claim Details";
  }, []);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400";
      case "awaiting_payment":
        return "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400";
      case "Under_review":
        return "bg-info-100 text-info-700 dark:bg-info-900/30 dark:text-info-400";
      case "rejected":
        return "bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400";
      case "partially_paid":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "draft":
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
      case "submitted":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "pending_vetting":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "queried":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const pageTitle = claim
    ? `${claim?.Provider?.name} - ${claim?.claimReference}`
    : "Claim Details";

  const handleViewEncounter = async (encounter: any) => {
    try {
      setSelectedEncounter(encounter);
      setEncounterDetails(encounter ? [encounter] : []);
      setIsEncounterModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch encounter data:", error);
      setEncounterDetails([]);
      setIsEncounterModalOpen(true);
    }
  };

  return (
    <div>
      {loading ? (
        <SpinnerThree />
      ) : (
        <>
          <PageBreadcrumbSub
            parentTitle="Claims"
            parentHref="/claims"
            currentTitle={pageTitle}
          />
          <div className="space-y-6 mt-6">
            {/* Header Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Claim Reference: {claim?.claimReference}
                  </h1>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Provider: {capitalizeWords(claim?.Provider?.name || "N/A")}
                  </p>
                  {claim?.description && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      Description: {claim.description}
                    </p>
                  )}
                </div>
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusBadgeColor(
                    claim?.status
                  )}`}
                >
                  {capitalizeWords(claim?.status)}
                </span>
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
                      Number of Encounters
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {claim?.numberOfEncounters || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Period
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {claim?.month ? `${claim.month}/${claim.year}` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Submitted By
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {claim?.submittedByType || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Claim ID
                    </p>
                    <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                      {claim?.id || "N/A"}
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
                      Amount Submitted
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatPrice(claim?.amountSubmitted) ?? "0.00"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Amount Processed
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatPrice(claim?.amountProcessed) ?? "0.00"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Difference
                    </p>
                    <p
                      className={`text-lg font-semibold ${
                        (claim?.difference || 0) > 0
                          ? "text-error-700 dark:text-error-400"
                          : "text-success-700 dark:text-success-400"
                      }`}
                    >
                      {formatPrice(claim?.difference) ?? "0.00"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bank Info Card */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Banking Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Bank Used
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {claim?.bankUsedForPayment || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Account Number
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {claim?.bankAccountNumber || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Account Name
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {claim?.accountName || "N/A"}
                    </p>
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
                      Date Submitted
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {claim?.dateSubmitted
                        ? formatDate(claim.dateSubmitted)
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Created Date
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {claim?.createdAt ? formatDate(claim.createdAt) : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Updated Date
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {claim?.updatedAt ? formatDate(claim.updatedAt) : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes Card */}
              {claim?.vetterNotes && (
                <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    Vetter Notes
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-400">
                    {claim.vetterNotes}
                  </p>
                </div>
              )}

              {/* Rejection Reason Card */}
              {claim?.rejectionReason && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/30 dark:bg-red-900/20">
                  <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-4">
                    Rejection Reason
                  </h3>
                  <p className="text-sm text-red-600 dark:text-red-300">
                    {claim.rejectionReason}
                  </p>
                </div>
              )}

              {/* Payment Information Card */}
              {(claim?.datePaid ||
                claim?.bankUsedForPayment ||
                claim?.paymentBatchId) && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-900/30 dark:bg-green-900/20">
                  <h3 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-4">
                    Payment Details
                  </h3>
                  <div className="space-y-3">
                    {claim?.datePaid && (
                      <div>
                        <p className="text-xs text-green-600 dark:text-green-300">
                          Date Paid
                        </p>
                        <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                          {formatDate(claim.datePaid)}
                        </p>
                      </div>
                    )}
                    {claim?.paymentBatchId && (
                      <div>
                        <p className="text-xs text-green-600 dark:text-green-300">
                          Payment Batch ID
                        </p>
                        <p className="text-xs font-mono text-green-700 dark:text-green-400 break-all">
                          {claim.paymentBatchId}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Additional Information */}
            {claim?.attachmentUrl && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Attachment
                </h3>
                <a
                  href={claim.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                >
                  View Attachment
                </a>
              </div>
            )}

            {/* Provider Information Card */}
            {claim?.Provider && (
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Provider Information
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Provider Name
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {claim.Provider.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Provider Code
                      </p>
                      <p className="text-sm font-mono text-gray-900 dark:text-white">
                        {claim.Provider.code || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Category
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {capitalizeWords(claim.Provider.category || "N/A")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Email
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {claim.Provider.email || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Phone Number
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {claim.Provider.phoneNumber || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Address
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {claim.Provider.address || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Batch Details Table - Display encounters/claim details */}
            {claim?.claimDetails && claim.claimDetails.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Claim Encounters/Details
                  </h3>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800">
                        <th className="p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400">
                          Encounter Date
                        </th>
                        <th className="p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400">
                          Service Type
                        </th>
                        <th className="p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400">
                          Items
                        </th>
                        <th className="p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400">
                          Diagnosis
                        </th>
                        <th className="p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400">
                          Enrollee
                        </th>
                        <th className="p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400">
                          Amount Submitted
                        </th>
                        <th className="p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400">
                          Amount Approved
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
                      {claim?.claimDetails.map((detail: any, index: number) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 dark:hover:bg-gray-900"
                        >
                          <td className="p-4 text-sm text-gray-700 dark:text-gray-400">
                            {detail.serviceDate
                              ? formatDate(detail.serviceDate)
                              : "N/A"}
                          </td>
                          <td className="p-4 text-sm text-gray-700 dark:text-gray-400">
                            {capitalizeWords(detail.serviceType || "N/A")}
                          </td>
                          <td className="p-4 text-sm">
                            {detail.items && detail.items.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                {detail.items
                                  .slice(0, 2)
                                  .map((item: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-2"
                                    >
                                      <span
                                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                                          item.itemType === "drug"
                                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        }`}
                                      >
                                        {item.itemName}
                                      </span>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        x{item.quantity}
                                      </span>
                                    </div>
                                  ))}
                                {detail.items.length > 2 && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                                    +{detail.items.length - 2} more
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400">
                                No items
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-sm text-gray-700 dark:text-gray-400">
                            {detail.Diagnosis ? detail.Diagnosis.name : "N/A"}
                          </td>
                          <td className="p-4 text-sm text-gray-700 dark:text-gray-400">
                            {detail.Enrollee
                              ? `${detail.Enrollee.firstName} ${detail.Enrollee.lastName}`
                              : "N/A"}
                          </td>
                          <td className="p-4 text-sm text-gray-700 dark:text-gray-400">
                            {formatPrice(detail.amountSubmitted) ?? "0.00"}
                          </td>
                          <td className="p-4 text-sm text-gray-700 dark:text-gray-400">
                            {formatPrice(detail.amountApproved) ?? "0.00"}
                          </td>
                          <td className="p-4 text-sm">
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(
                                detail.status
                              )}`}
                            >
                              {capitalizeWords(detail.status || "pending")}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleViewEncounter(detail)}
                              className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90"
                              title="View Details"
                            >
                              <EyeIcon />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* No details message */}
            {(!claim?.claimDetails || claim.claimDetails.length === 0) && (
              <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
                <p className="text-gray-500 dark:text-gray-400">
                  No claim details/encounters available for this claim
                </p>
              </div>
            )}
          </div>
        </>
      )}

      <ClaimDetailModal
        isOpen={isEncounterModalOpen}
        onClose={() => {
          setIsEncounterModalOpen(false);
          setSelectedEncounter(null);
          setEncounterDetails([]);
        }}
        detail={selectedEncounter}
        encounters={encounterDetails}
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
