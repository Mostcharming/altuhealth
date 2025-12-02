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
import {
  Subscription,
  useSubscriptionStore,
} from "@/lib/store/subscriptionStore";
import { ChangeEvent, useEffect, useState } from "react";

interface EditSubscriptionProps {
  isOpen: boolean;
  closeModal: () => void;
  subscription?: Subscription | null;
}

export default function EditSubscription({
  isOpen,
  closeModal,
  subscription,
}: EditSubscriptionProps) {
  const [loading, setLoading] = useState(false);
  const errorModal = useModal();
  const successModal = useModal();
  const [id, setId] = useState<string>("");
  const [companyId, setCompanyId] = useState("");
  const [mode, setMode] = useState<
    "parent_only" | "parent_and_subsidiaries" | ""
  >("");
  const [subsidiaryId, setSubsidiaryId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<
    "active" | "suspended" | "inactive" | "expired" | ""
  >("");
  const [errorMessage, setErrorMessage] = useState(
    "Failed to save subscription. Please try again."
  );

  const updateSubscription = useSubscriptionStore((s) => s.updateSubscription);

  const handleSuccessClose = () => {
    successModal.closeModal();
    closeModal();
  };

  const handleErrorClose = () => {
    errorModal.closeModal();
    closeModal();
  };

  // When the modal opens with a subscription, populate the form with its data.
  useEffect(() => {
    if (isOpen && subscription) {
      setId(subscription.id ?? "");
      setCompanyId(subscription.companyId ?? "");
      setMode(subscription.mode ?? "");
      setSubsidiaryId(subscription.subsidiaryId ?? "");
      setStartDate(subscription.startDate ?? "");
      setEndDate(subscription.endDate ?? "");
      setNotes(subscription.notes ?? "");
      setStatus(subscription.status ?? "");
    }

    if (!isOpen) {
      setId("");
      setCompanyId("");
      setMode("");
      setSubsidiaryId("");
      setStartDate("");
      setEndDate("");
      setNotes("");
      setStatus("");
    }
  }, [isOpen, subscription]);

  const handlesubmit = async () => {
    try {
      setLoading(true);

      const payload: {
        mode?: string;
        subsidiaryId?: string;
        startDate?: string;
        endDate?: string;
        notes?: string;
        status?: string;
      } = {
        mode: mode || undefined,
        subsidiaryId: subsidiaryId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        notes: notes.trim() || undefined,
        status: status || undefined,
      };

      const url = `/admin/subscriptions/${id}`;
      const method = "PUT";

      await apiClient(url, {
        method,
        body: payload,
        onLoading: (l: boolean) => setLoading(l),
      });

      updateSubscription(id, {
        companyId: companyId,
        mode: mode as "parent_only" | "parent_and_subsidiaries",
        subsidiaryId: subsidiaryId || null,
        startDate: startDate,
        endDate: endDate,
        notes: notes || null,
        status: status as "active" | "suspended" | "inactive" | "expired",
      });

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
    <>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[900px] p-5 lg:p-10 m-4"
      >
        <div className="px-2">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edit Subscription
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Update the subscription details.
          </p>
        </div>

        <form className="flex flex-col">
          <div className="custom-scrollbar h-[350px] sm:h-[450px] overflow-y-auto px-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div className="col-span-2 lg:col-span-1">
                <Label>Company ID</Label>
                <Input
                  type="text"
                  value={companyId}
                  disabled
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
                <Label>Status</Label>
                <Select
                  options={[
                    { value: "active", label: "Active" },
                    { value: "suspended", label: "Suspended" },
                    { value: "inactive", label: "Inactive" },
                    { value: "expired", label: "Expired" },
                  ]}
                  placeholder="Select status"
                  onChange={(value) =>
                    setStatus(
                      value as
                        | "active"
                        | "suspended"
                        | "inactive"
                        | "expired"
                        | ""
                    )
                  }
                  defaultValue={status}
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Subsidiary ID</Label>
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
                  Update Subscription
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
    </>
  );
}
