"use client";

import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { apiClient } from "@/lib/apiClient";
import { usePaymentBatchStore } from "@/lib/store/paymentBatchStore";
import { ChangeEvent, useState } from "react";

export default function PageMetricsPaymentBatch({
  buttonText,
}: {
  buttonText?: string;
}) {
  const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);

  const errorModal = useModal();
  const successModal = useModal();

  // stores
  const addPaymentBatch = usePaymentBatchStore((s) => s.addPaymentBatch);

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [numberOfBatches, setNumberOfBatches] = useState("");
  const [numberOfProviders, setNumberOfProviders] = useState("");
  const [conflictCount, setConflictCount] = useState("");
  const [totalClaimsAmount, setTotalClaimsAmount] = useState("");
  const [reconciliationAmount, setReconciliationAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState(
    "Failed to create payment batch. Please try again."
  );

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setNumberOfBatches("");
    setNumberOfProviders("");
    setConflictCount("");
    setTotalClaimsAmount("");
    setReconciliationAmount("");
    setDueDate("");
    setNotes("");
  };

  const handleSuccessClose = () => {
    successModal.closeModal();
    resetForm();
    closeModal();
  };

  const handleErrorClose = () => {
    errorModal.closeModal();
    resetForm();
    closeModal();
  };

  const handleSubmit = async () => {
    try {
      // simple client-side validation
      if (!title) {
        setErrorMessage("Payment batch title is required.");
        errorModal.openModal();
        return;
      }

      setLoading(true);

      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        numberOfBatches: numberOfBatches ? Number(numberOfBatches) : 0,
        numberOfProviders: numberOfProviders ? Number(numberOfProviders) : 0,
        conflictCount: conflictCount ? Number(conflictCount) : 0,
        totalClaimsAmount: totalClaimsAmount ? Number(totalClaimsAmount) : 0,
        reconciliationAmount: reconciliationAmount
          ? Number(reconciliationAmount)
          : 0,
        dueDate: dueDate || null,
        notes: notes.trim() || null,
      };

      const data = await apiClient("/admin/payment-batches", {
        method: "POST",
        body: payload,
        onLoading: (l: boolean) => setLoading(l),
      });

      // if backend returns created payment batch object, add it to store
      if (data?.data?.paymentBatch) {
        addPaymentBatch(data.data.paymentBatch);
      }

      successModal.openModal();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
      errorModal.openModal();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <div></div>
        <div>
          <div
            onClick={openModal}
            className="cursor-pointer bg-brand-500 shadow-theme-xs hover:bg-brand-600 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M5 10.0002H15.0006M10.0002 5V15.0006"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {buttonText}
          </div>
        </div>
      </div>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[900px] p-5 lg:p-10 m-4"
      >
        <div className="px-2">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Add a new payment batch
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Fill in the details below to create a new payment batch.
          </p>
        </div>

        <form
          className="flex flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="custom-scrollbar h-auto sm:max-h-[70vh] overflow-y-auto px-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              {/* Title */}
              <div>
                <Label>Payment Batch Title*</Label>
                <Input
                  type="text"
                  placeholder="Enter payment batch title"
                  value={title}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setTitle(e.target.value)
                  }
                />
              </div>

              {/* Number of Batches */}
              <div>
                <Label>Number of Batches</Label>
                <Input
                  type="number"
                  placeholder="Enter number of batches"
                  value={numberOfBatches}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setNumberOfBatches(e.target.value)
                  }
                />
              </div>

              {/* Number of Providers */}
              <div>
                <Label>Number of Providers</Label>
                <Input
                  type="number"
                  placeholder="Enter number of providers"
                  value={numberOfProviders}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setNumberOfProviders(e.target.value)
                  }
                />
              </div>

              {/* Conflict Count */}
              <div>
                <Label>Conflict Count</Label>
                <Input
                  type="number"
                  placeholder="Enter conflict count"
                  value={conflictCount}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setConflictCount(e.target.value)
                  }
                />
              </div>

              {/* Total Claims Amount */}
              <div>
                <Label>Total Claims Amount</Label>
                <Input
                  type="number"
                  placeholder="Enter total claims amount"
                  value={totalClaimsAmount}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setTotalClaimsAmount(e.target.value)
                  }
                />
              </div>

              {/* Reconciliation Amount */}
              <div>
                <Label>Reconciliation Amount</Label>
                <Input
                  type="number"
                  placeholder="Enter reconciliation amount"
                  value={reconciliationAmount}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setReconciliationAmount(e.target.value)
                  }
                />
              </div>

              {/* Due Date */}
              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setDueDate(e.target.value)
                  }
                />
              </div>

              {/* Notes - Full Width */}
              <div className="col-span-1 lg:col-span-2">
                <Label>Description</Label>
                <TextArea
                  placeholder="Enter payment batch description"
                  value={description}
                  onChange={(value: string) => setDescription(value)}
                  rows={3}
                />
              </div>

              {/* Additional Notes */}
              <div className="col-span-1 lg:col-span-2">
                <Label>Notes</Label>
                <TextArea
                  placeholder="Enter additional notes"
                  value={notes}
                  onChange={(value: string) => setNotes(value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="col-span-2 flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Payment Batch"}
              </button>
            </div>
          </div>
        </form>
      </Modal>
      <SuccessModal
        successModal={successModal}
        handleSuccessClose={handleSuccessClose}
      />

      <ErrorModal
        message={errorMessage}
        errorModal={errorModal}
        handleErrorClose={handleErrorClose}
      />
    </div>
  );
}
