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
  useUtilizationReviewStore,
  UtilizationReview,
} from "@/lib/store/utilizationReviewStore";
import { ChangeEvent, useEffect, useState } from "react";

interface EditReviewProps {
  isOpen: boolean;
  closeModal: () => void;
  review?: UtilizationReview | null;
}

export default function EditReview({
  isOpen,
  closeModal,
  review,
}: EditReviewProps) {
  const [loading, setLoading] = useState(false);
  const errorModal = useModal();
  const successModal = useModal();

  const [id, setId] = useState<string>("");
  const [policyPeriodStartDate, setPolicyPeriodStartDate] = useState("");
  const [policyPeriodEndDate, setPolicyPeriodEndDate] = useState("");
  const [quarter, setQuarter] = useState("");
  const [totalEnrollees, setTotalEnrollees] = useState("");
  const [totalDependents, setTotalDependents] = useState("");
  const [totalClaimAmount, setTotalClaimAmount] = useState("");
  const [utilizationRate, setUtilizationRate] = useState("");
  const [topUtilizedServices, setTopUtilizedServices] = useState("");
  const [topProviders, setTopProviders] = useState("");
  const [excludedServiceAttempts, setExcludedServiceAttempts] = useState("");
  const [errorMessage, setErrorMessage] = useState(
    "Failed to save utilization review. Please try again."
  );

  const updateReview = useUtilizationReviewStore((s) => s.updateReview);

  const handleSuccessClose = () => {
    successModal.closeModal();
    closeModal();
  };

  const handleErrorClose = () => {
    errorModal.closeModal();
    closeModal();
  };

  useEffect(() => {
    if (isOpen && review) {
      setId(review.id ?? "");
      setPolicyPeriodStartDate(review.policyPeriodStartDate ?? "");
      setPolicyPeriodEndDate(review.policyPeriodEndDate ?? "");
      setQuarter(review.quarter ?? "");
      setTotalEnrollees(String(review.totalEnrollees ?? ""));
      setTotalDependents(String(review.totalDependents ?? ""));
      setTotalClaimAmount(String(review.totalClaimAmount ?? ""));
      setUtilizationRate(String(review.utilizationRate ?? ""));
      setTopUtilizedServices(
        Array.isArray(review.topUtilizedServices)
          ? review.topUtilizedServices.join(", ")
          : ""
      );
      setTopProviders(
        Array.isArray(review.topProviders) ? review.topProviders.join(", ") : ""
      );
      setExcludedServiceAttempts(String(review.excludedServiceAttempts ?? ""));
    }

    if (!isOpen) {
      setId("");
      setPolicyPeriodStartDate("");
      setPolicyPeriodEndDate("");
      setQuarter("");
      setTotalEnrollees("");
      setTotalDependents("");
      setTotalClaimAmount("");
      setUtilizationRate("");
      setTopUtilizedServices("");
      setTopProviders("");
      setExcludedServiceAttempts("");
    }
  }, [isOpen, review]);

  const handlesubmit = async () => {
    try {
      if (!policyPeriodStartDate) {
        setErrorMessage("Policy Period Start Date is required.");
        errorModal.openModal();
        return;
      }
      if (!policyPeriodEndDate) {
        setErrorMessage("Policy Period End Date is required.");
        errorModal.openModal();
        return;
      }
      if (!quarter) {
        setErrorMessage("Quarter is required.");
        errorModal.openModal();
        return;
      }

      setLoading(true);

      const payload: {
        policyPeriodStartDate: string;
        policyPeriodEndDate: string;
        quarter: string;
        totalEnrollees?: number;
        totalDependents?: number;
        totalClaimAmount?: number;
        utilizationRate?: number;
        topUtilizedServices?: string[];
        topProviders?: string[];
        excludedServiceAttempts?: number;
      } = {
        policyPeriodStartDate,
        policyPeriodEndDate,
        quarter,
        totalEnrollees: totalEnrollees ? Number(totalEnrollees) : undefined,
        totalDependents: totalDependents ? Number(totalDependents) : undefined,
        totalClaimAmount: totalClaimAmount
          ? Number(totalClaimAmount)
          : undefined,
        utilizationRate: utilizationRate ? Number(utilizationRate) : undefined,
        topUtilizedServices: topUtilizedServices
          ? topUtilizedServices.split(",").map((s) => s.trim())
          : undefined,
        topProviders: topProviders
          ? topProviders.split(",").map((p) => p.trim())
          : undefined,
        excludedServiceAttempts: excludedServiceAttempts
          ? Number(excludedServiceAttempts)
          : undefined,
      };

      const url = `/admin/utilization-reviews/${id}`;
      const method = "PUT";

      await apiClient(url, {
        method,
        body: payload,
        onLoading: (l: boolean) => setLoading(l),
      });

      updateReview(id, {
        policyPeriodStartDate,
        policyPeriodEndDate,
        quarter,
        totalEnrollees: Number(totalEnrollees) || 0,
        totalDependents: Number(totalDependents) || 0,
        totalClaimAmount: Number(totalClaimAmount) || 0,
        utilizationRate: Number(utilizationRate) || 0,
        topUtilizedServices: topUtilizedServices
          ? topUtilizedServices.split(",").map((s) => s.trim())
          : null,
        topProviders: topProviders
          ? topProviders.split(",").map((p) => p.trim())
          : null,
        excludedServiceAttempts: Number(excludedServiceAttempts) || 0,
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
            Edit Utilization Review
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Update the review details.
          </p>
        </div>

        <form className="flex flex-col">
          <div className="custom-scrollbar h-[450px] sm:h-[550px] overflow-y-auto px-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div className="col-span-2 lg:col-span-1">
                <DatePicker
                  id="edit-start-date"
                  label="Policy Period Start Date"
                  placeholder="Select start date"
                  defaultDate={policyPeriodStartDate}
                  onChange={(selectedDates) => {
                    if (selectedDates.length > 0) {
                      const date = new Date(selectedDates[0]);
                      setPolicyPeriodStartDate(
                        date.toISOString().split("T")[0]
                      );
                    }
                  }}
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <DatePicker
                  id="edit-end-date"
                  label="Policy Period End Date"
                  placeholder="Select end date"
                  defaultDate={policyPeriodEndDate}
                  onChange={(selectedDates) => {
                    if (selectedDates.length > 0) {
                      const date = new Date(selectedDates[0]);
                      setPolicyPeriodEndDate(date.toISOString().split("T")[0]);
                    }
                  }}
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Quarter</Label>
                <Select
                  options={[
                    { value: "Q1", label: "Q1" },
                    { value: "Q2", label: "Q2" },
                    { value: "Q3", label: "Q3" },
                    { value: "Q4", label: "Q4" },
                  ]}
                  placeholder="Select quarter"
                  onChange={(value) => setQuarter(value)}
                  defaultValue={quarter}
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Total Enrollees</Label>
                <Input
                  type="number"
                  value={totalEnrollees}
                  placeholder="Enter total enrollees"
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setTotalEnrollees(e.target.value)
                  }
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Total Dependents</Label>
                <Input
                  type="number"
                  value={totalDependents}
                  placeholder="Enter total dependents"
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setTotalDependents(e.target.value)
                  }
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Total Claim Amount</Label>
                <Input
                  type="number"
                  value={totalClaimAmount}
                  placeholder="Enter total claim amount"
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setTotalClaimAmount(e.target.value)
                  }
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Utilization Rate (%)</Label>
                <Input
                  type="number"
                  value={utilizationRate}
                  placeholder="Enter utilization rate"
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setUtilizationRate(e.target.value)
                  }
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Excluded Service Attempts</Label>
                <Input
                  type="number"
                  value={excludedServiceAttempts}
                  placeholder="Enter excluded service attempts"
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setExcludedServiceAttempts(e.target.value)
                  }
                />
              </div>

              <div className="col-span-2">
                <Label>Top Utilized Services (comma-separated)</Label>
                <TextArea
                  placeholder="Enter services separated by commas..."
                  rows={3}
                  value={topUtilizedServices}
                  onChange={(value) => setTopUtilizedServices(value)}
                />
              </div>

              <div className="col-span-2">
                <Label>Top Providers (comma-separated)</Label>
                <TextArea
                  placeholder="Enter providers separated by commas..."
                  rows={3}
                  value={topProviders}
                  onChange={(value) => setTopProviders(value)}
                />
              </div>

              <div className="col-span-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlesubmit}
                  disabled={loading}
                  className="px-4 py-2 rounded bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update Review"}
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
