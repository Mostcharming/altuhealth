/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import ErrorModal from "@/components/modals/error";
import IdCardModal from "@/components/modals/idCardModal";
import SuccessModal from "@/components/modals/success";
import { useModal } from "@/hooks/useModal";
import { apiClient } from "@/lib/apiClient";
import Image from "next/image";
import { useState } from "react";

export default function RetailEnrolleeDependentPHeader({
  data,
}: {
  data: any;
}) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showIdCard, setShowIdCard] = useState(false);
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

  const handleViewIdCard = async () => {
    try {
      setLoading(true);
      const response = await apiClient(
        `/admin/retail-enrollee-dependents/${data?.id}/download-id-card`,
        {
          method: "GET",
          onLoading: (l: boolean) => setLoading(l),
        }
      );

      if (response?.data.idCardUrl) {
        setShowIdCard(true);
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to fetch ID card"
      );
      errorModal.openModal();
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      await apiClient(
        `/admin/retail-enrollee-dependents/${data?.id}/resend-verification-code`,
        {
          method: "POST",
          body: { via: "email" },
          onLoading: (l: boolean) => setLoading(l),
        }
      );
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
                src={data?.pictureUrl || "/images/main/small.svg"}
                alt="dependent"
              />
            </div>
            <span className="text-base font-medium text-gray-700 dark:text-gray-400">
              Name:
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleViewIdCard}
            disabled={loading}
            className={getButtonClasses("not")}
          >
            View ID Card
          </button>

          <button
            onClick={handleResendVerification}
            disabled={loading}
            className={getButtonClasses("not")}
          >
            Resend Verification
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

      <IdCardModal
        isOpen={showIdCard}
        onClose={() => setShowIdCard(false)}
        idCardData={{
          policyNumber: data?.policyNumber || "N/A",
          firstName: data?.firstName || "",
          lastName: data?.lastName || "",
          gender: data?.gender || "M",
          pictureUrl: data?.pictureUrl,
          plan: data?.RetailEnrollee?.name || "",
        }}
      />
    </>
  );
}
