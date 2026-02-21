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
import { useUtilizationReviewStore } from "@/lib/store/utilizationReviewStore";
import { ChangeEvent, useEffect, useState } from "react";

interface Company {
  id: string;
  name: string;
}

interface CompanyPlan {
  id: string;
  name: string;
}

export default function PageMetricsUtilizationReviews({
  buttonText,
}: {
  buttonText?: string;
}) {
  const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);

  const errorModal = useModal();
  const successModal = useModal();

  // stores
  const addReview = useUtilizationReviewStore((s) => s.addReview);

  // form state
  const [companyId, setCompanyId] = useState("");
  const [companyPlanId, setCompanyPlanId] = useState("");
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

  // Fetch lists
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyPlans, setCompanyPlans] = useState<CompanyPlan[]>([]);
  //   const [companiesLoading, setCompaniesLoading] = useState(false);
  //   const [plansLoading, setPlansLoading] = useState(false);

  const resetForm = () => {
    setCompanyId("");
    setCompanyPlanId("");
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
  };

  const handleSuccessClose = () => {
    successModal.closeModal();
    resetForm();
    closeModal();
  };

  const handleErrorClose = () => {
    errorModal.closeModal();
    // resetForm();
    // closeModal();
  };

  // Fetch companies on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        // setCompaniesLoading(true);
        const data = await apiClient("/admin/companies/list?limit=all", {
          method: "GET",
        });
        setCompanies(
          data?.data?.list && Array.isArray(data.data.list)
            ? data.data.list
            : []
        );
      } catch (err) {
        console.warn("Failed to fetch companies", err);
      } finally {
        // setCompaniesLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  // Fetch company plans when company is selected
  useEffect(() => {
    if (!companyId) {
      setCompanyPlans([]);
      setCompanyPlanId("");
      return;
    }

    const fetchCompanyPlans = async () => {
      try {
        // setPlansLoading(true);
        const data = await apiClient(
          `/admin/company-plans/list?companyId=${companyId}&limit=all`,
          {
            method: "GET",
          }
        );
        setCompanyPlans(
          data?.data?.list && Array.isArray(data.data.list)
            ? data.data.list
            : []
        );
      } catch (err) {
        console.warn("Failed to fetch company plans", err);
      } finally {
        // setPlansLoading(false);
      }
    };
    fetchCompanyPlans();
  }, [companyId]);

  const handlesubmit = async () => {
    try {
      // simple client-side validation
      if (!companyId) {
        setErrorMessage("Company is required.");
        errorModal.openModal();
        return;
      }
      if (!companyPlanId) {
        setErrorMessage("Company Plan is required.");
        errorModal.openModal();
        return;
      }
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
        companyId: string;
        companyPlanId: string;
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
        companyId,
        companyPlanId,
        policyPeriodStartDate,
        policyPeriodEndDate,
        quarter,
        totalEnrollees: totalEnrollees ? Number(totalEnrollees) : 0,
        totalDependents: totalDependents ? Number(totalDependents) : 0,
        totalClaimAmount: totalClaimAmount ? Number(totalClaimAmount) : 0,
        utilizationRate: utilizationRate ? Number(utilizationRate) : 0,
        topUtilizedServices: topUtilizedServices
          ? topUtilizedServices.split(",").map((s) => s.trim())
          : undefined,
        topProviders: topProviders
          ? topProviders.split(",").map((p) => p.trim())
          : undefined,
        excludedServiceAttempts: excludedServiceAttempts
          ? Number(excludedServiceAttempts)
          : 0,
      };

      const data = await apiClient("/admin/utilization-reviews", {
        method: "POST",
        body: payload,
        onLoading: (l: boolean) => setLoading(l),
      });

      if (data?.data?.review) {
        addReview({
          id: data.data.review.id,
          companyId,
          companyPlanId,
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
          status: "draft",
          createdAt: data.data.review.createdAt,
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
      <div className="flex items-center justify-between">
        <div></div>
        <div>
          <div
            style={{ display: "none" }}
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
            Create a new Utilization Review
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Fill in the details below to create a new utilization review.
          </p>
        </div>

        <form
          className="flex flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            handlesubmit();
          }}
        >
          <div className="custom-scrollbar h-[450px] sm:h-[550px] overflow-y-auto px-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div className="col-span-2 lg:col-span-1">
                <Label>Company</Label>
                <Select
                  options={companies.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                  placeholder="Select company"
                  onChange={(value) => setCompanyId(value)}
                  defaultValue={companyId}
                  //   disabled={companiesLoading}
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Company Plan</Label>
                <Select
                  options={companyPlans.map((p) => ({
                    value: p.id,
                    label: p.name,
                  }))}
                  placeholder="Select company plan"
                  onChange={(value) => setCompanyPlanId(value)}
                  defaultValue={companyPlanId}
                  //   disabled={plansLoading || !companyId}
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <DatePicker
                  id="create-start-date"
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
                  id="create-end-date"
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
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Review"}
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
