"use client";

import { useModal } from "@/hooks/useModal";
import { Modal } from "../ui/modal";

interface IntegrationDetailsModalProps {
  integrationName?: string;
  details?: {
    label: string;
    value: string;
  }[];
}

export default function IntegrationDetailsModal({
  integrationName = "Integration",
  details = [
    {
      label: "App Name",
      value: "Example App",
    },
    {
      label: "Client ID",
      value: "872364219810-abc123xyz456.apps.usercontent.com",
    },
    {
      label: "Client Secret",
      value: "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e",
    },
    {
      label: "Authentication base URI",
      value: "https://accounts.app.com/o/oauth2/auth",
    },
  ],
}: IntegrationDetailsModalProps) {
  const detailsModal = useModal();

  return (
    <>
      <button
        onClick={detailsModal.openModal}
        className="shadow-theme-xs inline-flex h-11 items-center justify-center rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 dark:border-gray-700 dark:text-gray-400"
      >
        Details
      </button>

      <Modal
        isOpen={detailsModal.isOpen}
        onClose={detailsModal.closeModal}
        className="relative w-full max-w-[558px] m-5 sm:m-0 rounded-3xl bg-white p-6 overflow-hidden lg:p-10 dark:bg-gray-900"
      >
        <div>
          <h4 className="text-title-xs mb-1 font-semibold text-gray-800 dark:text-white/90">
            {integrationName} details
          </h4>
          <p className="mb-7 text-sm leading-6 text-gray-500 dark:text-gray-400">
            Check the credentials and settings for your connected app.
          </p>
          <ul>
            {details.map((detail, index) => (
              <li
                key={index}
                className="flex justify-between border-b border-gray-100 py-2.5 dark:border-gray-800"
              >
                <span className="w-1/2 text-sm text-gray-500 dark:text-gray-400">
                  {detail.label}
                </span>
                <span className="w-1/2 break-words text-gray-700 dark:text-gray-400">
                  {detail.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Modal>
    </>
  );
}
