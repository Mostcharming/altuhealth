"use client";

import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { apiClient } from "@/lib/apiClient";
import capitalizeWords from "@/lib/capitalize";
import { formatDate } from "@/lib/formatDate";
import { AdminApproval, useApprovalsStore } from "@/lib/store/approvalsStore";
import React, { useEffect, useState } from "react";

interface ApprovalDetailsModalProps {
  isOpen: boolean;
  closeModal: () => void;
  approval: AdminApproval | null;
  onSuccess?: () => void;
}

interface AdminDetails {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: string;
  [key: string]: unknown;
}

const ApprovalDetailsModal: React.FC<ApprovalDetailsModalProps> = ({
  isOpen,
  closeModal,
  approval,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<"approve" | "decline" | null>(null);
  const [comments, setComments] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [adminDetails, setAdminDetails] = useState<AdminDetails | null>(null);

  const errorModal = useModal();
  const successModal = useModal();
  const updateApproval = useApprovalsStore((s) => s.updateApproval);

  // Extract admin details from approval response
  useEffect(() => {
    if (!isOpen || !approval) {
      setAdminDetails(null);
      return;
    }

    // Check if approval has requestedByAdmin populated from backend
    if (approval.requestedByAdmin) {
      setAdminDetails(approval.requestedByAdmin as AdminDetails);
    } else {
      setAdminDetails(null);
    }
  }, [approval, isOpen]);

  const handleApprove = async () => {
    if (!approval) return;
    await performAction("approve");
  };

  const handleDecline = async () => {
    if (!approval) return;
    await performAction("decline");
  };

  const performAction = async (actionType: "approve" | "decline") => {
    if (!approval) return;

    try {
      setLoading(true);

      await apiClient(`/admin/approvals/${approval.id}/action`, {
        method: "POST",
        body: {
          action: actionType,
          comments: comments || undefined,
        },
        onLoading: (l: boolean) => setLoading(l),
      });

      // Update the approval in the store
      updateApproval(approval.id, {
        status: actionType === "approve" ? "approved" : "declined",
        comments: comments || approval.comments,
      });

      setAction(null);
      setComments("");
      successModal.openModal();

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
      errorModal.openModal();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAction(null);
    setComments("");
    setErrorMessage("");
    closeModal();
  };

  // Helper function to format details object for display
  const formatDetailRow = (key: string, value: unknown): React.ReactNode => {
    if (value === null || value === undefined || value === "") return null;

    // Skip fields that are IDs
    if (key.toLowerCase().includes("id")) return null;

    // Format key name (convert camelCase to Title Case)
    const formattedKey = key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();

    if (typeof value === "boolean") {
      return (
        <div
          key={key}
          className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700"
        >
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {formattedKey}:
          </span>
          <span className="text-sm font-medium">
            <span
              className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                value
                  ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                  : "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"
              }`}
            >
              {value ? "Yes" : "No"}
            </span>
          </span>
        </div>
      );
    }

    if (typeof value === "object") {
      return null; // Skip nested objects for now
    }

    return (
      <div
        key={key}
        className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
      >
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formattedKey}:
        </span>
        <span className="text-sm font-medium text-gray-800 dark:text-white/90 text-right break-all max-w-xs">
          {String(value)}
        </span>
      </div>
    );
  };

  if (!approval) return null;

  const detailsObject =
    typeof approval.details === "string"
      ? (() => {
          try {
            return JSON.parse(approval.details);
          } catch {
            return approval.details;
          }
        })()
      : approval.details;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        className="max-w-[700px] p-5 lg:p-8 m-4"
      >
        <div className="px-2 mb-6">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Approval Details
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Review and manage this approval request
          </p>
        </div>

        <div className="custom-scrollbar max-h-[500px] overflow-y-auto px-2 mb-6">
          {/* Model & Action Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                MODEL
              </p>
              <p className="text-base font-semibold text-gray-800 dark:text-white/90">
                {capitalizeWords(approval.model)}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                ACTION
              </p>
              <p className="text-base font-semibold text-gray-800 dark:text-white/90">
                {capitalizeWords(approval.action)}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                STATUS
              </p>
              <span
                className={`text-sm rounded-full px-3 py-1 font-medium inline-block ${
                  approval.status === "pending"
                    ? "bg-yellow-50 dark:bg-yellow-500/15 text-yellow-700 dark:text-yellow-500"
                    : approval.status === "approved"
                    ? "bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-500"
                    : "bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-500"
                }`}
              >
                {capitalizeWords(approval.status)}
              </span>
            </div>

            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                TYPE
              </p>
              <p className="text-base font-semibold text-gray-800 dark:text-white/90">
                {approval.requestedByType || "Admin"}
              </p>
            </div>
          </div>

          {/* Admin Information */}
          <div className="mb-6">
            <h5 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-3">
              Requested By
            </h5>
            <div className="bg-gradient-to-br from-blue-50 to-blue-25 dark:from-blue-500/10 dark:to-blue-500/5 p-4 rounded-lg border border-blue-200 dark:border-blue-500/30">
              {adminDetails ? (
                <div className="space-y-3">
                  <div className="flex items-start justify-between pb-3 border-b border-blue-200 dark:border-blue-500/20">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                        FULL NAME
                      </p>
                      <p className="text-base font-semibold text-gray-800 dark:text-white/90">
                        {adminDetails.firstName} {adminDetails.lastName}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                        EMAIL
                      </p>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400 break-all">
                        {adminDetails.email}
                      </p>
                    </div>
                    {adminDetails.phone && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                          PHONE
                        </p>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                          {adminDetails.phone}
                        </p>
                      </div>
                    )}
                    {adminDetails.role && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                          ROLE
                        </p>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                          {adminDetails.role}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-600 dark:text-gray-400 py-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Admin information not available
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Request Metadata */}
          <div className="mb-6">
            <h5 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-3">
              Request Timeline
            </h5>
            <div className="space-y-3 bg-gray-50 dark:bg-white/5 p-4 rounded-lg">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Created At:
                </span>
                <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {formatDate(approval.createdAt)}
                </span>
              </div>
              {approval.dueAt && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Due At:
                  </span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {formatDate(approval.dueAt)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Information (if actioned) */}
          {approval.status !== "pending" && (
            <div className="mb-6">
              <h5 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-3">
                Action Information
              </h5>
              <div className="space-y-3 bg-gray-50 dark:bg-white/5 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Actioned By:
                  </span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {approval.actionedBy || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Updated At:
                  </span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {formatDate(approval.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Comments */}
          {approval.comments && (
            <div className="mb-6">
              <h5 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-3">
                Comments
              </h5>
              <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {approval.comments}
                </p>
              </div>
            </div>
          )}

          {/* Details */}
          {detailsObject && Object.keys(detailsObject).length > 0 && (
            <div className="mb-6">
              <h5 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-3">
                Request Details
              </h5>
              <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-lg space-y-1">
                {Object.entries(detailsObject).map(([key, value]) =>
                  formatDetailRow(key, value)
                )}
              </div>
            </div>
          )}

          {/* Action Section - Only show if pending */}
          {approval.status === "pending" && !action && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/20">
              <p className="text-sm text-blue-800 dark:text-blue-300 mb-4">
                This approval is pending. Choose to approve or decline this
                request.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setAction("approve")}
                  className="flex-1 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
                >
                  Approve
                </button>
                <button
                  onClick={() => setAction("decline")}
                  className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                >
                  Decline
                </button>
              </div>
            </div>
          )}

          {/* Action Confirmation Section */}
          {action && (
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-500/10 rounded-lg border border-amber-200 dark:border-amber-500/20">
              <h6 className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-3">
                {action === "approve" ? "Approve" : "Decline"} this request?
              </h6>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Comments (Optional)
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Add any comments about this decision..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setAction(null)}
                  disabled={loading}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
                >
                  Cancel
                </button>
                <button
                  onClick={action === "approve" ? handleApprove : handleDecline}
                  disabled={loading}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white ${
                    action === "approve"
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-red-500 hover:bg-red-600"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading
                    ? "Processing..."
                    : action === "approve"
                    ? "Confirm Approval"
                    : "Confirm Decline"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-200 pt-6 dark:border-gray-800">
          <button
            onClick={handleClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
          >
            Close
          </button>
        </div>
      </Modal>

      <SuccessModal
        successModal={successModal}
        handleSuccessClose={() => {
          successModal.closeModal();
          handleClose();
        }}
      />

      <ErrorModal
        message={errorMessage}
        errorModal={errorModal}
        handleErrorClose={() => {
          errorModal.closeModal();
        }}
      />
    </>
  );
};

export default ApprovalDetailsModal;
