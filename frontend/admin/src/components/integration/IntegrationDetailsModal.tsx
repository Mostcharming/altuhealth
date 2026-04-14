"use client";

import { useModal } from "@/hooks/useModal";
import { Integration } from "@/lib/apis/integration";
import { Modal } from "../ui/modal";

interface IntegrationDetailsModalProps {
  integrationName?: string;
  integrationData?: Integration | null;
  isLoading?: boolean;
}

export default function IntegrationDetailsModal({
  integrationName = "Integration",
  integrationData,
  isLoading = false,
}: IntegrationDetailsModalProps) {
  const detailsModal = useModal();

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return "Not configured";
    }
    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const detailsToDisplay = [
    { label: "Integration ID", key: "id" },
    { label: "Name", key: "name" },
    { label: "Description", key: "description" },
    {
      label: "Status",
      key: "is_active",
      format: (val: unknown) => (val ? "Active" : "Inactive"),
    },
    { label: "Base URL", key: "base_url" },
    { label: "Public Key", key: "public_key" },
    { label: "Secret Key", key: "secret_key" },
    { label: "API Key", key: "api_key" },
    { label: "API Secret", key: "api_secret" },
    { label: "Webhook URL", key: "webhook_url" },
    { label: "Webhook Secret", key: "webhook_secret" },
    {
      label: "Created At",
      key: "created_at",
      format: (val: unknown) => new Date(val as string).toLocaleString(),
    },
    {
      label: "Updated At",
      key: "updated_at",
      format: (val: unknown) => new Date(val as string).toLocaleString(),
    },
  ];

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
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-600"></div>
            </div>
          ) : (
            <ul className="max-h-96 overflow-y-auto">
              {detailsToDisplay.map((detail, index) => {
                const value = integrationData
                  ? integrationData[detail.key as keyof Integration]
                  : null;
                const displayValue = detail.format
                  ? detail.format(value)
                  : formatValue(value);
                return (
                  <li
                    key={index}
                    className="flex flex-col sm:flex-row sm:justify-between border-b border-gray-100 py-2.5 dark:border-gray-800 gap-2"
                  >
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {detail.label}
                    </span>
                    <span className="text-sm break-words text-gray-700 dark:text-gray-300 font-mono">
                      {displayValue}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Modal>
    </>
  );
}
