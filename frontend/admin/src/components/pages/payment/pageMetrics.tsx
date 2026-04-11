/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import DatePicker from "@/components/form/date-picker";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { fetchInvoices } from "@/lib/apis/invoice";
import { createPayment } from "@/lib/apis/payment";
import { Invoice, useInvoiceStore } from "@/lib/store/invoiceStore";
import { usePaymentStore } from "@/lib/store/paymentStore";
import { useCallback, useEffect, useMemo, useState } from "react";

interface PaymentMetricsProps {
  buttonText?: string;
}

export default function PaymentMetrics({
  buttonText = "Record New Payment",
}: PaymentMetricsProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);

  const errorModal = useModal();
  const successModal = useModal();

  // stores
  const addPayment = usePaymentStore((s) => s.addPayment);
  const invoices = useInvoiceStore((s) => s.invoices);
  const setInvoices = useInvoiceStore((s) => s.setInvoices);

  // form state
  const [invoiceId, setInvoiceId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<
    "bank_transfer" | "cash" | "cheque" | "card" | "gateway"
  >("cash");
  const [transactionReference, setTransactionReference] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [chequeNumber, setChequeNumber] = useState("");
  const [chequeDate, setChequeDate] = useState("");
  const [description, setDescription] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<
    "verified" | "unverified"
  >("unverified");

  const [errorMessage, setErrorMessage] = useState(
    "Failed to record payment. Please try again."
  );

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Fetch invoices on component mount
  const fetchPayableInvoices = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetchInvoices({
        limit: 100,
        page: 1,
        paymentStatus: "unpaid", // Only show unpaid invoices
      });

      const items: Invoice[] =
        response?.data?.invoices && Array.isArray(response.data.invoices)
          ? response.data.invoices
          : response?.data?.list && Array.isArray(response.data.list)
          ? response.data.list
          : Array.isArray(response?.data)
          ? response.data
          : [];

      setInvoices(items);
    } catch (err) {
      console.warn("Invoices fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [setInvoices]);

  useEffect(() => {
    fetchPayableInvoices();
  }, [fetchPayableInvoices]);

  const resetForm = () => {
    setInvoiceId("");
    setPaymentAmount("");
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setPaymentMethod("bank_transfer");
    setTransactionReference("");
    setBankName("");
    setAccountName("");
    setChequeNumber("");
    setChequeDate("");
    setDescription("");
    setVerificationStatus("unverified");
    setSelectedInvoice(null);
  };

  const handleSuccessClose = () => {
    successModal.closeModal();
    resetForm();
    closeModal();
  };

  const handleErrorClose = () => {
    errorModal.closeModal();
  };

  const handleInvoiceChange = (selectedValue: string) => {
    setInvoiceId(selectedValue);
    const selected = invoices.find((inv) => inv.id === selectedValue) || null;
    setSelectedInvoice(selected);
    if (selected) {
      setPaymentAmount(String(selected.balanceAmount || selected.totalAmount));
    }
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (!invoiceId) {
        setErrorMessage("Invoice is required.");
        errorModal.openModal();
        return;
      }
      if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
        setErrorMessage("Payment amount must be greater than 0.");
        errorModal.openModal();
        return;
      }
      if (!paymentDate) {
        setErrorMessage("Payment date is required.");
        errorModal.openModal();
        return;
      }
      if (!paymentMethod) {
        setErrorMessage("Payment method is required.");
        errorModal.openModal();
        return;
      }

      // Additional validation for specific payment methods
      if (paymentMethod === "bank_transfer" && !transactionReference) {
        setErrorMessage(
          "Transaction reference is required for bank transfers."
        );
        errorModal.openModal();
        return;
      }

      if (paymentMethod === "cheque" && !chequeNumber) {
        setErrorMessage("Cheque number is required for cheque payments.");
        errorModal.openModal();
        return;
      }

      setLoading(true);

      const payload: any = {
        invoiceId,
        paymentAmount: parseFloat(paymentAmount),
        paymentDate,
        paymentMethod,
        currency: selectedInvoice?.currency || "NGN",
        verificationStatus,
      };

      if (transactionReference)
        payload.transactionReference = transactionReference;
      if (bankName) payload.bankName = bankName;
      if (accountName) payload.accountName = accountName;
      if (chequeNumber) payload.chequeNumber = chequeNumber;
      if (chequeDate) payload.chequeDate = chequeDate;
      if (description) payload.description = description;

      const response = await createPayment(payload);

      if (response?.data?.payment) {
        addPayment(response.data.payment);

        // Update invoice in store if it was updated
        if (response?.data?.invoice) {
          const updatedInvoices = invoices.map((inv) =>
            inv.id === response.data.invoice.id ? response.data.invoice : inv
          );
          setInvoices(updatedInvoices);
        }
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

  const paymentMethodOptions = useMemo(
    () => [
      { value: "bank_transfer", label: "Bank Transfer" },
      { value: "cash", label: "Cash" },
      { value: "cheque", label: "Cheque" },
      { value: "card", label: "Card" },
      { value: "gateway", label: "Payment Gateway" },
    ],
    []
  );

  const verificationOptions = useMemo(
    () => [
      { value: "verified", label: "Verified" },
      { value: "unverified", label: "Unverified" },
    ],
    []
  );

  const invoiceOptions = useMemo(
    () => [
      { value: "", label: "Select an invoice..." },
      ...invoices.map((inv) => ({
        value: inv.id,
        label: `${inv.invoiceNumber} - ${inv.customerName} (Balance: ${
          inv.balanceAmount || 0
        })`,
      })),
    ],
    [invoices]
  );

  return (
    <div className="p-4 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <div></div>
        <div>
          <Button
            onClick={openModal}
            className="bg-brand-500 shadow-theme-xs hover:bg-brand-600 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white transition"
          >
            {buttonText}
          </Button>
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[800px] p-5 lg:p-10 m-4"
      >
        <div className="px-2 mb-6">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Record New Payment
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Record a payment for an invoice
          </p>
        </div>

        <form
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {/* Invoice Selection */}
          <div>
            <Label>Invoice *</Label>
            <Select
              options={invoiceOptions}
              placeholder="Select an invoice"
              onChange={handleInvoiceChange}
              defaultValue={invoiceId}
            />
          </div>

          {/* Invoice Details Display */}
          {selectedInvoice && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Invoice Number
                  </p>
                  <p className="font-semibold text-gray-800 dark:text-white">
                    {selectedInvoice.invoiceNumber}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Customer</p>
                  <p className="font-semibold text-gray-800 dark:text-white">
                    {selectedInvoice.customerName}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Total Amount
                  </p>
                  <p className="font-semibold text-gray-800 dark:text-white">
                    {selectedInvoice.currency || "NGN"}{" "}
                    {selectedInvoice.totalAmount}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Balance</p>
                  <p className="font-semibold text-orange-600 dark:text-orange-400">
                    {selectedInvoice.currency || "NGN"}{" "}
                    {selectedInvoice.balanceAmount}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Amount */}
          <div>
            <Label>Payment Amount *</Label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />
          </div>

          {/* Payment Date */}
          <div>
            <Label>Payment Date *</Label>
            <DatePicker
              id="payment-date"
              placeholder="Select date"
              defaultDate={paymentDate}
              onChange={(selectedDates) => {
                if (selectedDates && selectedDates.length > 0) {
                  const date = selectedDates[0];
                  const formattedDate = date.toISOString().split("T")[0];
                  setPaymentDate(formattedDate);
                }
              }}
            />
          </div>

          {/* Payment Method */}
          <div>
            <Label>Payment Method *</Label>
            <Select
              options={paymentMethodOptions}
              placeholder="Select method"
              onChange={(val) => setPaymentMethod(val as any)}
              defaultValue={paymentMethod}
            />
          </div>

          {/* Conditional Fields Based on Payment Method */}
          {paymentMethod === "bank_transfer" && (
            <>
              <div>
                <Label>Transaction Reference *</Label>
                <Input
                  placeholder="Bank transaction reference"
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                />
              </div>
              <div>
                <Label>Bank Name</Label>
                <Input
                  placeholder="Bank name"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                />
              </div>
              <div>
                <Label>Account Name</Label>
                <Input
                  placeholder="Account name"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                />
              </div>
            </>
          )}

          {paymentMethod === "cheque" && (
            <>
              <div>
                <Label>Cheque Number *</Label>
                <Input
                  placeholder="Cheque number"
                  value={chequeNumber}
                  onChange={(e) => setChequeNumber(e.target.value)}
                />
              </div>
              <div>
                <Label>Cheque Date</Label>
                <DatePicker
                  id="cheque-date"
                  placeholder="Select cheque date"
                  defaultDate={chequeDate}
                  onChange={(selectedDates) => {
                    if (selectedDates && selectedDates.length > 0) {
                      const date = selectedDates[0];
                      const formattedDate = date.toISOString().split("T")[0];
                      setChequeDate(formattedDate);
                    }
                  }}
                />
              </div>
            </>
          )}

          {/* Description */}
          <div>
            <Label>Description/Notes</Label>
            <textarea
              placeholder="Additional notes about this payment"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              rows={3}
            />
          </div>

          {/* Verification Status */}
          <div>
            <Label>Verification Status</Label>
            <Select
              options={verificationOptions}
              placeholder="Select status"
              onChange={(val) => setVerificationStatus(val as any)}
              defaultValue={verificationStatus}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-brand-500 hover:bg-brand-600 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
          >
            {loading ? "Recording..." : "Record Payment"}
          </button>
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
