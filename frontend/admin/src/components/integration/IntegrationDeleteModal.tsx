"use client";

import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";

interface IntegrationDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  integrationName?: string;
  onConfirm?: () => void;
}

export default function IntegrationDeleteModal({
  isOpen,
  onClose,
  integrationName = "Integration",
  onConfirm,
}: IntegrationDeleteModalProps) {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="relative w-full max-w-[400px] m-5 sm:m-0 rounded-3xl bg-white p-6 lg:p-10 dark:bg-gray-900"
    >
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
            <svg
              className="h-6 w-6 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
        </div>
        <h4 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
          Remove {integrationName}
        </h4>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Are you sure you want to remove this integration? This action cannot
          be undone.
        </p>
        <div className="flex gap-3">
          <Button onClick={onClose} className="flex-1" variant="outline">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
          >
            Remove
          </Button>
        </div>
      </div>
    </Modal>
  );
}
