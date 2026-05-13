/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Select from "@/components/form/Select";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { apiClient } from "@/lib/apiClient";
import { useClaimStore } from "@/lib/store/claimStore";
import { useEffect, useState } from "react";

interface Enrollee {
  id: string;
  firstName: string;
  lastName: string;
  policyNumber: string;
}

export default function PageMetricsClaimsCreate() {
  const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const addClaim = useClaimStore((state) => state.addClaim);

  const errorModal = useModal();
  const successModal = useModal();

  // Form state
  const [authCode, setAuthCode] = useState("");
  const [notes, setNotes] = useState("");

  // Fetch data
  const [enrollees, setEnrollees] = useState<Enrollee[]>([]);
  const [errorMessage, setErrorMessage] = useState(
    "Failed to create claim. Please try again.",
  );

  useEffect(() => {
    if (isOpen) {
      fetchEnrollees();
    }
  }, [isOpen]);

  const fetchEnrollees = async () => {
    try {
      const data = await apiClient("/admin/enrollees?limit=all", {
        method: "GET",
      });
      const items: Enrollee[] =
        data?.data?.enrollees && Array.isArray(data.data.enrollees)
          ? data.data.enrollees
          : Array.isArray(data)
            ? data
            : [];
      setEnrollees(items);
    } catch (err) {
      console.warn("Failed to fetch enrollees", err);
    }
  };

  const resetForm = () => {
    setAuthCode("");
    setNotes("");
  };

  const handleErrorClose = () => {
    errorModal.closeModal();
  };

  const handleSuccessClose = () => {
    successModal.closeModal();
    resetForm();
    closeModal();
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (!authCode) {
        setErrorMessage("Auth code is required");
        errorModal.openModal();
        return;
      }

      setLoading(true);

      // Get provider ID from localStorage or context
      const providerId = localStorage.getItem("providerId");
      if (!providerId) {
        setErrorMessage("Provider ID not found. Please login again.");
        errorModal.openModal();
        return;
      }

      const payload = {
        providerId,
        authorizationCode: authCode,
        notes: notes || undefined,
      };

      const data = await apiClient("/admin/claims/with-details", {
        method: "POST",
        body: payload,
        onLoading: (l: boolean) => setLoading(l),
      });

      if (data?.data?.claim) {
        addClaim(data.data.claim);
        successModal.openModal();
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
      errorModal.openModal();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <div></div>
        <div>
          <div
            onClick={openModal}
            className="cursor-pointer bg-brand-500 shadow-theme-xs hover:bg-brand-600 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M5 10.0002H15.0006M10.0002 5V15.0006"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Create Claim
          </div>
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-4xl p-5 lg:p-10 m-4"
      >
        <div className="px-2">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Create Claim
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Fill in the claim details and add service encounters below.
          </p>
        </div>

        <form className="flex flex-col">
          <div className="custom-scrollbar max-h-[600px] overflow-y-auto px-2">
            {/* Auth Code and Notes */}
            <div className="grid grid-cols-1 gap-x-6 gap-y-5">
              {/* Select Auth Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  Select Auth Code *
                </label>
                <Select
                  options={enrollees.map((e) => ({
                    value: "",
                    label: `${e.firstName} ${e.lastName} (${e.policyNumber})`,
                  }))}
                  placeholder="Select auth code"
                  onChange={(value) => setAuthCode(value as string)}
                  defaultValue={authCode || ""}
                />
              </div>

              {/* Notes Text Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter notes..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:ring-brand-500/10 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-3 justify-end mt-6 px-2 border-t border-gray-200 dark:border-gray-700 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              Cancel
            </button>
            <button
              disabled={loading || !authCode}
              onClick={handleSubmit}
              type="button"
              className="flex justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Claim"}
            </button>
          </div>
        </form>
      </Modal>

      <SuccessModal
        successModal={successModal}
        handleSuccessClose={handleSuccessClose}
      />

      <ErrorModal
        message={errorMessage}
        errorModal={errorModal}
        handleErrorClose={handleErrorClose}
      />
    </div>
  );
}
