"use client";

import CreateDependentForm from "@/components/dependents/CreateDependentForm";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";

export default function PageMetricsDependents({
  buttonText = "Add Dependent",
  onDependentCreated,
}: {
  buttonText?: string;
  onDependentCreated?: () => void | Promise<void>;
}) {
  const { isOpen, openModal, closeModal } = useModal();
  const errorModal = useModal();
  const successModal = useModal();

  const handleSuccessClose = () => {
    successModal.closeModal();
    closeModal();
    // Trigger table refresh if callback is provided
    if (onDependentCreated) {
      onDependentCreated();
    }
  };

  const handleErrorClose = () => {
    errorModal.closeModal();
  };

  const handleFormSuccess = () => {
    successModal.openModal();
  };

  return (
    <div className="p-4 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <div></div>
        <div>
          <button
            onClick={openModal}
            className="cursor-pointer bg-brand-500 shadow-theme-xs hover:bg-brand-600 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            {buttonText}
          </button>
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[600px] p-5 lg:p-10 m-4"
      >
        <div className="px-2">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Add Dependent
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Add a new dependent to your insurance plan
          </p>
        </div>

        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
          <CreateDependentForm onSuccess={handleFormSuccess} />
        </div>
      </Modal>

      <SuccessModal
        successModal={successModal}
        handleSuccessClose={handleSuccessClose}
      />

      <ErrorModal
        errorModal={errorModal}
        handleErrorClose={handleErrorClose}
        message="Failed to add dependent"
      />
    </div>
  );
}
