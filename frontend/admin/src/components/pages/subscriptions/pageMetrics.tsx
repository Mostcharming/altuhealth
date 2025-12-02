"use client";

import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { apiClient } from "@/lib/apiClient";
import { useSubscriptionStore } from "@/lib/store/subscriptionStore";
import { ChangeEvent, useState } from "react";

export default function PageMetricsSubscriptions({
  buttonText,
}: {
  buttonText?: string;
}) {
  const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);

  const errorModal = useModal();
  const successModal = useModal();

  // stores
  const addSubscription = useSubscriptionStore((s) => s.addSubscription);

  // form state
  const [companyId, setCompanyId] = useState("");
  const [mode, setMode] = useState<
    "parent_only" | "parent_and_subsidiaries" | ""
  >("");
  const [subsidiaryId, setSubsidiaryId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState(
    "Failed to save subscription. Please try again."
  );

  const resetForm = () => {
    setCompanyId("");
    setMode("");
    setSubsidiaryId("");
    setStartDate("");
    setEndDate("");
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

  const handlesubmit = async () => {
    try {
      // simple client-side validation
      if (!companyId) {
        setErrorMessage("Company is required.");
        errorModal.openModal();
        return;
      }

      if (!mode) {
        setErrorMessage("Mode is required.");
        errorModal.openModal();
        return;
      }

      if (!startDate) {
        setErrorMessage("Start date is required.");
        errorModal.openModal();
        return;
      }

      if (!endDate) {
        setErrorMessage("End date is required.");
        errorModal.openModal();
        return;
      }

      setLoading(true);

      const payload: {
        companyId: string;
        mode: string;
        subsidiaryId?: string;
        startDate: string;
        endDate: string;
        notes?: string;
      } = {
        companyId: companyId.trim(),
        mode: mode,
        subsidiaryId: subsidiaryId || undefined,
        startDate: startDate,
        endDate: endDate,
        notes: notes.trim() || undefined,
      };

      const data = await apiClient("/admin/subscriptions", {
        method: "POST",
        body: payload,
        onLoading: (l: boolean) => setLoading(l),
      });

      // if backend returns created subscription id or object, you can handle it here
      if (data?.data?.subscription) {
        addSubscription({
          id: data.data.subscription.id,
          code: data.data.subscription.code,
          companyId: companyId,
          mode: mode as "parent_only" | "parent_and_subsidiaries",
          subsidiaryId: subsidiaryId || null,
          startDate: startDate,
          endDate: endDate,
          notes: notes || null,
          status: data.data.subscription.status || "active",
          createdAt: data.data.subscription.createdAt,
        });
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
      <div className=" flex items-center justify-between">
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
            Add a new Subscription
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Fill in the details below to create a new subscription.
          </p>
        </div>

        <form
          className="flex flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            handlesubmit();
          }}
        >
          <div className="custom-scrollbar h-[350px] sm:h-[450px] overflow-y-auto px-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div className="col-span-2 lg:col-span-1">
                <Label>Company</Label>
                <Input
                  type="text"
                  value={companyId}
                  placeholder="Enter company ID..."
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setCompanyId(e.target.value)
                  }
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Mode</Label>
                <Select
                  options={[
                    { value: "parent_only", label: "Parent Only" },
                    {
                      value: "parent_and_subsidiaries",
                      label: "Parent and Subsidiaries",
                    },
                  ]}
                  placeholder="Select mode"
                  onChange={(value) =>
                    setMode(
                      value as "parent_only" | "parent_and_subsidiaries" | ""
                    )
                  }
                  defaultValue={mode}
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Subsidiary ID (Optional)</Label>
                <Input
                  type="text"
                  value={subsidiaryId}
                  placeholder="Enter subsidiary ID..."
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setSubsidiaryId(e.target.value)
                  }
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setStartDate(e.target.value)
                  }
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setEndDate(e.target.value)
                  }
                />
              </div>

              <div className="col-span-2">
                <Label>Notes</Label>
                <TextArea
                  placeholder="Enter notes..."
                  rows={4}
                  value={notes}
                  onChange={(value) => setNotes(value)}
                />
              </div>

              <div className="col-span-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded bg-brand-500 text-white"
                >
                  {loading ? "Creating..." : "Create Subscription"}
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

      <ErrorModal
        message={errorMessage}
        errorModal={errorModal}
        handleErrorClose={handleErrorClose}
      />
    </div>
  );
}
