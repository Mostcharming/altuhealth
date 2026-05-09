"use client";

import Select from "@/components/form/Select";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { apiClient } from "@/lib/apiClient";
import { useAuthorizationCodeStore } from "@/lib/store/authorizationCodeStore";
import { useEffect, useState } from "react";

interface AuthorizationCode {
  id: string;
  authorizationCode: string;
  enrolleeId: string;
  providerId?: string;
  diagnosisId?: string;
  companyId: string;
  companyPlanId?: string;
  authorizationType: string;
  validFrom: string;
  validTo: string;
  amountAuthorized?: number;
  reasonForCode?: string;
  approvalNote?: string;
  notes?: string;
  status: string;
}

interface EditAuthorizationCodeProps {
  isOpen: boolean;
  closeModal: () => void;
  code?: AuthorizationCode | null;
}

interface Enrollee {
  id: string;
  firstName: string;
  lastName: string;
  policyNumber: string;
}

// interface Provider {
//   id: string;
//   name: string;
//   code: string;
// }

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

export default function EditAuthorizationCode({
  isOpen,
  closeModal,
  code,
}: EditAuthorizationCodeProps) {
  const [loading, setLoading] = useState(false);
  const errorModal = useModal();
  const successModal = useModal();
  const updateAuthorizationCode = useAuthorizationCodeStore(
    (state) => state.updateAuthorizationCode
  );

  // Form state
  const [id, setId] = useState<string>("");
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
  const [status, setStatus] = useState("active");

  // Fetch data
  const [enrollees, setEnrollees] = useState<Enrollee[]>([]);
  // const [providers, setProviders] = useState<Provider[]>([]);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyPlans, setCompanyPlans] = useState<CompanyPlan[]>([]);

  const [errorMessage, setErrorMessage] = useState(
    "Failed to update authorization code. Please try again."
  );

  const authorizationTypeOptions = [
    { value: "inpatient", label: "Inpatient" },
    { value: "outpatient", label: "Outpatient" },
    { value: "procedure", label: "Procedure" },
    { value: "medication", label: "Medication" },
    { value: "diagnostic", label: "Diagnostic" },
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "used", label: "Used" },
    { value: "expired", label: "Expired" },
    { value: "cancelled", label: "Cancelled" },
    { value: "pending", label: "Pending" },
  ];

  // Fetch all related data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchEnrollees();
      // fetchProviders();
      fetchDiagnoses();
      fetchCompanies();
      fetchCompanyPlans();
    }
  }, [isOpen]);

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

  // const fetchProviders = async () => {
  //   try {
  //     const data = await apiClient("/admin/providers?limit=all", {
  //       method: "GET",
  //     });
  //     const items: Provider[] =
  //       data?.data?.providers && Array.isArray(data.data.providers)
  //         ? data.data.providers
  //         : Array.isArray(data)
  //         ? data
  //         : [];
  //     setProviders(items);
  //   } catch (err) {
  //     console.warn("Failed to fetch providers", err);
  //   }
  // };

  const fetchDiagnoses = async () => {
    try {
      const data = await apiClient("/admin/diagnoses?limit=all", {
        method: "GET",
      });
      const items: Diagnosis[] =
        data?.data?.diagnoses && Array.isArray(data.data.diagnoses)
          ? data.data.diagnoses
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
      const data = await apiClient("/admin/companies?limit=all", {
        method: "GET",
      });
      const items: Company[] =
        data?.data?.companies && Array.isArray(data.data.companies)
          ? data.data.companies
          : Array.isArray(data)
          ? data
          : [];
      setCompanies(items);
    } catch (err) {
      console.warn("Failed to fetch companies", err);
    }
  };

  const fetchCompanyPlans = async () => {
    try {
      const data = await apiClient("/admin/company-plans?limit=all", {
        method: "GET",
      });
      const items: CompanyPlan[] =
        data?.data?.plans && Array.isArray(data.data.plans)
          ? data.data.plans
          : Array.isArray(data)
          ? data
          : [];
      setCompanyPlans(items);
    } catch (err) {
      console.warn("Failed to fetch company plans", err);
    }
  };

  // When the modal opens with a code, populate the form with their data.
  useEffect(() => {
    if (isOpen && code) {
      setId(code.id ?? "");
      setEnrolleeId(code.enrolleeId ?? "");
      setProviderId(code.providerId ?? "");
      setDiagnosisId(code.diagnosisId ?? "");
      setCompanyId(code.companyId ?? "");
      setCompanyPlanId(code.companyPlanId ?? "");
      setAuthorizationType(
        (code.authorizationType as
          | "inpatient"
          | "outpatient"
          | "procedure"
          | "medication"
          | "diagnostic") ?? "inpatient"
      );
      setValidFrom(code.validFrom ? code.validFrom.split("T")[0] : "");
      setValidTo(code.validTo ? code.validTo.split("T")[0] : "");
      setAmountAuthorized(code.amountAuthorized?.toString() ?? "");
      setReasonForCode(code.reasonForCode ?? "");
      setApprovalNote(code.approvalNote ?? "");
      setNotes(code.notes ?? "");
      setStatus(code.status ?? "active");
    }

    if (!isOpen) {
      setId("");
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
      setStatus("active");
    }
  }, [isOpen, code]);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const payload = {
        providerId: providerId || undefined,
        diagnosisId: diagnosisId || undefined,
        companyPlanId: companyPlanId || undefined,
        validFrom,
        validTo,
        amountAuthorized: amountAuthorized
          ? Number(amountAuthorized)
          : undefined,
        reasonForCode: reasonForCode || undefined,
        approvalNote: approvalNote || undefined,
        notes: notes || undefined,
        status,
      };

      const url = `/admin/authorization-codes/${id}`;
      const method = "PUT";

      await apiClient(url, {
        method,
        body: payload,
        onLoading: (l: boolean) => setLoading(l),
      });

      updateAuthorizationCode(id, payload);
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

  const handleSuccessClose = () => {
    successModal.closeModal();
    closeModal();
  };

  const handleErrorClose = () => {
    errorModal.closeModal();
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
            Edit Authorization Code
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Update the authorization code details.
          </p>
        </div>

        <form className="flex flex-col">
          <div className="custom-scrollbar h-[350px] sm:h-[450px] overflow-y-auto px-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              {/* Authorization Code (Read-only) */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  Authorization Code
                </label>
                <input
                  type="text"
                  disabled
                  value={code?.authorizationCode || ""}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 cursor-not-allowed"
                />
              </div>

              {/* Enrollee (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  Enrollee
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

              {/* Company (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  Company
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
              {/* <div>
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
              </div> */}

              {/* Diagnosis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  Diagnosis
                </label>
                <Select
                  options={diagnoses.map((d) => ({
                    value: d.id,
                    label: `${d.name} (${d.code})`,
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

              {/* Authorization Type (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  Authorization Type
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

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  Status
                </label>
                <Select
                  options={statusOptions}
                  placeholder="Select status"
                  onChange={(value) => setStatus(value as string)}
                  defaultValue={status}
                />
              </div>

              {/* Valid From (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  Valid From
                </label>
                <div className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 cursor-not-allowed">
                  {validFrom}
                </div>
              </div>

              {/* Valid To (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  Valid To
                </label>
                <div className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 cursor-not-allowed">
                  {validTo}
                </div>
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
              Update Authorization Code
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
    </>
  );
}
