"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Modal } from "@/components/ui/modal";
import capitalizeWords from "@/lib/capitalize";
import { formatDate, formatPrice } from "@/lib/formatDate";
import React from "react";

interface EncounterDetail {
  id: string;
  serviceType?: string;
  amount?: number;
  status?: string;
  encounterDate?: string;
  diagnosisCode?: string;
  approvedAmount?: number;
  [key: string]: any;
}

interface ClaimDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  detail: any;
  encounters?: EncounterDetail[];
}

const ClaimDetailModal: React.FC<ClaimDetailModalProps> = ({
  isOpen,
  onClose,
  detail,
  //   encounters = [],
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[900px] p-5 lg:p-10 m-4"
    >
      <div className="px-2">
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Encounter Details
        </h4>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
          Service Type: {capitalizeWords(detail?.serviceType || "N/A")}
        </p>
      </div>

      <div className="p-6 border border-gray-200 rounded-lg dark:border-gray-800 max-h-[70vh] overflow-y-auto custom-scrollbar">
        {/* Encounter Details */}
        {detail ? (
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Basic Information
              </h5>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Service Date
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {detail.serviceDate
                      ? formatDate(detail.serviceDate)
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Service Type
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {capitalizeWords(detail.serviceType || "N/A")}
                  </p>
                </div>
                {detail.dischargeDate && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Discharge Date
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatDate(detail.dischargeDate)}
                    </p>
                  </div>
                )}
                {detail.inpatientDays && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Inpatient Days
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {detail.inpatientDays}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Status
                  </p>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      detail.status === "approved"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : detail.status === "rejected"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : detail.status === "pending"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                    }`}
                  >
                    {capitalizeWords(detail.status || "pending")}
                  </span>
                </div>
              </div>
            </div>

            {/* Diagnosis Information */}
            {detail.Diagnosis && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Diagnosis Information
                </h5>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Diagnosis Name
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {detail.Diagnosis.name || "N/A"}
                    </p>
                  </div>
                  {detail.Diagnosis.description && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Description
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-400">
                        {detail.Diagnosis.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Procedure/Medication Information */}
            {(detail.procedureCode ||
              detail.procedureName ||
              detail.medicationCode ||
              detail.medicationName) && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Procedure/Medication
                </h5>
                <div className="grid grid-cols-2 gap-6">
                  {detail.procedureCode && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Procedure Code
                      </p>
                      <p className="text-sm font-mono text-gray-900 dark:text-white">
                        {detail.procedureCode}
                      </p>
                    </div>
                  )}
                  {detail.procedureName && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Procedure Name
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {detail.procedureName}
                      </p>
                    </div>
                  )}
                  {detail.medicationCode && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Medication Code
                      </p>
                      <p className="text-sm font-mono text-gray-900 dark:text-white">
                        {detail.medicationCode}
                      </p>
                    </div>
                  )}
                  {detail.medicationName && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Medication Name
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {detail.medicationName}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Authorization Information */}
            {(detail.authorizationCode || detail.referralCode) && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Authorization
                </h5>
                <div className="grid grid-cols-2 gap-6">
                  {detail.authorizationCode && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Authorization Code
                      </p>
                      <p className="text-sm font-mono text-gray-900 dark:text-white">
                        {detail.authorizationCode}
                      </p>
                    </div>
                  )}
                  {detail.referralCode && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Referral Code
                      </p>
                      <p className="text-sm font-mono text-gray-900 dark:text-white">
                        {detail.referralCode}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Financial Details */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Financial Details
              </h5>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Amount Submitted
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatPrice(detail.amountSubmitted) ?? "0.00"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Amount Approved
                  </p>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {formatPrice(detail.amountApproved) ?? "0.00"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Amount Rejected
                  </p>
                  <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                    {formatPrice(detail.amountRejected) ?? "0.00"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Quantity
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {detail.quantity || 0}
                  </p>
                </div>
                {detail.unitPrice && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Unit Price
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatPrice(detail.unitPrice) ?? "0.00"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Enrollee Information */}
            {detail.Enrollee && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Enrollee Information
                </h5>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Name
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {detail.Enrollee.firstName} {detail.Enrollee.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Policy Number
                    </p>
                    <p className="text-sm font-mono text-gray-900 dark:text-white">
                      {detail.Enrollee.policyNumber || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Email
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {detail.Enrollee.email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Phone
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {detail.Enrollee.phoneNumber || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Company Information */}
            {detail.Company && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Company Information
                </h5>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Company Name
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {detail.Company.name || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Notes */}
            {(detail.description ||
              detail.vetterNotes ||
              detail.rejectionReason) && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Additional Information
                </h5>
                {detail.description && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Description
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-400">
                      {detail.description}
                    </p>
                  </div>
                )}
                {detail.vetterNotes && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Vetter Notes
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-400">
                      {detail.vetterNotes}
                    </p>
                  </div>
                )}
                {detail.rejectionReason && (
                  <div>
                    <p className="text-xs text-red-600 dark:text-red-400 mb-2">
                      Rejection Reason
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {detail.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Attachment */}
            {detail.attachmentUrl && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Attachment
                </h5>
                <a
                  href={detail.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline text-sm"
                >
                  View Attachment
                </a>
              </div>
            )}

            {/* Meta Information */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                System Information
              </h5>
              <div className="grid grid-cols-2 gap-6 text-xs">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-1">
                    Created
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    {detail.createdAt ? formatDate(detail.createdAt) : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-1">
                    Updated
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    {detail.updatedAt ? formatDate(detail.updatedAt) : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No encounter data available
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default ClaimDetailModal;
