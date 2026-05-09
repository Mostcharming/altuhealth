"use client";

import DatePicker from "@/components/form/date-picker";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import MultiSelect from "@/components/form/MultiSelect";
import Select from "@/components/form/Select";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { apiClient } from "@/lib/apiClient";
import { fetchCompanies } from "@/lib/apis/company";
import { fetchCompanyPlans } from "@/lib/apis/companyPlan";
import { fetchCompanySubsidiaries } from "@/lib/apis/companySubsidiary";
import {
  Subscription,
  useSubscriptionStore,
} from "@/lib/store/subscriptionStore";
import { useEffect, useState } from "react";

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

  // dropdown data
  const [companies, setCompanies] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [subsidiaries, setSubsidiaries] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [plans, setPlans] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);

  const updateSubscription = useSubscriptionStore((s) => s.updateSubscription);

  // Fetch companies on modal open
  useEffect(() => {
    if (isOpen) {
      const fetchCompaniesData = async () => {
        try {
          const data = await fetchCompanies({ limit: 100 });
          const companiesList = data?.data?.list || [];
          setCompanies(
            companiesList.map((c: { id: string; name: string }) => ({
              id: c.id,
              name: c.name,
            }))
          );
        } catch (err) {
          console.error("Failed to fetch companies", err);
        }
      };
      fetchCompaniesData();
    }
  }, [isOpen]);

  // Fetch subsidiaries when company changes
  useEffect(() => {
    if (companyId && isOpen) {
      const fetchSubsidiariesData = async () => {
        try {
          const data = await fetchCompanySubsidiaries({
            companyId,
            limit: 100,
          });
          const subsidiariesList = data?.data?.list || [];
          setSubsidiaries(
            subsidiariesList.map((s: { id: string; name: string }) => ({
              id: s.id,
              name: s.name,
            }))
          );
        } catch (err) {
          console.error("Failed to fetch subsidiaries", err);
        }
      };
      fetchSubsidiariesData();
    } else {
      setSubsidiaries([]);
    }
  }, [companyId, isOpen]);

  // Fetch plans when company changes
  useEffect(() => {
    if (companyId && isOpen) {
      const fetchPlansData = async () => {
        try {
          const data = await fetchCompanyPlans({
            companyId,
            limit: 100,
            isActive: true,
          });
          const plansList = data?.data?.list || [];
          setPlans(
            plansList.map((p: { id: string; name: string }) => ({
              id: p.id,
              name: p.name,
            }))
          );
        } catch (err) {
          console.error("Failed to fetch plans", err);
        }
      };
      fetchPlansData();
    } else {
      setPlans([]);
      setSelectedPlans([]);
    }
  }, [companyId, isOpen]);

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
      setSelectedPlans(subscription.companyPlans?.map((p) => p.id) ?? []);
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
      setSelectedPlans([]);
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
        planIds?: string[];
      } = {
        mode: mode || undefined,
        subsidiaryId: subsidiaryId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        notes: notes.trim() || undefined,
        status: status || undefined,
        planIds: selectedPlans.length > 0 ? selectedPlans : undefined,
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
        companyPlans: plans
          .filter((p) => selectedPlans.includes(p.id))
          .map((p) => ({
            id: p.id,
            name: p.name,
            planCycle: "",
            annualPremiumPrice: 0,
          })),
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
          <div className="custom-scrollbar h-auto sm:h-auto overflow-y-auto px-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div className="col-span-2 lg:col-span-1">
                <Label>Company</Label>
                <Select
                  options={companies.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                  placeholder="Select company"
                  onChange={(value) => {
                    setCompanyId(value as string);
                    setSubsidiaryId("");
                  }}
                  defaultValue={companyId}
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
                <Label>Subsidiary (Optional)</Label>
                <Select
                  options={subsidiaries.map((s) => ({
                    value: s.id,
                    label: s.name,
                  }))}
                  placeholder="Select subsidiary"
                  onChange={(value) => setSubsidiaryId(value as string)}
                  defaultValue={subsidiaryId}
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <DatePicker
                  id="edit-start-date-picker"
                  label="Start Date"
                  placeholder="Select start date"
                  defaultDate={startDate}
                  onChange={(dates, currentDateString) => {
                    setStartDate(currentDateString);
                  }}
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <DatePicker
                  id="edit-end-date-picker"
                  label="End Date"
                  placeholder="Select end date"
                  defaultDate={endDate}
                  onChange={(dates, currentDateString) => {
                    setEndDate(currentDateString);
                  }}
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

              <div className="col-span-2">
                <MultiSelect
                  label="Company Plans"
                  options={plans.map((p) => ({
                    value: p.id,
                    text: p.name,
                    selected: selectedPlans.includes(p.id),
                  }))}
                  defaultSelected={selectedPlans}
                  onChange={(selected) => setSelectedPlans(selected.slice(-1))}
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
