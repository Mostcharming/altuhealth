"use client";

import { Modal } from "@/components/ui/modal";
import { formatDate } from "@/lib/formatDate";
import { Appointment } from "@/lib/store/appointmentStore";
import { capitalizeWords } from "@/utils";
import React, { useState } from "react";
import { cancelAppointment } from "@/lib/apis/appointment";
import ConfirmModal from "@/components/modals/confirm";
import SuccessModal from "@/components/modals/success";
import ErrorModal from "@/components/modals/error";

interface AppointmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onAppointmentUpdated?: () => void;
}

const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onAppointmentUpdated,
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

  if (!appointment) return null;

  const handleOpenConfirmModal = () => {
    setConfirmModal({ isOpen: true });
  };

  const handleConfirmCancel = () => {
    setConfirmModal({ isOpen: false });
    handleCancelAppointment();
  };

  const handleCancelAppointment = async () => {
    try {
      setIsLoading(true);
      await cancelAppointment(appointment.id);
      setSuccessModal({ isOpen: true });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to cancel appointment"
      );
      setErrorModal({ isOpen: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessModal({ isOpen: false });
    onAppointmentUpdated?.();
    onClose();
  };

  const handleErrorClose = () => {
    setErrorModal({ isOpen: false });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "approved":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "rejected":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "attended":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "missed":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "cancelled":
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
      case "rescheduled":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
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
          Appointment Details
        </h4>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
          Appointment ID: {appointment.id?.substring(0, 8) || "N/A"}
        </p>
      </div>

      <div className="p-6 border border-gray-200 rounded-lg dark:border-gray-800 max-h-[70vh] overflow-y-auto custom-scrollbar">
        {appointment ? (
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Basic Information
              </h5>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Appointment Date/Time
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {appointment.appointmentDateTime
                      ? formatDate(appointment.appointmentDateTime)
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Status
                  </p>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                      appointment.status
                    )}`}
                  >
                    {capitalizeWords(appointment.status || "N/A")}
                  </span>
                </div>
              </div>
            </div>

            {/* Complaint Information */}
            {appointment.complaint && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Complaint
                </h5>
                <p className="text-sm text-gray-700 dark:text-gray-400">
                  {appointment.complaint}
                </p>
              </div>
            )}

            {/* Provider Information */}
            {appointment.Provider && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Provider Information
                </h5>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Provider Name
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {capitalizeWords(appointment.Provider.name || "N/A")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Code
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {appointment.Provider.code || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Category
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {capitalizeWords(appointment.Provider.category || "N/A")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Status
                    </p>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        appointment.Provider.status === "active"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : appointment.Provider.status === "inactive"
                          ? "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                          : appointment.Provider.status === "suspended"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {capitalizeWords(appointment.Provider.status || "N/A")}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Email
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white break-all">
                      {appointment.Provider.email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Phone
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {appointment.Provider.phoneNumber || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Company Information */}
            {appointment.Company && (
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
                      {appointment.Company.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Status
                    </p>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        appointment.Company.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                      }`}
                    >
                      {appointment.Company.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Email
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white break-all">
                      {appointment.Company.email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Phone
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {appointment.Company.phoneNumber || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Subsidiary Information */}
            {appointment.subsidiary && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Subsidiary Information
                </h5>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Subsidiary Name
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {appointment.subsidiary.name || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Notes */}
            {appointment.notes && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Notes
                </h5>
                <p className="text-sm text-gray-700 dark:text-gray-400">
                  {appointment.notes}
                </p>
              </div>
            )}

            {/* Meta Information */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Meta Information
              </h5>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-1">
                    Created
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    {appointment.createdAt
                      ? formatDate(appointment.createdAt)
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-1">
                    Updated
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    {appointment.updatedAt
                      ? formatDate(appointment.updatedAt)
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No appointment data available
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        {appointment.status === "pending" && (
          <button
            onClick={handleOpenConfirmModal}
            disabled={isLoading}
            className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 dark:bg-red-600 dark:hover:bg-red-700"
          >
            {isLoading ? "Cancelling..." : "Cancel Appointment"}
          </button>
        )}
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
        handleSave={handleConfirmCancel}
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

export default AppointmentDetailModal;
