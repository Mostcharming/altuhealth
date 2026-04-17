"use client";

import ConfirmModal from "@/components/modals/confirm";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import { Modal } from "@/components/ui/modal";
import { deleteDependent } from "@/lib/apis/dependent";
import { formatDate } from "@/lib/formatDate";
import { Dependent } from "@/lib/store/dependentStore";
import { capitalizeWords } from "@/utils";
import React, { useState } from "react";

interface DependentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  dependent: Dependent | null;
  onDependentUpdated?: () => void;
}

const DependentDetailModal: React.FC<DependentDetailModalProps> = ({
  isOpen,
  onClose,
  dependent,
  onDependentUpdated,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean }>({
    isOpen: false,
  });
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean }>({
    isOpen: false,
  });
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean }>({
    isOpen: false,
  });
  const [errorMessage, setErrorMessage] = useState<string>("");

  if (!dependent) return null;

  const handleOpenConfirmModal = () => {
    setConfirmModal({ isOpen: true });
  };

  const handleConfirmDelete = () => {
    setConfirmModal({ isOpen: false });
    handleDeleteDependent();
  };

  const handleDeleteDependent = async () => {
    try {
      setIsLoading(true);
      await deleteDependent(dependent.id);
      setSuccessModal({ isOpen: true });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to delete dependent"
      );
      setErrorModal({ isOpen: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessModal({ isOpen: false });
    onDependentUpdated?.();
    onClose();
  };

  const handleErrorClose = () => {
    setErrorModal({ isOpen: false });
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[900px] p-5 lg:p-10 m-4"
    >
      <div className="px-2">
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Dependent Details
        </h4>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
          Policy Number: {dependent.policyNumber}
        </p>
      </div>

      <div className="p-6 border border-gray-200 rounded-lg dark:border-gray-800 max-h-[70vh] overflow-y-auto custom-scrollbar">
        {dependent ? (
          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h5 className="mb-4 font-semibold text-gray-700 dark:text-gray-300">
                Personal Information
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    First Name
                  </p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {capitalizeWords(dependent.firstName)}
                  </p>
                </div>
                {dependent.middleName && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Middle Name
                    </p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      {capitalizeWords(dependent.middleName)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Last Name
                  </p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {capitalizeWords(dependent.lastName)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Date of Birth
                  </p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {formatDate(dependent.dateOfBirth)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Gender
                  </p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {capitalizeWords(dependent.gender)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Relationship
                  </p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {capitalizeWords(
                      dependent.relationshipToEnrollee.replace(/_/g, " ")
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h5 className="mb-4 font-semibold text-gray-700 dark:text-gray-300">
                Contact Information
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dependent.phoneNumber && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Phone Number
                    </p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      {dependent.phoneNumber}
                    </p>
                  </div>
                )}
                {dependent.email && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Email
                    </p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      {dependent.email}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h5 className="mb-4 font-semibold text-gray-700 dark:text-gray-300">
                Additional Information
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dependent.occupation && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Occupation
                    </p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      {dependent.occupation}
                    </p>
                  </div>
                )}
                {dependent.maritalStatus && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Marital Status
                    </p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      {capitalizeWords(dependent.maritalStatus)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Medical Information */}
            {dependent.preexistingMedicalRecords && (
              <div>
                <h5 className="mb-4 font-semibold text-gray-700 dark:text-gray-300">
                  Medical Information
                </h5>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Pre-existing Medical Records
                  </p>
                  <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {dependent.preexistingMedicalRecords}
                  </p>
                </div>
              </div>
            )}

            {/* Notes */}
            {dependent.notes && (
              <div>
                <h5 className="mb-4 font-semibold text-gray-700 dark:text-gray-300">
                  Notes
                </h5>
                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {dependent.notes}
                </p>
              </div>
            )}

            {/* Status & Dates */}
            <div>
              <h5 className="mb-4 font-semibold text-gray-700 dark:text-gray-300">
                Status & Dates
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </p>
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      dependent.isActive ?? true
                    )}`}
                  >
                    {dependent.isActive ? "Active" : "Inactive"}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Enrollment Date
                  </p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {formatDate(dependent.enrollmentDate || "")}
                  </p>
                </div>
                {dependent.expirationDate && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Expiration Date
                    </p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      {formatDate(dependent.expirationDate)}
                    </p>
                  </div>
                )}
                {dependent.verifiedAt && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Verified At
                    </p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      {formatDate(dependent.verifiedAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No dependent information available
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={handleOpenConfirmModal}
          disabled={isLoading}
          className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 dark:bg-red-600 dark:hover:bg-red-700"
        >
          {isLoading ? "Deleting..." : "Delete Dependent"}
        </button>
        <button
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          Close
        </button>
      </div>

      <ConfirmModal
        confirmModal={confirmModal}
        handleSave={handleConfirmDelete}
        closeModal={() => setConfirmModal({ isOpen: false })}
      />

      <SuccessModal
        successModal={successModal}
        handleSuccessClose={handleSuccessClose}
      />

      <ErrorModal
        errorModal={errorModal}
        handleErrorClose={handleErrorClose}
        message={errorMessage}
      />
    </Modal>
  );
};

export default DependentDetailModal;
