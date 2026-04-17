"use client";

import { Modal } from "@/components/ui/modal";
import capitalizeWords from "@/lib/capitalize";
import { formatDate } from "@/lib/formatDate";
import { MedicalHistory } from "@/lib/store/medicalHistoryStore";
import React from "react";

interface MedicalHistoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicalHistory: MedicalHistory | null;
}

const MedicalHistoryDetailModal: React.FC<MedicalHistoryDetailModalProps> = ({
  isOpen,
  onClose,
  medicalHistory,
}) => {
  if (!medicalHistory) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "reviewed":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "approved":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "rejected":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[900px] p-5 lg:p-10 m-4"
    >
      <div className="px-2">
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Medical History Details
        </h4>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
          Record ID: {medicalHistory.id?.substring(0, 8) || "N/A"}
        </p>
      </div>

      <div className="p-6 border border-gray-200 rounded-lg dark:border-gray-800 max-h-[70vh] overflow-y-auto custom-scrollbar">
        {medicalHistory ? (
          <div className="space-y-6">
            {/* Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Status
                </label>
                <span
                  className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    medicalHistory.status
                  )}`}
                >
                  {capitalizeWords(medicalHistory.status)}
                </span>
              </div>

              {/* Currency */}
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Currency
                </label>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  {medicalHistory.currency || "N/A"}
                </p>
              </div>
            </div>

            {/* Service Date */}
            {medicalHistory.serviceDate && (
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Service Date
                </label>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  {formatDate(medicalHistory.serviceDate)}
                </p>
              </div>
            )}

            {/* Amount */}
            {medicalHistory.amount && (
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Amount
                </label>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  {medicalHistory.currency}{" "}
                  {Number(medicalHistory.amount).toLocaleString()}
                </p>
              </div>
            )}

            {/* EVS Code */}
            {medicalHistory.evsCode && (
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  EVS Code
                </label>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  {medicalHistory.evsCode}
                </p>
              </div>
            )}

            {/* Provider Information */}
            {medicalHistory.Provider && (
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Provider Information
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      Name
                    </label>
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                      {capitalizeWords(medicalHistory.Provider.name)}
                    </p>
                  </div>
                  {medicalHistory.Provider.code && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Code
                      </label>
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                        {medicalHistory.Provider.code}
                      </p>
                    </div>
                  )}
                  {medicalHistory.Provider.category && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Category
                      </label>
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                        {capitalizeWords(medicalHistory.Provider.category)}
                      </p>
                    </div>
                  )}
                  {medicalHistory.Provider.email && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Email
                      </label>
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                        {medicalHistory.Provider.email}
                      </p>
                    </div>
                  )}
                  {medicalHistory.Provider.phoneNumber && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Phone
                      </label>
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                        {medicalHistory.Provider.phoneNumber}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Diagnosis Information */}
            {medicalHistory.Diagnosis && (
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Diagnosis Information
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      Name
                    </label>
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                      {capitalizeWords(medicalHistory.Diagnosis.name)}
                    </p>
                  </div>
                  {medicalHistory.Diagnosis.code && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Code
                      </label>
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                        {medicalHistory.Diagnosis.code}
                      </p>
                    </div>
                  )}
                  {medicalHistory.Diagnosis.description && (
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Description
                      </label>
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                        {medicalHistory.Diagnosis.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {medicalHistory.notes && (
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Notes
                </label>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  {medicalHistory.notes}
                </p>
              </div>
            )}

            {/* Attachment */}
            {medicalHistory.attachmentUrl && (
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Attachment
                </label>
                <p className="mt-2">
                  <a
                    href={medicalHistory.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 underline"
                  >
                    View Attachment
                  </a>
                </p>
              </div>
            )}

            {/* Timestamps */}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    Created At
                  </label>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">
                    {medicalHistory.createdAt
                      ? formatDate(medicalHistory.createdAt)
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    Updated At
                  </label>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">
                    {medicalHistory.updatedAt
                      ? formatDate(medicalHistory.updatedAt)
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No medical history record found.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3">
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

export default MedicalHistoryDetailModal;
