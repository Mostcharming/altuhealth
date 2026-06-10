"use client";

import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import {
  ClaimAuthorizationCode,
  createClaim,
  fetchApprovedAuthorizationCodes,
} from "@/lib/apis/claim";
import { formatDate, formatPrice } from "@/lib/formatDate";
import { useClaimStore } from "@/lib/store/claimStore";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function PageMetricsClaimsCreate() {
  const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const addClaim = useClaimStore((state) => state.addClaim);

  const errorModal = useModal();
  const successModal = useModal();

  // Form state
  const [authCodeQuery, setAuthCodeQuery] = useState("");
  const [selectedAuthorization, setSelectedAuthorization] =
    useState<ClaimAuthorizationCode | null>(null);
  const [notes, setNotes] = useState("");
  const [authorizationCodes, setAuthorizationCodes] = useState<
    ClaimAuthorizationCode[]
  >([]);
  const [errorMessage, setErrorMessage] = useState(
    "Failed to create claim. Please try again.",
  );

  const fetchAuthorizationCodes = useCallback(async (q: string) => {
    try {
      setLookupLoading(true);
      const data = await fetchApprovedAuthorizationCodes({ q, limit: 20 });
      const items: ClaimAuthorizationCode[] =
        data?.data?.authorizationCodes &&
        Array.isArray(data.data.authorizationCodes)
          ? data.data.authorizationCodes
          : Array.isArray(data)
            ? data
            : [];
      setAuthorizationCodes(items);
    } catch (err) {
      console.warn("Failed to fetch authorization codes", err);
    } finally {
      setLookupLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchAuthorizationCodes("");
    }
  }, [fetchAuthorizationCodes, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const timeout = window.setTimeout(() => {
      fetchAuthorizationCodes(authCodeQuery);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [authCodeQuery, fetchAuthorizationCodes, isOpen]);

  const approvedLineItems = useMemo(
    () =>
      selectedAuthorization?.renderedItems?.filter(
        (item) => item.status === "approved",
      ) || [],
    [selectedAuthorization],
  );

  const resetForm = () => {
    setAuthCodeQuery("");
    setSelectedAuthorization(null);
    setAuthorizationCodes([]);
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

  const selectAuthorization = (authorization: ClaimAuthorizationCode) => {
    setSelectedAuthorization(authorization);
    setAuthCodeQuery(authorization.authorizationCode);
  };

  const handleSubmit = async (saveAsDraft: boolean) => {
    try {
      if (!selectedAuthorization) {
        setErrorMessage("Auth code is required");
        errorModal.openModal();
        return;
      }

      setLoading(true);

      const data = await createClaim({
        authorizationCodeId: selectedAuthorization.id,
        notes: notes || undefined,
        saveAsDraft,
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
            Select an approved authorization code to create a provider bill.
          </p>
        </div>

        <form className="flex flex-col">
          <div className="custom-scrollbar max-h-[600px] overflow-y-auto px-2">
            {/* Auth Code and Notes */}
            <div className="grid grid-cols-1 gap-x-6 gap-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  Authorization Code *
                </label>
                <input
                  value={authCodeQuery}
                  onChange={(event) => {
                    setAuthCodeQuery(event.target.value);
                    setSelectedAuthorization(null);
                  }}
                  placeholder="Type authorization code"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:ring-brand-500/10 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                />
                <div className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                  {lookupLoading ? (
                    <div className="px-4 py-3 text-sm text-gray-500">
                      Searching...
                    </div>
                  ) : authorizationCodes.length > 0 ? (
                    authorizationCodes.map((authorization) => (
                      <button
                        type="button"
                        key={authorization.id}
                        onClick={() => selectAuthorization(authorization)}
                        className={`block w-full px-4 py-3 text-left text-sm transition hover:bg-gray-50 dark:hover:bg-white/[0.03] ${
                          selectedAuthorization?.id === authorization.id
                            ? "bg-brand-50 dark:bg-brand-500/10"
                            : ""
                        }`}
                      >
                        <span className="font-medium text-gray-800 dark:text-white/90">
                          {authorization.authorizationCode}
                        </span>
                        <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                          {authorization.memberName || "Member"}{" "}
                          {authorization.policyNumber
                            ? `(${authorization.policyNumber})`
                            : ""}
                          {" · "}
                          {authorization.Diagnosis?.name || "No diagnosis"}
                          {" · "}
                          {formatPrice(Number(authorization.amountAuthorized || 0))}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500">
                      No approved authorization codes found.
                    </div>
                  )}
                </div>
              </div>

              {selectedAuthorization && (
                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                  <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                    <div>
                      <span className="block text-gray-500 dark:text-gray-400">
                        Member
                      </span>
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        {selectedAuthorization.memberName || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-gray-500 dark:text-gray-400">
                        Validity
                      </span>
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        {formatDate(selectedAuthorization.validFrom)} -{" "}
                        {formatDate(selectedAuthorization.validTo)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-800">
                          <th className="py-2 font-medium text-gray-500">
                            Line Item
                          </th>
                          <th className="py-2 font-medium text-gray-500">
                            Qty
                          </th>
                          <th className="py-2 font-medium text-gray-500">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {approvedLineItems.map((item) => (
                          <tr
                            key={item.id}
                            className="border-b border-gray-100 dark:border-gray-800"
                          >
                            <td className="py-2 text-gray-700 dark:text-gray-300">
                              {item.itemName || "Authorized item"}
                            </td>
                            <td className="py-2 text-gray-700 dark:text-gray-300">
                              {item.quantityRendered || 1} {item.unit || ""}
                            </td>
                            <td className="py-2 text-gray-700 dark:text-gray-300">
                              {formatPrice(Number(item.lineAmount || 0))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

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
              disabled={loading || !selectedAuthorization}
              onClick={() => handleSubmit(true)}
              type="button"
              className="flex justify-center rounded-lg border border-brand-500 bg-white px-4 py-2.5 text-sm font-medium text-brand-500 hover:bg-brand-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-900"
            >
              {loading ? "Saving..." : "Save Draft"}
            </button>
            <button
              disabled={loading || !selectedAuthorization}
              onClick={() => handleSubmit(false)}
              type="button"
              className="flex justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Submit Bill"}
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
