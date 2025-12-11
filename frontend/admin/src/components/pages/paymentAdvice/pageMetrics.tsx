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
import { usePaymentAdviceStore } from "@/lib/store/paymentAdviceStore";
import { ChangeEvent, useCallback, useEffect, useState } from "react";

interface Provider {
  id: string;
  name: string;
  code?: string;
  email: string;
  phoneNumber: string;
}

const paymentMethods = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "check", label: "Check" },
  { value: "eft", label: "EFT" },
  { value: "other", label: "Other" },
];

export default function PageMetricsPaymentAdvice({
  buttonText,
}: {
  buttonText?: string;
}) {
  const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("");

  const errorModal = useModal();
  const successModal = useModal();

  // stores
  const addPaymentAdvice = usePaymentAdviceStore((s) => s.addPaymentAdvice);

  // form state
  const [numberOfClaims, setNumberOfClaims] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "bank_transfer" | "check" | "eft" | "other"
  >("bank_transfer");
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState("");
  const [sortCode, setSortCode] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState(
    "Failed to create payment advice. Please try again."
  );

  const fetchProviders = useCallback(async () => {
    try {
      setProvidersLoading(true);
      const data = await apiClient("/admin/providers/list?limit=all", {
        method: "GET",
      });

      const items: Provider[] =
        data?.data?.list && Array.isArray(data.data.list)
          ? data.data.list
          : Array.isArray(data)
          ? data
          : [];

      setProviders(items);
    } catch (err) {
      console.warn("Providers fetch failed", err);
      setErrorMessage("Failed to load providers");
      setProvidersLoading(false);
    } finally {
      setProvidersLoading(false);
    }
  }, []);

  // Fetch providers on modal open
  useEffect(() => {
    if (isOpen) {
      fetchProviders();
    }
  }, [isOpen, fetchProviders]);

  const resetForm = () => {
    setSelectedProvider("");
    setNumberOfClaims("");
    setTotalAmount("");
    setPaymentDate("");
    setDueDate("");
    setPaymentMethod("bank_transfer");
    setBankName("");
    setBankAccountNumber("");
    setAccountName("");
    setAccountType("");
    setSortCode("");
    setRoutingNumber("");
    setDescription("");
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
      if (!selectedProvider) {
        setErrorMessage("Please select a provider.");
        errorModal.openModal();
        return;
      }

      if (!paymentDate) {
        setErrorMessage("Payment date is required.");
        errorModal.openModal();
        return;
      }

      if (!totalAmount) {
        setErrorMessage("Total amount is required.");
        errorModal.openModal();
        return;
      }

      setLoading(true);

      const payload = {
        providerId: selectedProvider,
        numberOfClaims: numberOfClaims ? Number(numberOfClaims) : 0,
        totalAmount: Number(totalAmount),
        paymentDate,
        dueDate: dueDate || null,
        paymentMethod,
        bankName: bankName.trim() || null,
        bankAccountNumber: bankAccountNumber.trim() || null,
        accountName: accountName.trim() || null,
        accountType: accountType.trim() || null,
        sortCode: sortCode.trim() || null,
        routingNumber: routingNumber.trim() || null,
        description: description.trim() || null,
        notes: notes.trim() || null,
      };

      const data = await apiClient("/admin/payment-advices", {
        method: "POST",
        body: payload,
        onLoading: (l: boolean) => setLoading(l),
      });

      // if backend returns created payment advice object, add it to store
      if (data?.data?.paymentAdvice) {
        addPaymentAdvice(data.data.paymentAdvice);
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
            Payment Advice
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Fill in the details below to create a new payment advice.
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
              {/* Provider */}
              <div>
                <Label>Provider*</Label>
                {providersLoading ? (
                  <div className="text-sm text-gray-500">
                    Loading providers...
                  </div>
                ) : (
                  <Select
                    options={providers.map((p) => ({
                      value: p.id,
                      label: `${p.name} (${p.code})`,
                    }))}
                    placeholder="Select provider"
                    onChange={(value: string) => setSelectedProvider(value)}
                  />
                )}
              </div>

              {/* Total Amount */}
              <div>
                <Label>Total Amount*</Label>
                <Input
                  type="number"
                  step={0.01}
                  placeholder="Enter total amount"
                  value={totalAmount}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setTotalAmount(e.target.value)
                  }
                />
              </div>

              {/* Payment Date */}
              <div>
                <DatePicker
                  id="payment-date"
                  label="Payment Date*"
                  placeholder="Select payment date"
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

              {/* Due Date */}
              <div>
                <DatePicker
                  id="due-date"
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

              {/* Number of Claims */}
              <div>
                <Label>Number of Claims</Label>
                <Input
                  type="number"
                  placeholder="Enter number of claims"
                  value={numberOfClaims}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setNumberOfClaims(e.target.value)
                  }
                />
              </div>

              {/* Payment Method */}
              <div>
                <Label>Payment Method</Label>
                <Select
                  options={paymentMethods}
                  placeholder="Select payment method"
                  onChange={(value: string) =>
                    setPaymentMethod(
                      value as "bank_transfer" | "check" | "eft" | "other"
                    )
                  }
                  defaultValue={paymentMethod}
                />
              </div>

              {/* Bank Details - Conditional */}
              {paymentMethod === "bank_transfer" && (
                <>
                  <div>
                    <Label>Bank Name</Label>
                    <Input
                      type="text"
                      placeholder="Enter bank name"
                      value={bankName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setBankName(e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label>Account Name</Label>
                    <Input
                      type="text"
                      placeholder="Enter account name"
                      value={accountName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setAccountName(e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label>Bank Account Number</Label>
                    <Input
                      type="text"
                      placeholder="Enter account number"
                      value={bankAccountNumber}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setBankAccountNumber(e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label>Account Type</Label>
                    <Input
                      type="text"
                      placeholder="e.g., Checking, Savings"
                      value={accountType}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setAccountType(e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label>Sort Code</Label>
                    <Input
                      type="text"
                      placeholder="Enter sort code"
                      value={sortCode}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setSortCode(e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label>Routing Number</Label>
                    <Input
                      type="text"
                      placeholder="Enter routing number"
                      value={routingNumber}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setRoutingNumber(e.target.value)
                      }
                    />
                  </div>
                </>
              )}

              {/* Description - Full Width */}
              <div className="col-span-1 lg:col-span-2">
                <Label>Description</Label>
                <TextArea
                  placeholder="Enter payment advice description"
                  value={description}
                  onChange={(value: string) => setDescription(value)}
                  rows={3}
                />
              </div>

              {/* Notes - Full Width */}
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
                {loading ? "Creating..." : "Create Payment Advice"}
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
