/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { apiClient } from "@/lib/apiClient";
import { Exclusion, useExclusionStore } from "@/lib/store/exclusionStore";
import { useEffect, useState } from "react";

interface EditUnitProps {
  isOpen: boolean;
  closeModal: () => void;
  unit?: Exclusion | null;
}

export default function EditUnit({ isOpen, closeModal, unit }: EditUnitProps) {
  const [loading, setLoading] = useState(false);
  const errorModal = useModal();
  const successModal = useModal();
  const [id, setId] = useState<string>("");
  const [description, setDescription] = useState("");

  const updateUser = useExclusionStore((s) => s.updateExclusion);

  const handleSuccessClose = () => {
    successModal.closeModal();
    closeModal();
  };

  const handleErrorClose = () => {
    errorModal.closeModal();
    closeModal();
  };

  // When the modal opens with a role, populate the form with its data.
  useEffect(() => {
    if (isOpen && unit) {
      setId(unit.id ?? "");

      setDescription(unit.description ?? "");
    }

    if (!isOpen) {
      setId("");

      setDescription("");
    }
  }, [isOpen, unit]);

  const handlesubmit = async () => {
    try {
      setLoading(true);

      const payload: {
        description: string;
      } = {
        description: description.trim(),
      };

      const url = `/admin/exclusions/${id}`;
      const method = "PUT";

      await apiClient(url, {
        method,
        body: payload,
        onLoading: (l: boolean) => setLoading(l),
      });

      updateUser(id, {
        description: description,
      });

      successModal.openModal();
    } catch (err) {
      console.warn("Save role failed", err);
      errorModal.openModal();
    } finally {
      setLoading(false);
    }
  };
  const handleMessageChange = (value: string) => {
    setDescription(value);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[900px] p-5 lg:p-10 m-4"
      >
        <div className="px-2">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edit Exclusion
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Update the exclusion details.
          </p>
        </div>

        <form className="flex flex-col">
          <div className="custom-scrollbar h-auto sm:h-auto overflow-y-auto px-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div className="col-span-2 ">
                <Label>Description</Label>
                <TextArea
                  placeholder="Type the description here..."
                  rows={6}
                  value={description}
                  onChange={handleMessageChange}
                />
              </div>
            </div>

            <div className="flex flex-col items-center gap-6 px-2 mt-6 sm:flex-row sm:justify-between">
              <div className="flex flex-col items-center gap-3 sm:flex-row">
                <div className="flex -space-x-2"></div>
              </div>

              <div className="flex items-center w-full gap-3 sm:w-auto">
                <button
                  onClick={closeModal}
                  type="button"
                  className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  disabled={loading}
                  onClick={handlesubmit}
                  type="button"
                  className="flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                >
                  Update Exclusion
                </button>
              </div>
            </div>
          </div>
        </form>
      </Modal>
      <SuccessModal
        successModal={successModal}
        handleSuccessClose={handleSuccessClose}
      />

      <ErrorModal errorModal={errorModal} handleErrorClose={handleErrorClose} />
    </>
  );
}
