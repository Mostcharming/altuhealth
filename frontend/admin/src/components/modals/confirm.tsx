"use client";

import { Modal } from "../ui/modal";

import Button from "../ui/button/Button";

type ConfirmModalProps = {
  confirmModal: { isOpen: boolean };
  handleSave: () => void;
  closeModal: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
};

export default function ConfirmModal({
  confirmModal,
  handleSave,
  closeModal,
  title = "Confirm Changes",
  message = "Are you sure you want to save changes?",
  confirmLabel = "Save Changes",
  cancelLabel = "Close",
  destructive = false,
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={confirmModal.isOpen}
      onClose={closeModal}
      showCloseButton={false}
      className="max-w-[507px] p-6 lg:p-10"
    >
      <div className="text-center">
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-title-sm">
          {title}
        </h4>
        <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
          {message}
        </p>

        <div className="flex items-center justify-center w-full gap-3 mt-8">
          <Button
            size="sm"
            variant="outline"
            onClick={closeModal}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          {destructive ? (
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg bg-error-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-error-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Deleting..." : confirmLabel}
            </button>
          ) : (
            <Button size="sm" onClick={handleSave} loading={loading}>
              {confirmLabel}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
