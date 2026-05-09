"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import DatePicker from "@/components/form/date-picker";
import { Modal } from "@/components/ui/modal";
import { apiClient } from "@/lib/apiClient";
import React, { useState } from "react";

interface PaymentActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  claimId: string;
  onSuccess: () => void;
  onError: (message: string) => void;
}

type PaymentActionType = "fully_paid" | "partially_paid" | null;

const PaymentActionModal: React.FC<PaymentActionModalProps> = ({
  isOpen,
  onClose,
  claimId,
  onSuccess,
  onError,
}) => {
  const [selectedAction, setSelectedAction] = useState<PaymentActionType>(null);
  const [paidAmount, setPaidAmount] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<string>("");
  const [bankUsed, setBankUsed] = useState<string>("");
  const [batchId, setBatchId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedAction) {
      onError("Please select a payment action");
      return;
    }

    if (!paymentDate.trim()) {
      onError("Please select a payment date");
      return;
    }

    if (selectedAction === "partially_paid" && !paidAmount.trim()) {
      onError("Please enter the paid amount for partial payment");
      return;
    }

    setLoading(true);

    try {
      let endpoint = "";
      let payload: any = {};

      if (selectedAction === "fully_paid") {
        // Mark as paid endpoint
        endpoint = `/admin/claims/${claimId}/mark-paid`;
        payload = {
          datePaid: paymentDate,
          bankUsedForPayment: bankUsed || null,
          paymentBatchId: batchId || null,
        };
      } else if (selectedAction === "partially_paid") {
        // Mark as partially paid endpoint
        endpoint = `/admin/claims/${claimId}/mark-partially-paid`;
        payload = {
          amountPaid: parseFloat(paidAmount),
          datePaid: paymentDate,
          bankUsedForPayment: bankUsed || null,
          paymentBatchId: batchId || null,
        };
      }

      const response = await apiClient(endpoint, {
        method: "POST",
        body: payload,
      });

      if (response.success || response.data) {
        onSuccess();
      } else {
        onError(response.message || "Failed to process payment");
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedAction(null);
    setPaidAmount("");
    setPaymentDate("");
    setBankUsed("");
    setBatchId("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="max-w-[600px] p-5 lg:p-10 m-4"
    >
      <div className="px-2">
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Payment Actions
        </h4>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
          Process payment for this claim
        </p>
      </div>

      <div className="p-6 border border-gray-200 rounded-lg dark:border-gray-800 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-6">
        {/* Action Selection */}
        <div className="space-y-4">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Select Payment Action
          </label>

          {/* Fully Paid Option */}
          <div
            onClick={() => {
              setSelectedAction("fully_paid");
              setPaidAmount("");
            }}
            className={`p-4 border-2 rounded-lg cursor-pointer transition ${
              selectedAction === "fully_paid"
                ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="payment-action"
                value="fully_paid"
                checked={selectedAction === "fully_paid"}
                onChange={() => {
                  setSelectedAction("fully_paid");
                  setPaidAmount("");
                }}
                className="mt-1"
              />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Mark as Paid
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Record full payment for this claim.
                </p>
              </div>
            </div>
          </div>

          {/* Partially Paid Option */}
          <div
            onClick={() => setSelectedAction("partially_paid")}
            className={`p-4 border-2 rounded-lg cursor-pointer transition ${
              selectedAction === "partially_paid"
                ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="payment-action"
                value="partially_paid"
                checked={selectedAction === "partially_paid"}
                onChange={() => setSelectedAction("partially_paid")}
                className="mt-1"
              />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Mark as Partially Paid
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Record partial payment with specific amount.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Details - shown when action selected */}
        {selectedAction && (
          <>
            {/* Payment Date */}
            <DatePicker
              id="payment-date"
              label="Payment Date"
              placeholder="Select payment date"
              mode="single"
              defaultDate={paymentDate || undefined}
              onChange={(selectedDates) => {
                if (selectedDates.length > 0) {
                  const date = new Date(selectedDates[0]);
                  const formattedDate = date.toISOString().split("T")[0];
                  setPaymentDate(formattedDate);
                }
              }}
            />

            {/* Paid Amount - only for partially paid */}
            {selectedAction === "partially_paid" && (
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  Amount Paid
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  placeholder="Enter amount paid"
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Bank Used */}
            {/* <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                Bank Used (Optional)
              </label>
              <input
                type="text"
                value={bankUsed}
                onChange={(e) => setBankUsed(e.target.value)}
                placeholder="e.g., GTBank, First Bank"
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div> */}

            {/* Payment Batch ID */}
            {/* <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                Payment Batch ID (Optional)
              </label>
              <input
                type="text"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                placeholder="Enter batch ID if applicable"
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div> */}
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end mt-6 px-2">
        <button
          onClick={handleClose}
          disabled={loading}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!selectedAction || loading}
          className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "Submit Payment"}
        </button>
      </div>
    </Modal>
  );
};

export default PaymentActionModal;
