"use client";

import { Modal } from "../ui/modal";

import Button from "../ui/button/Button";
import Notification from "../ui/notification/Notification";

type ConfirmModalProps = {
  confirmModal: { isOpen: boolean };
  handleSave: () => void;
  closeModal: () => void;
  toast?: {
    variant: "success" | "error" | "info" | "warning";
    title: string;
    description?: string;
  } | null;
};

export default function ConfirmModal({
  confirmModal,
  handleSave,
  closeModal,
  toast,
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={confirmModal.isOpen}
      onClose={closeModal}
      showCloseButton={false}
      className="max-w-[507px] p-6 lg:p-10"
    >
      <div className="text-center">
        {toast && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in">
            <Notification
              variant={toast.variant}
              title={toast.title}
              description={toast.description}
            />
          </div>
        )}
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-title-sm">
          Confirm Changes
        </h4>
        <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
          Are you sure you want to save changes?
        </p>

        <div className="flex items-center justify-center w-full gap-3 mt-8">
          <Button size="sm" variant="outline" onClick={closeModal}>
            Close
          </Button>
          <Button size="sm" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
