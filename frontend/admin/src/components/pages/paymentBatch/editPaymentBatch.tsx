"use client";

import DatePicker from "@/components/form/date-picker";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { apiClient } from "@/lib/apiClient";
import {
  PaymentBatch,
  usePaymentBatchStore,
} from "@/lib/store/paymentBatchStore";
import { ChangeEvent, useEffect, useState } from "react";

interface EditPaymentBatchProps {
  isOpen: boolean;
  closeModal: () => void;
  batch: PaymentBatch | null;
}

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "partial", label: "Partial" },
  { value: "failed", label: "Failed" },
];

const EditPaymentBatch: React.FC<EditPaymentBatchProps> = ({
  isOpen,
  closeModal,
  batch,
}) => {
  const [loading, setLoading] = useState(false);
  const errorModal = useModal();
  const successModal = useModal();
  const updatePaymentBatch = usePaymentBatchStore((s) => s.updatePaymentBatch);

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [numberOfBatches, setNumberOfBatches] = useState("");
  const [numberOfProviders, setNumberOfProviders] = useState("");
  const [conflictCount, setConflictCount] = useState("");
  const [totalClaimsAmount, setTotalClaimsAmount] = useState("");
  const [reconciliationAmount, setReconciliationAmount] = useState("");
  const [status, setStatus] = useState<PaymentBatch["status"]>("pending");
  const [isPaid, setIsPaid] = useState(false);
  const [numberPaid, setNumberPaid] = useState("");
  const [numberUnpaid, setNumberUnpaid] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [unpaidAmount, setUnpaidAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState(
    "Failed to update payment batch. Please try again."
  );

  // populate form when batch changes
  useEffect(() => {
    if (batch) {
      setTitle(batch.title || "");
      setDescription(batch.description || "");
      setNumberOfBatches(String(batch.numberOfBatches || 0));
      setNumberOfProviders(String(batch.numberOfProviders || 0));
      setConflictCount(String(batch.conflictCount || 0));
      setTotalClaimsAmount(String(batch.totalClaimsAmount || 0));
      setReconciliationAmount(String(batch.reconciliationAmount || 0));
      setStatus(batch.status || "pending");
      setIsPaid(batch.isPaid || false);
      setNumberPaid(String(batch.numberPaid || 0));
      setNumberUnpaid(String(batch.numberUnpaid || 0));
      setPaidAmount(String(batch.paidAmount || 0));
      setUnpaidAmount(String(batch.unpaidAmount || 0));
      setDueDate(batch.dueDate ? batch.dueDate.split("T")[0] : "");
      setNotes(batch.notes || "");
    }
  }, [batch, isOpen]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setNumberOfBatches("");
    setNumberOfProviders("");
    setConflictCount("");
    setTotalClaimsAmount("");
    setReconciliationAmount("");
    setStatus("pending");
    setIsPaid(false);
    setNumberPaid("");
    setNumberUnpaid("");
    setPaidAmount("");
    setUnpaidAmount("");
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
  };

  const handleSubmit = async () => {
    if (!batch) return;

    try {
      // simple client-side validation
      if (!title) {
        setErrorMessage("Payment batch title is required.");
        errorModal.openModal();
        return;
      }

      setLoading(true);

      const payload: Partial<PaymentBatch> = {
        title: title.trim(),
        description: description.trim() || null,
        numberOfBatches: numberOfBatches ? Number(numberOfBatches) : 0,
        numberOfProviders: numberOfProviders ? Number(numberOfProviders) : 0,
        conflictCount: conflictCount ? Number(conflictCount) : 0,
        totalClaimsAmount: totalClaimsAmount ? Number(totalClaimsAmount) : 0,
        reconciliationAmount: reconciliationAmount
          ? Number(reconciliationAmount)
          : 0,
        status,
        isPaid,
        numberPaid: numberPaid ? Number(numberPaid) : 0,
        numberUnpaid: numberUnpaid ? Number(numberUnpaid) : 0,
        paidAmount: paidAmount ? Number(paidAmount) : 0,
        unpaidAmount: unpaidAmount ? Number(unpaidAmount) : 0,
        dueDate: dueDate || null,
        notes: notes.trim() || null,
      };

      const data = await apiClient(`/admin/payment-batches/${batch.id}`, {
        method: "PUT",
        body: payload,
        onLoading: (l: boolean) => setLoading(l),
      });

      if (data?.data?.paymentBatch) {
        updatePaymentBatch(batch.id, data.data.paymentBatch);
      } else {
        updatePaymentBatch(batch.id, payload);
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
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      className="max-w-[900px] p-5 lg:p-10 m-4"
    >
      <div className="px-2">
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Edit Payment Batch
        </h4>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
          Update the payment batch details below.
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

            {/* Status */}
            <div>
              <Label>Status</Label>
              <Select
                options={statusOptions}
                placeholder="Select status"
                onChange={(value: string) =>
                  setStatus(value as PaymentBatch["status"])
                }
                defaultValue={status}
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

            {/* Is Paid */}
            <div>
              <Label>Paid</Label>
              <Select
                options={[
                  { value: "true", label: "Yes" },
                  { value: "false", label: "No" },
                ]}
                placeholder="Select if paid"
                onChange={(value: string) => setIsPaid(value === "true")}
                defaultValue={isPaid ? "true" : "false"}
              />
            </div>

            {/* Number Paid */}
            <div>
              <Label>Number Paid</Label>
              <Input
                type="number"
                placeholder="Enter number paid"
                value={numberPaid}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNumberPaid(e.target.value)
                }
              />
            </div>

            {/* Number Unpaid */}
            <div>
              <Label>Number Unpaid</Label>
              <Input
                type="number"
                placeholder="Enter number unpaid"
                value={numberUnpaid}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNumberUnpaid(e.target.value)
                }
              />
            </div>

            {/* Paid Amount */}
            <div>
              <Label>Paid Amount</Label>
              <Input
                type="number"
                placeholder="Enter paid amount"
                value={paidAmount}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPaidAmount(e.target.value)
                }
              />
            </div>

            {/* Unpaid Amount */}
            <div>
              <Label>Unpaid Amount</Label>
              <Input
                type="number"
                placeholder="Enter unpaid amount"
                value={unpaidAmount}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setUnpaidAmount(e.target.value)
                }
              />
            </div>

            {/* Due Date */}
            <div>
              <DatePicker
                id="due-date-edit"
                label="Due Date"
                placeholder="Select due date"
                defaultDate={dueDate}
                onChange={(selectedDates) => {
                  if (selectedDates && selectedDates.length > 0) {
                    const date = selectedDates[0];
                    const formattedDate = date.toISOString().split("T")[0];
                    setDueDate(formattedDate);
                  }
                }}
              />
            </div>

            {/* Description - Full Width */}
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
              {loading ? "Updating..." : "Update Payment Batch"}
            </button>
          </div>
        </div>
      </form>

      <SuccessModal
        successModal={successModal}
        handleSuccessClose={handleSuccessClose}
      />

      <ErrorModal
        message={errorMessage}
        errorModal={errorModal}
        handleErrorClose={handleErrorClose}
      />
    </Modal>
  );
};

export default EditPaymentBatch;
