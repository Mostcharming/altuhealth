"use client";

import { Modal } from "@/components/ui/modal";
import capitalizeWords from "@/lib/capitalize";
import { formatDate } from "@/lib/formatDate";
import { AdmissionTracker } from "@/lib/store/admissionTrackerStore";
import React from "react";

interface AdmissionTrackerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  admission: AdmissionTracker | null;
}

const AdmissionTrackerDetailModal: React.FC<
  AdmissionTrackerDetailModalProps
> = ({ isOpen, onClose, admission }) => {
  if (!admission) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "admitted":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "discharged":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "transferred":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "absconded":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "expired":
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
          Admission Details
        </h4>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
          Admission ID: {admission.id?.substring(0, 8) || "N/A"}
        </p>
      </div>

      <div className="p-6 border border-gray-200 rounded-lg dark:border-gray-800 max-h-[70vh] overflow-y-auto custom-scrollbar">
        {admission ? (
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Basic Information
              </h5>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Admission Date
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {admission.admissionDate
                      ? formatDate(admission.admissionDate)
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Status
                  </p>
                  <span
                    className={`inline-block px-3 py-1 rounded text-xs font-medium ${getStatusColor(
                      admission.status
                    )}`}
                  >
                    {capitalizeWords(admission.status)}
                  </span>
                </div>
                {admission.dischargeDate && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Discharge Date
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatDate(admission.dischargeDate)}
                    </p>
                  </div>
                )}
                {admission.daysOfAdmission && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Days of Admission
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {admission.daysOfAdmission} days
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Medical Information */}
            {(admission.diagnosis ||
              admission.diagnosisCode ||
              admission.reasonForAdmission) && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Medical Information
                </h5>
                <div className="grid grid-cols-2 gap-6">
                  {admission.diagnosis && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Diagnosis
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {admission.diagnosis}
                      </p>
                    </div>
                  )}
                  {admission.diagnosisCode && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Diagnosis Code
                      </p>
                      <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                        {admission.diagnosisCode}
                      </p>
                    </div>
                  )}
                  {admission.reasonForAdmission && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Reason for Admission
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {admission.reasonForAdmission}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Room/Ward Information */}
            {(admission.roomType || admission.bedNumber || admission.ward) && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Room/Ward Information
                </h5>
                <div className="grid grid-cols-2 gap-6">
                  {admission.roomType && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Room Type
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {admission.roomType}
                      </p>
                    </div>
                  )}
                  {admission.bedNumber && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Bed Number
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {admission.bedNumber}
                      </p>
                    </div>
                  )}
                  {admission.ward && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Ward
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {admission.ward}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Physician Information */}
            {(admission.admittingPhysician ||
              admission.dischargingPhysician) && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Physician Information
                </h5>
                <div className="grid grid-cols-2 gap-6">
                  {admission.admittingPhysician && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Admitting Physician
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {admission.admittingPhysician}
                      </p>
                    </div>
                  )}
                  {admission.dischargingPhysician && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Discharging Physician
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {admission.dischargingPhysician}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Enrollee Information */}
            {admission.Enrollee && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Enrollee Information
                </h5>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Full Name
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {admission.Enrollee.firstName}{" "}
                      {admission.Enrollee.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Policy Number
                    </p>
                    <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                      {admission.Enrollee.policyNumber || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Email
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white break-all">
                      {admission.Enrollee.email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Phone
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {admission.Enrollee.phoneNumber || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Provider Information */}
            {admission.Provider && (
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
                      {capitalizeWords(admission.Provider.name)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Provider Code
                    </p>
                    <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                      {admission.Provider.code || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Category
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {capitalizeWords(admission.Provider.category || "N/A")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Status
                    </p>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        admission.Provider.status === "active"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : admission.Provider.status === "inactive"
                          ? "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                          : admission.Provider.status === "suspended"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {capitalizeWords(admission.Provider.status || "N/A")}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Email
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white break-all">
                      {admission.Provider.email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Phone
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {admission.Provider.phoneNumber || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Location
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {admission.Provider.state && admission.Provider.lga
                        ? `${admission.Provider.lga}, ${admission.Provider.state}`
                        : admission.Provider.state || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Address
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {admission.Provider.address || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Company Information */}
            {admission.Company && (
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
                      {admission.Company.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Status
                    </p>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        admission.Company.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {admission.Company.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Email
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white break-all">
                      {admission.Company.email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Phone
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {admission.Company.phoneNumber || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Subsidiary Information */}
            {admission.subsidiary && (
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
                      {admission.subsidiary.name || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Bill Information */}
            {(admission.totalBillAmount ||
              admission.approvedAmount ||
              admission.approvedBy) && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Bill Information
                </h5>
                <div className="grid grid-cols-2 gap-6">
                  {admission.totalBillAmount && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Total Bill Amount
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        ₦{Number(admission.totalBillAmount).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {admission.approvedAmount && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Approved Amount
                      </p>
                      <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                        ₦{Number(admission.approvedAmount).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {admission.approvedBy && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Approved By
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {admission.approvedBy}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Treatment Notes */}
            {admission.treatmentNotes && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Treatment Notes
                </h5>
                <p className="text-sm text-gray-700 dark:text-gray-400">
                  {admission.treatmentNotes}
                </p>
              </div>
            )}

            {/* Discharge Notes */}
            {admission.dischargeNotes && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Discharge Notes
                </h5>
                <p className="text-sm text-gray-700 dark:text-gray-400">
                  {admission.dischargeNotes}
                </p>
              </div>
            )}

            {/* Additional Notes */}
            {admission.notes && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Additional Notes
                </h5>
                <p className="text-sm text-gray-700 dark:text-gray-400">
                  {admission.notes}
                </p>
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
                    {admission.createdAt
                      ? formatDate(admission.createdAt)
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-1">
                    Updated
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    {admission.updatedAt
                      ? formatDate(admission.updatedAt)
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No admission data available
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

export default AdmissionTrackerDetailModal;
