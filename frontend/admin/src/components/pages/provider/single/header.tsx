/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import { useModal } from "@/hooks/useModal";
import { apiClient } from "@/lib/apiClient";
import capitalizeWords from "@/lib/capitalize";
import { formatDate } from "@/lib/formatDate";
import { useState } from "react";

export default function SinglePHeader({
  data,
  setdata,
}: {
  data: any;
  setdata: any;
}) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const successModal = useModal();
  const errorModal = useModal();

  const getStatusClasses = (status: string) => {
    const baseClasses =
      "inline-flex items-center justify-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-medium";

    switch (status?.toLowerCase()) {
      case "active":
        return `${baseClasses} bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500`;
      case "suspended":
        return `${baseClasses} bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500`;
      default:
        return `${baseClasses} bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500`;
    }
  };

  const getButtonClasses = (status: string) => {
    const baseClasses =
      "shadow-theme-xs inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white transition disabled:opacity-50";

    switch (status?.toLowerCase()) {
      case "active":
        return `${baseClasses} bg-error-500 hover:bg-error-600`;
      default:
        return `${baseClasses} bg-success-500 hover:bg-success-600`;
    }
  };

  const handleStatusToggle = async () => {
    try {
      setLoading(true);
      const newStatus =
        data?.status?.toLowerCase() === "active" ? "suspended" : "active";

      await apiClient(`/admin/providers/${data?.id}`, {
        method: "PUT",
        body: { status: newStatus },
        onLoading: (l: boolean) => setLoading(l),
      });

      setdata({ ...data, status: newStatus });
      successModal.openModal();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
      errorModal.openModal();
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    const status = data?.status?.toLowerCase();
    return status === "active" ? "Suspend" : "Activate";
  };

  return (
    <>
      <div className="flex flex-col justify-between gap-6 rounded-2xl border border-gray-200 bg-white px-6 py-5 sm:flex-row sm:items-center dark:border-gray-800 dark:bg-white/3">
        <div className="flex flex-col gap-2.5 divide-gray-300 sm:flex-row sm:divide-x dark:divide-gray-700">
          <div className="flex items-center gap-2 sm:pr-3">
            <span className="text-base font-medium text-gray-700 dark:text-gray-400">
              Name: {capitalizeWords(data?.name)}
            </span>
            <span className={getStatusClasses(data?.status)}>
              {capitalizeWords(data?.status)}
            </span>
          </div>
          <p className="text-sm text-gray-500 sm:pl-3 dark:text-gray-400">
            Created date: {formatDate(data?.createdAt)}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleStatusToggle}
            disabled={loading}
            className={getButtonClasses(data?.status)}
          >
            {loading ? "Processing..." : getButtonText()}
          </button>
        </div>
      </div>

      <SuccessModal
        successModal={successModal}
        handleSuccessClose={() => {
          successModal.closeModal();
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
}
