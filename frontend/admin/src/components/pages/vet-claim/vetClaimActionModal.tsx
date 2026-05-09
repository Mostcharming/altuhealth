"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Modal } from "@/components/ui/modal";
import { apiClient } from "@/lib/apiClient";
import React, { useState } from "react";

interface VetClaimActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  claimId: string;
  onSuccess: () => void;
  onError: (message: string) => void;
}

type ActionType = "vetting_complete" | "review_complete" | "reject" | null;

const VetClaimActionModal: React.FC<VetClaimActionModalProps> = ({
  isOpen,
  onClose,
  claimId,
  onSuccess,
  onError,
}) => {
  const [selectedAction, setSelectedAction] = useState<ActionType>(null);
  const [notes, setNotes] = useState<string>("");
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedAction) {
      onError("Please select an action");
      return;
    }

    if (!notes.trim()) {
      onError("Please provide notes for this action");
      return;
    }

    if (selectedAction === "reject" && !rejectionReason.trim()) {
      onError("Please provide a rejection reason");
      return;
    }

    setLoading(true);

    try {
      let endpoint = "";
      let payload: any = {};

      if (selectedAction === "vetting_complete") {
        endpoint = `/admin/claims/${claimId}/vet`;
        payload = {
          vetterNotes: notes,
          // Update claim details to partially_approved
          updateClaimDetails: true,
          detailStatus: "partially_approved",
        };
      } else if (selectedAction === "review_complete") {
        endpoint = `/admin/claims/${claimId}/approve`;
        payload = {
          vetterNotes: notes,
          // Update claim details to approved
          updateClaimDetails: true,
          detailStatus: "approved",
        };
      } else if (selectedAction === "reject") {
        endpoint = `/admin/claims/${claimId}/reject`;
        payload = {
          rejectionReason: rejectionReason,
          vetterNotes: notes,
          // Update claim details to rejected
          updateClaimDetails: true,
          detailStatus: "rejected",
        };
      }

      const response = await apiClient(endpoint, {
        method: "POST",
        body: payload,
      });

      if (response.success || response.data) {
        onSuccess();
      } else {
        onError(response.message || "Failed to update claim");
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedAction(null);
    setNotes("");
    setRejectionReason("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="max-w-[600px] p-5 lg:p-10 m-4"
    >
      <div className="px-2">
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Vetting Actions
        </h4>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
          Select an action to process this claim
        </p>
      </div>

      <div className="p-6 border border-gray-200 rounded-lg dark:border-gray-800 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-6">
        {/* Action Selection */}
        <div className="space-y-4">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Select Action
          </label>

          {/* Vetting Complete Option */}
          <div
            onClick={() => {
              setSelectedAction("vetting_complete");
              setRejectionReason("");
            }}
            className={`p-4 border-2 rounded-lg cursor-pointer transition ${
              selectedAction === "vetting_complete"
                ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="action"
                value="vetting_complete"
                checked={selectedAction === "vetting_complete"}
                onChange={() => {
                  setSelectedAction("vetting_complete");
                  setRejectionReason("");
                }}
                className="mt-1"
              />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Vetting Complete
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Move to pending review. Claim details will be marked as
                  partially approved.
                </p>
              </div>
            </div>
          </div>

          {/* Review Complete Option */}
          <div
            onClick={() => {
              setSelectedAction("review_complete");
              setRejectionReason("");
            }}
            className={`p-4 border-2 rounded-lg cursor-pointer transition ${
              selectedAction === "review_complete"
                ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="action"
                value="review_complete"
                checked={selectedAction === "review_complete"}
                onChange={() => {
                  setSelectedAction("review_complete");
                  setRejectionReason("");
                }}
                className="mt-1"
              />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Review Complete
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Move to awaiting payment. Claim details will be marked as
                  approved.
                </p>
              </div>
            </div>
          </div>

          {/* Reject Option */}
          <div
            onClick={() => {
              setSelectedAction("reject");
            }}
            className={`p-4 border-2 rounded-lg cursor-pointer transition ${
              selectedAction === "reject"
                ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="action"
                value="reject"
                checked={selectedAction === "reject"}
                onChange={() => setSelectedAction("reject")}
                className="mt-1"
              />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Reject Claim
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Reject both claim and details. Provide rejection reason.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notes textarea - shown for all actions except initial selection */}
        {selectedAction && (
          <>
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                Vetter Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your vetting notes here..."
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                rows={4}
              />
            </div>

            {/* Rejection Reason - only for reject action */}
            {selectedAction === "reject" && (
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  Rejection Reason
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide the reason for rejecting this claim..."
                  className="w-full p-3 border border-red-300 dark:border-red-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={4}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end mt-6 px-2">
        <button
          onClick={handleClose}
          disabled={loading}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!selectedAction || loading}
          className={`px-4 py-2 rounded-lg text-white font-medium transition ${
            selectedAction === "reject"
              ? "bg-red-600 hover:bg-red-700 disabled:bg-red-400"
              : "bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? "Processing..." : "Submit"}
        </button>
      </div>
    </Modal>
  );
};

export default VetClaimActionModal;
