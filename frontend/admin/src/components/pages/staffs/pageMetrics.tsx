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
  const [preexistingMedicalRecords, setPreexistingMedicalRecords] =
    useState("");
  const [companyPlanId, setCompanyPlanId] = useState("");
  const [companies, setCompanies] = useState<any[]>([]);
  const [subsidiaries, setSubsidiaries] = useState<any[]>([]);
  const [companyPlans, setCompanyPlans] = useState<any[]>([]);

  // form state - bulk upload
  const [bulkCompanyId, setBulkCompanyId] = useState("");
  const [bulkSubsidiaryId, setBulkSubsidiaryId] = useState("");
  const [bulkCompanyPlanId, setBulkCompanyPlanId] = useState("");
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkCompanies, setBulkCompanies] = useState<any[]>([]);
  const [bulkSubsidiaries, setBulkSubsidiaries] = useState<any[]>([]);
  const [bulkCompanyPlans, setBulkCompanyPlans] = useState<any[]>([]);

  const [errorMessage, setErrorMessage] = useState(
    "Failed to save staff. Please try again."
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

  // Fetch subsidiaries and plans when company changes
  useEffect(() => {
    if (companyId) {
      fetchSubsidiaries(companyId);
      fetchCompanyPlans(companyId);
    } else {
      setSubsidiaries([]);
      setCompanyPlans([]);
    }
  }, [companyId]);

  // Fetch bulk subsidiaries when bulk company changes
  useEffect(() => {
    if (bulkCompanyId) {
      fetchBulkSubsidiaries(bulkCompanyId);
      fetchBulkCompanyPlans(bulkCompanyId);
    } else {
      setBulkSubsidiaries([]);
      setBulkCompanyPlans([]);
    }
  }, [bulkCompanyId]);

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
        }
      );
      const subsidiariesList = data?.data?.list || [];
      setSubsidiaries(subsidiariesList);
    } catch (err) {
      console.warn("Failed to fetch subsidiaries", err);
    }
  };

  const fetchCompanyPlans = async (cId: string) => {
    try {
      const data = await apiClient(
        `/admin/company-plans/list?companyId=${cId}&limit=all`,
        {
          method: "GET",
        }
      );
      const plansList = data?.data?.list || [];
      setCompanyPlans(plansList);
    } catch (err) {
      console.warn("Failed to fetch company plans", err);
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
        }
      );
      const subsidiariesList = data?.data?.list || [];
      setBulkSubsidiaries(subsidiariesList);
    } catch (err) {
      console.warn("Failed to fetch subsidiaries", err);
    }
  };

  const fetchBulkCompanyPlans = async (cId: string) => {
    try {
      const data = await apiClient(
        `/admin/company-plans/list?companyId=${cId}&limit=all`,
        {
          method: "GET",
        }
      );
      const plansList = data?.data?.list || [];
      setBulkCompanyPlans(plansList);
    } catch (err) {
      console.warn("Failed to fetch company plans", err);
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
    setPreexistingMedicalRecords("");
    setCompanyPlanId("");
    setBulkCompanyId("");
    setBulkSubsidiaryId("");
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
    resetForm();
    closeModal();
  };

  const downloadSampleTemplate = () => {
    const sampleData = [
      {
        firstName: "John",
        middleName: "Michael",
        lastName: "Doe",
        email: "john.doe@example.com",
        phoneNumber: "+1234567890",
        staffId: "STF001",
        subsidiaryId: "",
        dateOfBirth: "1990-01-15",
        maxDependents: "3",
        preexistingMedicalRecords: "None",
        companyPlanId: "",
      },
      {
        firstName: "Jane",
        middleName: "Elizabeth",
        lastName: "Smith",
        email: "jane.smith@example.com",
        phoneNumber: "+1234567891",
        staffId: "STF002",
        subsidiaryId: "",
        dateOfBirth: "1992-05-20",
        maxDependents: "2",
        preexistingMedicalRecords: "Diabetes",
        companyPlanId: "",
      },
    ];

    // Create CSV content
    const headers = Object.keys(sampleData[0]);
    const csv = [
      headers.join(","),
      ...sampleData.map((row) =>
        headers
          .map((header) => {
            const value = row[header as keyof typeof row];
            return typeof value === "string" && value.includes(",")
              ? `"${value}"`
              : value;
          })
          .join(",")
      ),
    ].join("\n");

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
      if (bulkCompanyPlanId) {
        formData.append("companyPlanId", bulkCompanyPlanId);
      }

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

      successModal.openModal();
      resetForm();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred."
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
      if (!email) {
        setErrorMessage("Email is required.");
        errorModal.openModal();
        return;
      }
      if (!phoneNumber) {
        setErrorMessage("Phone number is required.");
        errorModal.openModal();
        return;
      }
      if (!staffId) {
        setErrorMessage("Staff ID is required.");
        errorModal.openModal();
        return;
      }
      if (!companyId) {
        setErrorMessage("Company is required.");
        errorModal.openModal();
        return;
      }

      setLoading(true);

      const payload: any = {
        firstName: firstName.trim(),
        middleName: middleName.trim() || undefined,
        lastName: lastName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        staffId: staffId.trim(),
        companyId,
        subsidiaryId: subsidiaryId || undefined,
        dateOfBirth: dateOfBirth || undefined,
        maxDependents: maxDependents ? parseInt(maxDependents) : undefined,
        preexistingMedicalRecords:
          preexistingMedicalRecords.trim() || undefined,
        companyPlanId: companyPlanId || undefined,
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
          companyPlanId: companyPlanId || null,
          enrollmentStatus: "not_enrolled",
          isNotified: false,
          isActive: true,
          createdAt: data.data.staff.createdAt,
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
                    onChange={(value) => setBulkCompanyId(value as string)}
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
                  <Label>Company Plan (Optional)</Label>
                  <Select
                    options={bulkCompanyPlans.map((p) => ({
                      value: p.id,
                      label: p.name,
                    }))}
                    placeholder="Select company plan"
                    onChange={(value) => setBulkCompanyPlanId(value as string)}
                    defaultValue={bulkCompanyPlanId}
                  />
                </div>

                <div className="col-span-2">
                  <Label>CSV File *</Label>
                  <FileInput
                    accept=".csv,.xlsx,.xls"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      if (e.target.files && e.target.files[0]) {
                        setBulkFile(e.target.files[0]);
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Supported formats: CSV, XLSX, XLS
                  </p>
                </div>

                <div className="col-span-2 flex items-center justify-between gap-3 pt-4">
                  <button
                    type="button"
                    onClick={downloadSampleTemplate}
                    className="px-4 py-2 rounded border border-brand-500 text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10"
                  >
                    📥 Download Sample Template
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
                  <Label>Staff ID *</Label>
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
                  <Label>Email *</Label>
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
                  <Label htmlFor="phone">Phone Number *</Label>
                  <PhoneInput
                    selectPosition="start"
                    countries={countries}
                    placeholder="+1 (555) 000-0000"
                    defaultValue={phoneNumber}
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
                  <Label>Company Plan</Label>
                  <Select
                    options={companyPlans.map((p) => ({
                      value: p.id,
                      label: p.name,
                    }))}
                    placeholder="Select company plan"
                    onChange={(value) => setCompanyPlanId(value as string)}
                    defaultValue={companyPlanId}
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

      <ErrorModal
        message={errorMessage}
        errorModal={errorModal}
        handleErrorClose={handleErrorClose}
      />
    </div>
  );
}
