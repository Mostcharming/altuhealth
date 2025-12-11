"use client";

import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import { useModal } from "@/hooks/useModal";

export default function PageMetricsClaims() {
  const errorModal = useModal();
  const successModal = useModal();

  const handleErrorClose = () => {
    errorModal.closeModal();
  };

  const handleSuccessClose = () => {
    successModal.closeModal();
  };

  return (
    <div className="p-4 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <div>
          {/* <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage all claims in the system
          </p> */}
        </div>
      </div>

      <SuccessModal
        successModal={successModal}
        handleSuccessClose={handleSuccessClose}
      />

      <ErrorModal
        message="An error occurred"
        errorModal={errorModal}
        handleErrorClose={handleErrorClose}
      />
    </div>
  );
}
