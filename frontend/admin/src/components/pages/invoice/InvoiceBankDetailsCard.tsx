"use client";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import {
  getInvoiceBankDetails,
  updateInvoiceBankDetails,
} from "@/lib/apis/invoice";
import { InvoiceBankDetails } from "@/lib/store/invoiceStore";
import { useEffect, useState } from "react";

const EMPTY_BANK_DETAILS: InvoiceBankDetails = {
  bankName: "",
  accountName: "",
  accountNumber: "",
  sortCode: "",
  swiftCode: "",
  paymentInstructions: "",
};

export default function InvoiceBankDetailsCard() {
  const [bankDetails, setBankDetails] = useState<InvoiceBankDetails>(
    EMPTY_BANK_DETAILS
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadBankDetails = async () => {
      try {
        const response = await getInvoiceBankDetails();
        if (cancelled) return;

        setBankDetails({
          ...EMPTY_BANK_DETAILS,
          ...(response?.data?.bankDetails || {}),
        });
        setIsConfigured(Boolean(response?.data?.isConfigured));
      } catch (error) {
        if (cancelled) return;
        const err = error instanceof Error ? error : new Error(String(error));
        setMessage({
          type: "error",
          text: err.message || "Unable to load invoice bank details.",
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadBankDetails();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateField = (field: keyof InvoiceBankDetails, value: string) => {
    setBankDetails((current) => ({ ...current, [field]: value }));
    setMessage(null);
  };

  const handleSave = async () => {
    const requiredValues = [
      bankDetails.bankName,
      bankDetails.accountName,
      bankDetails.accountNumber,
    ];

    if (requiredValues.some((value) => !value.trim())) {
      setMessage({
        type: "error",
        text: "Bank name, account name, and account number are required.",
      });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);
      const response = await updateInvoiceBankDetails(bankDetails);
      setBankDetails({
        ...EMPTY_BANK_DETAILS,
        ...(response?.data?.bankDetails || bankDetails),
      });
      setIsConfigured(Boolean(response?.data?.isConfigured));
      setMessage({
        type: "success",
        text: "Bank details saved. New invoices can now be generated.",
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setMessage({
        type: "error",
        text: err.message || "Unable to save invoice bank details.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mb-6 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Invoice Payment Bank Details
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            These details are saved on each new invoice and shown when it is
            viewed or printed.
          </p>
        </div>
        <span
          className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
            isConfigured
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
          }`}
        >
          {isConfigured ? "Configured" : "Required"}
        </span>
      </div>

      {loading ? (
        <div className="flex min-h-48 items-center justify-center">
          <SpinnerThree />
        </div>
      ) : (
        <div className="p-5">
          {!isConfigured && (
            <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/10 dark:text-amber-300">
              Complete the required fields before generating any new invoice.
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label htmlFor="invoice-bank-name">Bank Name *</Label>
              <Input
                id="invoice-bank-name"
                placeholder="Enter bank name"
                value={bankDetails.bankName}
                onChange={(event) => updateField("bankName", event.target.value)}
                disabled={saving}
              />
            </div>
            <div>
              <Label htmlFor="invoice-account-name">Account Name *</Label>
              <Input
                id="invoice-account-name"
                placeholder="Enter account name"
                value={bankDetails.accountName}
                onChange={(event) =>
                  updateField("accountName", event.target.value)
                }
                disabled={saving}
              />
            </div>
            <div>
              <Label htmlFor="invoice-account-number">Account Number *</Label>
              <Input
                id="invoice-account-number"
                placeholder="Enter account number"
                value={bankDetails.accountNumber}
                onChange={(event) =>
                  updateField("accountNumber", event.target.value)
                }
                disabled={saving}
              />
            </div>
            <div>
              <Label htmlFor="invoice-sort-code">Sort Code (Optional)</Label>
              <Input
                id="invoice-sort-code"
                placeholder="Enter sort code"
                value={bankDetails.sortCode}
                onChange={(event) => updateField("sortCode", event.target.value)}
                disabled={saving}
              />
            </div>
            <div>
              <Label htmlFor="invoice-swift-code">SWIFT Code (Optional)</Label>
              <Input
                id="invoice-swift-code"
                placeholder="Enter SWIFT code"
                value={bankDetails.swiftCode}
                onChange={(event) =>
                  updateField("swiftCode", event.target.value)
                }
                disabled={saving}
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <Label htmlFor="invoice-payment-instructions">
                Payment Instructions (Optional)
              </Label>
              <textarea
                id="invoice-payment-instructions"
                placeholder="For example: Include the invoice number as the transfer reference."
                value={bankDetails.paymentInstructions}
                onChange={(event) =>
                  updateField("paymentInstructions", event.target.value)
                }
                disabled={saving}
                rows={3}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div aria-live="polite">
              {message && (
                <p
                  className={`text-sm ${
                    message.type === "success"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {message.text}
                </p>
              )}
            </div>
            <Button onClick={handleSave} loading={saving}>
              Save Bank Details
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
