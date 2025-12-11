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
          <div>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Encounter Date
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {detail.encounterDate
                    ? formatDate(detail.encounterDate)
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
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Diagnosis Code
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {detail.diagnosisCode || "N/A"}
                </p>
              </div>
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

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Financial Details
              </h5>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Claimed Amount
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatPrice(detail.amount) ?? "0.00"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Approved Amount
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatPrice(detail.approvedAmount) ?? "0.00"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Difference
                  </p>
                  <p
                    className={`text-lg font-semibold ${
                      (detail.amount || 0) - (detail.approvedAmount || 0) > 0
                        ? "text-error-700 dark:text-error-400"
                        : "text-success-700 dark:text-success-400"
                    }`}
                  >
                    {formatPrice(
                      (detail.amount || 0) - (detail.approvedAmount || 0)
                    ) ?? "0.00"}
                  </p>
                </div>
              </div>
            </div>

            {detail.description && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </h5>
                <p className="text-sm text-gray-700 dark:text-gray-400">
                  {detail.description}
                </p>
              </div>
            )}

            {detail.notes && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </h5>
                <p className="text-sm text-gray-700 dark:text-gray-400">
                  {detail.notes}
                </p>
              </div>
            )}
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
