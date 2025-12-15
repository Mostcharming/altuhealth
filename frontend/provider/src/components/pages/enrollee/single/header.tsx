/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import { useModal } from "@/hooks/useModal";
import { apiClient } from "@/lib/apiClient";
import capitalizeWords from "@/lib/capitalize";
import Image from "next/image";
import { useState } from "react";

export default function SinglePHeader({ data }: { data: any }) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const successModal = useModal();
  const errorModal = useModal();

  const getButtonClasses = (status: string) => {
    const baseClasses =
      "shadow-theme-xs inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white transition disabled:opacity-50";

    switch (status?.toLowerCase()) {
      case "active":
        return `${baseClasses} bg-error-500 hover:bg-error-600`;
      default:
        return `${baseClasses} bg-brand-500 hover:bg-brand-600`;
    }
  };

  const handleDownloadIdCard = async () => {
    try {
      setLoading(true);
      const response = await apiClient(
        `/admin/enrollees/${data?.id}/download-id-card`,
        {
          method: "GET",
          onLoading: (l: boolean) => setLoading(l),
        }
      );

      if (response?.data.idCardUrl) {
        // Fetch the image and download it as a blob
        const imageResponse = await fetch(response.data.idCardUrl);
        const blob = await imageResponse.blob();

        // Create a download link from the blob
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `${data?.firstName}-${data?.lastName}-id-card.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the blob URL
        window.URL.revokeObjectURL(blobUrl);
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to download ID card"
      );
      errorModal.openModal();
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      await apiClient(`/admin/enrollees/${data?.id}/resend-verification-code`, {
        method: "POST",
        body: { via: "email" },
        onLoading: (l: boolean) => setLoading(l),
      });
      successModal.openModal();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to send verification code"
      );
      errorModal.openModal();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col justify-between gap-6 rounded-2xl border border-gray-200 bg-white px-6 py-5 sm:flex-row sm:items-center dark:border-gray-800 dark:bg-white/3">
        <div className="flex flex-col gap-2.5 divide-gray-300 sm:flex-row sm:divide-x dark:divide-gray-700">
          <div className="flex items-center gap-2 sm:pr-3">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <Image
                width={80}
                height={80}
                src={data?.pictureUrl || "/images/user/owner.jpg"}
                alt="user"
              />
            </div>
            <span className="text-base font-medium text-gray-700 dark:text-gray-400">
              Name:{" "}
              {capitalizeWords(
                data?.firstName + data?.middleName + data?.lastName
              )}
            </span>
            {/* <span className={getStatusClasses(data?.status)}>
              {capitalizeWords(data?.status)}
            </span> */}
          </div>
          {/* <p className="text-sm text-gray-500 sm:pl-3 dark:text-gray-400">
            Created date: {formatDate(data?.createdAt)}
          </p> */}
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadIdCard}
            disabled={loading}
            className={getButtonClasses("not")}
          >
            {loading ? "Processing..." : "Download ID card"}
          </button>

          <button
            onClick={handleResendVerification}
            disabled={loading}
            className={getButtonClasses("not")}
          >
            {loading ? "Processing..." : "Send Verification"}
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
