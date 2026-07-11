/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import DatePicker from "@/components/form/date-picker";
import PhoneInput from "@/components/form/group-input/PhoneInput";
import FileInput from "@/components/form/input/FileInput";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { apiClient } from "@/lib/apiClient";
import { useStaffStore } from "@/lib/store/staffStore";
import { ChangeEvent, useEffect, useState } from "react";

type BulkUploadError = {
  row: number;
  message: string;
  errors: string[];
};

type BulkUploadResult = {
  createdCount: number;
  enrolleeCount: number;
  errorCount: number;
  totalRows: number;
  notificationQueuedCount: number;
  errors: BulkUploadError[];
  companyPlan?: {
    id: string;
    name: string;
  };
};

export default function PageMetricsStaffs({
  buttonText,
}: {
  buttonText?: string;
}) {
  const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [isBulkUpload, setIsBulkUpload] = useState(false);

  const errorModal = useModal();
  const successModal = useModal();
  const bulkResultModal = useModal();

  // stores
  const addStaff = useStaffStore((s) => s.addStaff);

  // form state - single staff
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [staffId, setStaffId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [subsidiaryId, setSubsidiaryId] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [maxDependents, setMaxDependents] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [preexistingMedicalRecords, setPreexistingMedicalRecords] =
    useState("");
  const [subscriptionId, setSubscriptionId] = useState("");
  const [companies, setCompanies] = useState<any[]>([]);
  const [subsidiaries, setSubsidiaries] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  // form state - bulk upload
  const [bulkCompanyId, setBulkCompanyId] = useState("");
  const [bulkSubsidiaryId, setBulkSubsidiaryId] = useState("");
  const [bulkSubscriptionId, setBulkSubscriptionId] = useState("");
  const [bulkCompanyPlanId, setBulkCompanyPlanId] = useState("");
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkCompanies, setBulkCompanies] = useState<any[]>([]);
  const [bulkSubsidiaries, setBulkSubsidiaries] = useState<any[]>([]);
  const [bulkSubscriptions, setBulkSubscriptions] = useState<any[]>([]);
  const [bulkResult, setBulkResult] = useState<BulkUploadResult | null>(null);

  const [errorMessage, setErrorMessage] = useState(
    "Failed to save staff. Please try again.",
  );

  // countries for PhoneInput
  const countries = [
    { code: "US", label: "+1" },
    { code: "CA", label: "+1" },
    { code: "GB", label: "+44" },
    { code: "AU", label: "+61" },
    { code: "IN", label: "+91" },
    { code: "NG", label: "+234" },
    { code: "DE", label: "+49" },
    { code: "FR", label: "+33" },
    { code: "ES", label: "+34" },
    { code: "IT", label: "+39" },
    { code: "BR", label: "+55" },
    { code: "MX", label: "+52" },
    { code: "CN", label: "+86" },
    { code: "JP", label: "+81" },
    { code: "ZA", label: "+27" },
  ];

  const handlePhoneChange = (v: string) => setPhoneNumber(v);

  // Fetch companies on modal open
  useEffect(() => {
    if (isOpen) {
      if (isBulkUpload) {
        fetchBulkCompanies();
      } else {
        fetchCompanies();
      }
    }
  }, [isOpen, isBulkUpload]);

  // Fetch subsidiaries and subscriptions when company changes
  useEffect(() => {
    if (companyId) {
      fetchSubsidiaries(companyId);
      fetchSubscriptions(companyId);
    } else {
      setSubsidiaries([]);
      setSubscriptions([]);
    }
  }, [companyId]);

  // Fetch bulk subsidiaries when bulk company changes
  useEffect(() => {
    if (bulkCompanyId) {
      fetchBulkSubsidiaries(bulkCompanyId);
      fetchBulkSubscriptions(bulkCompanyId);
    } else {
      setBulkSubsidiaries([]);
      setBulkSubscriptions([]);
    }
  }, [bulkCompanyId]);

  const selectedBulkSubscription = bulkSubscriptions.find(
    (subscription) => subscription.id === bulkSubscriptionId,
  );
  const bulkCompanyPlans = (selectedBulkSubscription?.companyPlans || []).filter(
    (plan: any) => plan.isActive !== false,
  );

  useEffect(() => {
    const subscription = bulkSubscriptions.find(
      (item) => item.id === bulkSubscriptionId,
    );
    const plans = (subscription?.companyPlans || []).filter(
      (plan: any) => plan.isActive !== false,
    );

    setBulkCompanyPlanId((current) => {
      if (plans.length === 1) return plans[0].id;
      return plans.some((plan: any) => plan.id === current) ? current : "";
    });
  }, [bulkSubscriptionId, bulkSubscriptions]);

  const fetchCompanies = async () => {
    try {
      const data = await apiClient("/admin/companies/list?limit=all", {
        method: "GET",
      });
      const companiesList = data?.data?.list || [];
      setCompanies(companiesList);
    } catch (err) {
      console.warn("Failed to fetch companies", err);
    }
  };

  const fetchSubsidiaries = async (cId: string) => {
    try {
      const data = await apiClient(
        `/admin/company-subsidiaries/list?companyId=${cId}&limit=all`,
        {
          method: "GET",
        },
      );
      const subsidiariesList = data?.data?.list || [];
      setSubsidiaries(subsidiariesList);
    } catch (err) {
      console.warn("Failed to fetch subsidiaries", err);
    }
  };

  const fetchSubscriptions = async (cId: string) => {
    try {
      const data = await apiClient(
        `/admin/subscriptions/list?companyId=${cId}&limit=all`,
        {
          method: "GET",
        },
      );
      const subscriptionsList = data?.data?.list || [];
      setSubscriptions(subscriptionsList);
    } catch (err) {
      console.warn("Failed to fetch subscriptions", err);
    }
  };

  const fetchBulkCompanies = async () => {
    try {
      const data = await apiClient("/admin/companies/list?limit=all", {
        method: "GET",
      });
      const companiesList = data?.data?.list || [];
      setBulkCompanies(companiesList);
    } catch (err) {
      console.warn("Failed to fetch companies", err);
    }
  };

  const fetchBulkSubsidiaries = async (cId: string) => {
    try {
      const data = await apiClient(
        `/admin/company-subsidiaries/list?companyId=${cId}&limit=all`,
        {
          method: "GET",
        },
      );
      const subsidiariesList = data?.data?.list || [];
      setBulkSubsidiaries(subsidiariesList);
    } catch (err) {
      console.warn("Failed to fetch subsidiaries", err);
    }
  };

  const fetchBulkSubscriptions = async (cId: string) => {
    try {
      const data = await apiClient(
        `/admin/subscriptions/list?companyId=${cId}&limit=all`,
        {
          method: "GET",
        },
      );
      const now = Date.now();
      const subscriptionsList = (data?.data?.list || []).filter(
        (subscription: any) =>
          subscription.status === "active" &&
          new Date(subscription.startDate).getTime() <= now &&
          new Date(subscription.endDate).getTime() >= now &&
          Array.isArray(subscription.companyPlans) &&
          subscription.companyPlans.length > 0,
      );
      setBulkSubscriptions(subscriptionsList);
    } catch (err) {
      console.warn("Failed to fetch subscriptions", err);
    }
  };

  const resetForm = () => {
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setEmail("");
    setPhoneNumber("");
    setStaffId("");
    setCompanyId("");
    setSubsidiaryId("");
    setDateOfBirth("");
    setMaxDependents("");
    setPolicyNumber("");
    setPreexistingMedicalRecords("");
    setSubscriptionId("");
    setBulkCompanyId("");
    setBulkSubsidiaryId("");
    setBulkSubscriptionId("");
    setBulkCompanyPlanId("");
    setBulkFile(null);
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

  const handleBulkResultClose = () => {
    bulkResultModal.closeModal();
    if ((bulkResult?.createdCount || 0) > 0) {
      resetForm();
      closeModal();
    }
    setBulkResult(null);
  };

  const downloadBulkErrors = () => {
    if (!bulkResult?.errors?.length) return;

    const escapeCsv = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`;
    const csv = [
      "row,error",
      ...bulkResult.errors.map((error) =>
        [escapeCsv(error.row), escapeCsv(error.message)].join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "staff_bulk_upload_errors.csv";
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  };

  const downloadSampleTemplate = () => {
    const headers = [
      "firstName",
      "middleName",
      "lastName",
      "email",
      "phoneNumber",
      "staffId",
      "dateOfBirth",
      "gender",
      "policyNumber",
      "maxDependents",
      "preexistingMedicalRecords",
    ];
    const csv = `${headers.join(",")}\n`;

    // Create and trigger download
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "staff_bulk_upload_template.csv";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleBulkUpload = async () => {
    try {
      if (!bulkCompanyId) {
        setErrorMessage("Company is required for bulk upload.");
        errorModal.openModal();
        return;
      }

      if (!bulkSubscriptionId) {
        setErrorMessage("Subscription is required for bulk upload.");
        errorModal.openModal();
        return;
      }

      if (!bulkCompanyPlanId) {
        setErrorMessage("Company plan is required for bulk upload.");
        errorModal.openModal();
        return;
      }

      if (!bulkFile) {
        setErrorMessage("Please select a file to upload.");
        errorModal.openModal();
        return;
      }

      setLoading(true);

      const formData = new FormData();
      formData.append("file", bulkFile);
      formData.append("companyId", bulkCompanyId);
      if (bulkSubsidiaryId) {
        formData.append("subsidiaryId", bulkSubsidiaryId);
      }
      if (bulkSubscriptionId) {
        formData.append("subscriptionId", bulkSubscriptionId);
      }
      formData.append("companyPlanId", bulkCompanyPlanId);

      const data = await apiClient("/admin/staffs/bulk/create", {
        method: "POST",
        formData,
        onLoading: (l: boolean) => setLoading(l),
      });

      if (data?.data?.staffs && Array.isArray(data.data.staffs)) {
        data.data.staffs.forEach((staff: any) => {
          addStaff(staff);
        });
      }

      setBulkResult(data.data as BulkUploadResult);
      bulkResultModal.openModal();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
      errorModal.openModal();
    } finally {
      setLoading(false);
    }
  };

  const handlesubmit = async () => {
    try {
      // simple client-side validation
      if (!firstName) {
        setErrorMessage("First name is required.");
        errorModal.openModal();
        return;
      }
      if (!lastName) {
        setErrorMessage("Last name is required.");
        errorModal.openModal();
        return;
      }
      if (!companyId) {
        setErrorMessage("Company is required.");
        errorModal.openModal();
        return;
      }

      if (!subscriptionId) {
        setErrorMessage("Subscription is required.");
        errorModal.openModal();
        return;
      }

      setLoading(true);

      const payload: any = {
        firstName: firstName.trim(),
        middleName: middleName.trim() || undefined,
        lastName: lastName.trim(),
        email: email.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        staffId: staffId.trim() || undefined,
        companyId,
        subsidiaryId: subsidiaryId || undefined,
        dateOfBirth: dateOfBirth || undefined,
        maxDependents: maxDependents ? parseInt(maxDependents) : undefined,
        policyNumber: policyNumber.trim() || undefined,
        preexistingMedicalRecords:
          preexistingMedicalRecords.trim() || undefined,
        subscriptionId: subscriptionId || undefined,
      };

      const data = await apiClient("/admin/staffs", {
        method: "POST",
        body: payload,
        onLoading: (l: boolean) => setLoading(l),
      });

      if (data?.data?.staff) {
        addStaff({
          id: data.data.staff.id,
          firstName,
          middleName: middleName || null,
          lastName,
          email,
          phoneNumber,
          staffId,
          companyId,
          subsidiaryId: subsidiaryId || null,
          dateOfBirth: dateOfBirth || null,
          maxDependents: maxDependents ? parseInt(maxDependents) : null,
          preexistingMedicalRecords: preexistingMedicalRecords || null,
          subscriptionId: subscriptionId || null,
          enrollmentStatus: "enrolled",
          isNotified: false,
          isActive: true,
          createdAt: data.data.staff.createdAt,
        });
      }

      successModal.openModal();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred.",
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                {isBulkUpload ? "Bulk Upload Staff" : "Add a new Staff Member"}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isBulkUpload
                  ? "Upload multiple staff members at once using a CSV file."
                  : "Fill in the details below to add a new staff member."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                label="Bulk Upload"
                defaultChecked={isBulkUpload}
                onChange={(checked) => {
                  setIsBulkUpload(checked);
                  resetForm();
                }}
              />
            </div>
          </div>
        </div>

        {isBulkUpload ? (
          <form
            className="flex flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              handleBulkUpload();
            }}
          >
            <div className="custom-scrollbar h-[450px] sm:h-[550px] overflow-y-auto px-2">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Company *</Label>
                  <Select
                    options={bulkCompanies.map((c) => ({
                      value: c.id,
                      label: c.name,
                    }))}
                    placeholder="Select company"
                    onChange={(value) => {
                      setBulkCompanyId(value as string);
                      setBulkSubsidiaryId("");
                      setBulkSubscriptionId("");
                      setBulkCompanyPlanId("");
                    }}
                    defaultValue={bulkCompanyId}
                  />
                </div>

                <div>
                  <Label>Subsidiary (Optional)</Label>
                  <Select
                    options={bulkSubsidiaries.map((s) => ({
                      value: s.id,
                      label: s.name,
                    }))}
                    placeholder="Select subsidiary"
                    onChange={(value) => setBulkSubsidiaryId(value as string)}
                    defaultValue={bulkSubsidiaryId}
                  />
                </div>

                <div>
                  <Label>Subscription *</Label>
                  <Select
                    options={bulkSubscriptions.map((s) => ({
                      value: s.id,
                      label: `${s.code} (${s.companyPlans.length} plan${s.companyPlans.length === 1 ? "" : "s"})`,
                    }))}
                    placeholder="Select subscription"
                    onChange={(value) => setBulkSubscriptionId(value as string)}
                    defaultValue={bulkSubscriptionId}
                  />
                </div>

                <div>
                  <Label>Company Plan *</Label>
                  <Select
                    options={bulkCompanyPlans.map((plan: any) => ({
                      value: plan.id,
                      label: plan.name,
                    }))}
                    placeholder="Select company plan"
                    onChange={(value) =>
                      setBulkCompanyPlanId(value as string)
                    }
                    defaultValue={bulkCompanyPlanId}
                  />
                </div>

                <div className="col-span-2">
                  <Label>CSV or Excel File *</Label>
                  <FileInput
                    accept=".csv,.xlsx,.xls"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      if (e.target.files && e.target.files[0]) {
                        setBulkFile(e.target.files[0]);
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Supported formats: CSV, XLSX, XLS. Maximum 200 rows.
                    Headers are normalized automatically; policyNumber is
                    optional.
                  </p>
                </div>

                <div className="col-span-2 flex items-center justify-between gap-3 pt-4">
                  <button
                    type="button"
                    onClick={downloadSampleTemplate}
                    className="px-4 py-2 rounded border border-brand-500 text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10"
                  >
                    📥 Download Empty Template
                  </button>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 rounded bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50"
                    >
                      {loading ? "Uploading..." : "Upload Staff"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <form
            className="flex flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              handlesubmit();
            }}
          >
            <div className="custom-scrollbar h-[450px] sm:h-[550px] overflow-y-auto px-2">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>First Name *</Label>
                  <Input
                    type="text"
                    value={firstName}
                    placeholder="Enter first name..."
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFirstName(e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label>Middle Name</Label>
                  <Input
                    type="text"
                    value={middleName}
                    placeholder="Enter middle name..."
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setMiddleName(e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label>Last Name *</Label>
                  <Input
                    type="text"
                    value={lastName}
                    placeholder="Enter last name..."
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setLastName(e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label>Staff ID</Label>
                  <Input
                    type="text"
                    value={staffId}
                    placeholder="Enter staff ID..."
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setStaffId(e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    placeholder="Enter email address..."
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setEmail(e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <PhoneInput
                    selectPosition="start"
                    countries={countries}
                    placeholder="+1 (555) 000-0000"
                    //defaultValue={phoneNumber}
                    onChange={handlePhoneChange}
                  />
                </div>

                <div>
                  <Label>Company *</Label>
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

                <div>
                  <Label>Subsidiary</Label>
                  <Select
                    options={subsidiaries.map((s) => ({
                      value: s.id,
                      label: s.name,
                    }))}
                    placeholder="Select subsidiary"
                    onChange={(value) => setSubsidiaryId(value as string)}
                    defaultValue={subsidiaryId}
                    //   disabled={!companyId}
                  />
                </div>

                <div>
                  <Label>Subscription *</Label>
                  <Select
                    options={subscriptions.map((s) => ({
                      value: s.id,
                      label: s.code,
                    }))}
                    placeholder="Select subscription"
                    onChange={(value) => setSubscriptionId(value as string)}
                    defaultValue={subscriptionId}
                    //   disabled={!companyId}
                  />
                </div>

                <div>
                  <DatePicker
                    id="dob-create"
                    label="Date of Birth"
                    placeholder="Select date of birth"
                    defaultDate={dateOfBirth}
                    onChange={(selectedDates) => {
                      if (selectedDates && selectedDates.length > 0) {
                        const date = selectedDates[0];
                        const formattedDate = date.toISOString().split("T")[0];
                        setDateOfBirth(formattedDate);
                      }
                    }}
                  />
                </div>

                <div>
                  <Label>Max Dependents</Label>
                  <Input
                    type="number"
                    value={maxDependents}
                    placeholder="Enter number of dependents..."
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setMaxDependents(e.target.value)
                    }
                    min="0"
                  />
                </div>

                <div>
                  <Label>Policy Number</Label>
                  <Input
                    type="text"
                    value={policyNumber}
                    placeholder="Enter existing policy number (optional)..."
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setPolicyNumber(e.target.value)
                    }
                  />
                </div>

                <div className="col-span-2">
                  <Label>Preexisting Medical Records</Label>
                  <TextArea
                    placeholder="Enter any relevant medical history or conditions..."
                    rows={4}
                    value={preexistingMedicalRecords}
                    onChange={(value) => setPreexistingMedicalRecords(value)}
                  />
                </div>

                <div className="col-span-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50"
                  >
                    {loading ? "Creating..." : "Create Staff"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </Modal>
      <SuccessModal
        successModal={successModal}
        handleSuccessClose={handleSuccessClose}
      />

      <Modal
        isOpen={bulkResultModal.isOpen}
        onClose={handleBulkResultClose}
        className="max-w-[720px] p-5 lg:p-8"
      >
        <div>
          <h4 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            {bulkResult?.errorCount
              ? bulkResult.createdCount
                ? "Bulk upload completed with errors"
                : "Bulk upload failed"
              : "Bulk upload completed"}
          </h4>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Plan: {bulkResult?.companyPlan?.name || "—"}. Enrollment emails
            are sent in the background after the records are created.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-white/[0.03]">
              <span className="text-xs text-gray-500">Rows</span>
              <strong className="block text-lg text-gray-800 dark:text-white/90">
                {bulkResult?.totalRows || 0}
              </strong>
            </div>
            <div className="rounded-lg bg-success-50 p-3 dark:bg-success-500/10">
              <span className="text-xs text-success-700">Created</span>
              <strong className="block text-lg text-success-700">
                {bulkResult?.createdCount || 0}
              </strong>
            </div>
            <div className="rounded-lg bg-error-50 p-3 dark:bg-error-500/10">
              <span className="text-xs text-error-700">Failed</span>
              <strong className="block text-lg text-error-700">
                {bulkResult?.errorCount || 0}
              </strong>
            </div>
            <div className="rounded-lg bg-brand-50 p-3 dark:bg-brand-500/10">
              <span className="text-xs text-brand-700">Emails queued</span>
              <strong className="block text-lg text-brand-700">
                {bulkResult?.notificationQueuedCount || 0}
              </strong>
            </div>
          </div>

          {!!bulkResult?.errors?.length && (
            <div className="custom-scrollbar mt-5 max-h-64 overflow-y-auto rounded-lg border border-error-200 dark:border-error-500/30">
              {bulkResult.errors.map((error) => (
                <div
                  key={`${error.row}-${error.message}`}
                  className="border-b border-error-100 p-3 last:border-b-0 dark:border-error-500/20"
                >
                  <strong className="text-sm text-error-700 dark:text-error-400">
                    Row {error.row}
                  </strong>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {error.message}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            {!!bulkResult?.errors?.length && (
              <button
                type="button"
                onClick={downloadBulkErrors}
                className="rounded-lg border border-error-300 px-4 py-2.5 text-sm font-medium text-error-700 hover:bg-error-50 dark:border-error-500/40 dark:text-error-400 dark:hover:bg-error-500/10"
              >
                Download Errors
              </button>
            )}
            <button
              type="button"
              onClick={handleBulkResultClose}
              className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
            >
              {(bulkResult?.createdCount || 0) > 0 ? "Done" : "Review File"}
            </button>
          </div>
        </div>
      </Modal>

      <ErrorModal
        message={errorMessage}
        errorModal={errorModal}
        handleErrorClose={handleErrorClose}
      />
    </div>
  );
}
