"use client";

import Select from "@/components/form/Select";
import DatePicker from "@/components/form/date-picker";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { apiClient } from "@/lib/apiClient";
import { useAuthorizationCodeStore } from "@/lib/store/authorizationCodeStore";
import { useEffect, useState } from "react";

interface Enrollee {
  id: string;
  firstName: string;
  lastName: string;
  policyNumber: string;
}

interface Provider {
  id: string;
  name: string;
  code: string;
}

interface Diagnosis {
  id: string;
  name: string;
  code: string;
}

interface CompanyPlan {
  id: string;
  name: string;
}

interface Company {
  id: string;
  name: string;
}

export default function PageMetricsAuthorizationCodes({
  buttonText,
}: {
  buttonText?: string;
}) {
  const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const addAuthorizationCode = useAuthorizationCodeStore(
    (state) => state.addAuthorizationCode
  );

  const errorModal = useModal();
  const successModal = useModal();

  // Form state
  const [enrolleeId, setEnrolleeId] = useState("");
  const [providerId, setProviderId] = useState("");
  const [diagnosisId, setDiagnosisId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [companyPlanId, setCompanyPlanId] = useState("");
  const [authorizationType, setAuthorizationType] = useState<
    "inpatient" | "outpatient" | "procedure" | "medication" | "diagnostic"
  >("inpatient");
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [amountAuthorized, setAmountAuthorized] = useState("");
  const [reasonForCode, setReasonForCode] = useState("");
  const [approvalNote, setApprovalNote] = useState("");
  const [notes, setNotes] = useState("");

  // Fetch data
  const [enrollees, setEnrollees] = useState<Enrollee[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyPlans, setCompanyPlans] = useState<CompanyPlan[]>([]);

  const [errorMessage, setErrorMessage] = useState(
    "Failed to create authorization code. Please try again."
  );

  const authorizationTypeOptions = [
    { value: "inpatient", label: "Inpatient" },
    { value: "outpatient", label: "Outpatient" },
    { value: "procedure", label: "Procedure" },
    { value: "medication", label: "Medication" },
    { value: "diagnostic", label: "Diagnostic" },
  ];

  // Fetch all related data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchEnrollees();
      fetchProviders();
      fetchDiagnoses();
      fetchCompanies();
    }
  }, [isOpen]);

  // Fetch company plans when company is selected
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await apiClient(
          `/admin/company-plans/list?limit=all&companyId=${companyId}`,
          {
            method: "GET",
          }
        );
        const items: CompanyPlan[] =
          data?.data?.list && Array.isArray(data.data.list)
            ? data.data.list
            : Array.isArray(data)
            ? data
            : [];
        setCompanyPlans(items);
      } catch (err) {
        console.warn("Failed to fetch company plans", err);
      }
    };

    if (companyId) {
      fetchPlans();
    } else {
      setCompanyPlans([]);
    }
  }, [companyId]);

  const fetchEnrollees = async () => {
    try {
      const data = await apiClient("/admin/enrollees?limit=all", {
        method: "GET",
      });
      const items: Enrollee[] =
        data?.data?.enrollees && Array.isArray(data.data.enrollees)
          ? data.data.enrollees
          : Array.isArray(data)
          ? data
          : [];
      setEnrollees(items);
    } catch (err) {
      console.warn("Failed to fetch enrollees", err);
    }
  };

  const fetchProviders = async () => {
    try {
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
      console.warn("Failed to fetch providers", err);
    }
  };

  const fetchDiagnoses = async () => {
    try {
      const data = await apiClient("/admin/diagnosis/list?limit=all", {
        method: "GET",
      });
      const items: Diagnosis[] =
        data?.data?.list && Array.isArray(data.data.list)
          ? data.data.list
          : Array.isArray(data)
          ? data
          : [];
      setDiagnoses(items);
    } catch (err) {
      console.warn("Failed to fetch diagnoses", err);
    }
  };

  const fetchCompanies = async () => {
    try {
      const data = await apiClient("/admin/companies/list?limit=all", {
        method: "GET",
      });
      const items: Company[] =
        data?.data?.list && Array.isArray(data.data.list)
          ? data.data.list
          : Array.isArray(data)
          ? data
          : [];
      setCompanies(items);
    } catch (err) {
      console.warn("Failed to fetch companies", err);
    }
  };

  const resetForm = () => {
    setEnrolleeId("");
    setProviderId("");
    setDiagnosisId("");
    setCompanyId("");
    setCompanyPlanId("");
    setAuthorizationType("inpatient");
    setValidFrom("");
    setValidTo("");
    setAmountAuthorized("");
    setReasonForCode("");
    setApprovalNote("");
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
    try {
      // Validation
      if (!enrolleeId) {
        setErrorMessage("`enrolleeId` is required");
        errorModal.openModal();
        return;
      }
      if (!companyId) {
        setErrorMessage("`companyId` is required");
        errorModal.openModal();
        return;
      }
      if (!authorizationType) {
        setErrorMessage("`authorizationType` is required");
        errorModal.openModal();
        return;
      }
      if (!validFrom) {
        setErrorMessage("`validFrom` is required");
        errorModal.openModal();
        return;
      }
      if (!validTo) {
        setErrorMessage("`validTo` is required");
        errorModal.openModal();
        return;
      }

      setLoading(true);

      const payload = {
        enrolleeId,
        providerId: providerId || undefined,
        diagnosisId: diagnosisId || undefined,
        companyId,
        companyPlanId: companyPlanId || undefined,
        authorizationType,
        validFrom,
        validTo,
        amountAuthorized: amountAuthorized
          ? Number(amountAuthorized)
          : undefined,
        reasonForCode: reasonForCode || undefined,
        approvalNote: approvalNote || undefined,
        notes: notes || undefined,
      };

      const data = await apiClient("/admin/authorization-codes", {
        method: "POST",
        body: payload,
        onLoading: (l: boolean) => setLoading(l),
      });

      if (data?.data?.authorizationCode) {
        addAuthorizationCode(data.data.authorizationCode);
        successModal.openModal();
      }
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
            Create Authorization Code
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Fill in the details to create a new authorization code.
          </p>
        </div>

        <form className="flex flex-col">
          <div className="custom-scrollbar h-[350px] sm:h-[450px] overflow-y-auto px-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              {/* Enrollee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  Enrollee *
                </label>
                <Select
                  options={enrollees.map((e) => ({
                    value: e.id,
                    label: `${e.firstName} ${e.lastName} (${e.policyNumber})`,
                  }))}
                  placeholder="Select enrollee"
                  onChange={(value) => setEnrolleeId(value as string)}
                  defaultValue={enrolleeId}
                />
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  Company *
                </label>
                <Select
                  options={companies.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                  placeholder="Select company"
                  onChange={(value) => setCompanyId(value as string)}
                  defaultValue={companyId}
                />
              </div>

              {/* Provider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  Provider
                </label>
                <Select
                  options={providers.map((p) => ({
                    value: p.id,
                    label: `${p.name} (${p.code})`,
                  }))}
                  placeholder="Select provider"
                  onChange={(value) => setProviderId(value as string)}
                  defaultValue={providerId}
                />
              </div>

              {/* Diagnosis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  Diagnosis
                </label>
                <Select
                  options={diagnoses.map((d) => ({
                    value: d.id,
                    label: `${d.name} `,
                  }))}
                  placeholder="Select diagnosis"
                  onChange={(value) => setDiagnosisId(value as string)}
                  defaultValue={diagnosisId}
                />
              </div>

              {/* Company Plan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  Company Plan
                </label>
                <Select
                  options={companyPlans.map((p) => ({
                    value: p.id,
                    label: p.name,
                  }))}
                  placeholder="Select company plan"
                  onChange={(value) => setCompanyPlanId(value as string)}
                  defaultValue={companyPlanId}
                />
              </div>

              {/* Authorization Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  Authorization Type *
                </label>
                <Select
                  options={authorizationTypeOptions}
                  placeholder="Select type"
                  onChange={(value) =>
                    setAuthorizationType(
                      value as
                        | "inpatient"
                        | "outpatient"
                        | "procedure"
                        | "medication"
                        | "diagnostic"
                    )
                  }
                  defaultValue={authorizationType}
                />
              </div>

              {/* Valid From */}
              <div>
                <DatePicker
                  id="validFrom"
                  label="Valid From *"
                  placeholder="Select date"
                  defaultDate={validFrom}
                  onChange={(selectedDates) => {
                    if (selectedDates[0]) {
                      const date = new Date(selectedDates[0]);
                      setValidFrom(date.toISOString().split("T")[0]);
                    }
                  }}
                />
              </div>

              {/* Valid To */}
              <div>
                <DatePicker
                  id="validTo"
                  label="Valid To *"
                  placeholder="Select date"
                  defaultDate={validTo}
                  onChange={(selectedDates) => {
                    if (selectedDates[0]) {
                      const date = new Date(selectedDates[0]);
                      setValidTo(date.toISOString().split("T")[0]);
                    }
                  }}
                />
              </div>

              {/* Amount Authorized */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  Amount Authorized
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amountAuthorized}
                  onChange={(e) => setAmountAuthorized(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:ring-brand-500/10 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                />
              </div>

              {/* Reason for Code */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  Reason for Code
                </label>
                <textarea
                  value={reasonForCode}
                  onChange={(e) => setReasonForCode(e.target.value)}
                  placeholder="Enter reason..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:ring-brand-500/10 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  rows={3}
                />
              </div>

              {/* Approval Note */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  Approval Note
                </label>
                <textarea
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  placeholder="Enter approval note..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:ring-brand-500/10 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  rows={3}
                />
              </div>

              {/* Notes */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter notes..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:ring-brand-500/10 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6 px-2 border-t border-gray-200 dark:border-gray-700 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              onClick={handleSubmit}
              type="button"
              className="flex justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
            >
              Create Authorization Code
            </button>
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
