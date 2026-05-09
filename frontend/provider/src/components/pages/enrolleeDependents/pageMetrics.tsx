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
import { useEnrolleeDependentStore } from "@/lib/store/enrolleeDependentStore";
import { Enrollee } from "@/lib/store/enrolleeStore";
import { ChangeEvent, useEffect, useState } from "react";

export default function PageMetricsEnrolleeDependents({
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
  const addDependent = useEnrolleeDependentStore((s) => s.addDependent);

  // form state - single dependent
  const [enrolleeId, setEnrolleeId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [relationshipToEnrollee, setRelationshipToEnrollee] = useState<
    "spouse" | "child" | "parent" | "sibling" | "other"
  >("child");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [occupation, setOccupation] = useState("");
  const [maritalStatus, setMaritalStatus] = useState<
    "single" | "married" | "divorced" | "widowed" | "separated" | ""
  >();
  const [preexistingMedicalRecords, setPreexistingMedicalRecords] =
    useState("");
  const [enrollees, setEnrollees] = useState<any[]>([]);

  // form state - bulk upload
  const [bulkEnrolleeId, setBulkEnrolleeId] = useState("");
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkEnrollees, setBulkEnrollees] = useState<any[]>([]);

  const [errorMessage, setErrorMessage] = useState(
    "Failed to save dependent. Please try again."
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

  // Fetch enrollees on modal open
  useEffect(() => {
    if (isOpen) {
      if (isBulkUpload) {
        fetchBulkEnrollees();
      } else {
        fetchEnrollees();
      }
    }
  }, [isOpen, isBulkUpload]);

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

  const fetchBulkEnrollees = async () => {
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
      setBulkEnrollees(items);
    } catch (err) {
      console.warn("Failed to fetch enrollees", err);
    }
  };

  const resetForm = () => {
    setEnrolleeId("");
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setDateOfBirth("");
    setGender("male");
    setRelationshipToEnrollee("child");
    setPhoneNumber("");
    setEmail("");
    setOccupation("");
    setMaritalStatus("");
    setPreexistingMedicalRecords("");
    setBulkEnrolleeId("");
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

  const downloadSampleTemplate = () => {
    const sampleData = [
      {
        firstName: "Sarah",
        middleName: "Marie",
        lastName: "Doe",
        dateOfBirth: "2010-05-15",
        gender: "female",
        relationshipToEnrollee: "child",
        phoneNumber: "+1234567890",
        email: "sarah.doe@example.com",
        occupation: "Student",
        maritalStatus: "single",
        preexistingMedicalRecords: "None",
      },
      {
        firstName: "Robert",
        middleName: "James",
        lastName: "Smith",
        dateOfBirth: "1988-10-20",
        gender: "male",
        relationshipToEnrollee: "spouse",
        phoneNumber: "+1234567891",
        email: "robert.smith@example.com",
        occupation: "Engineer",
        maritalStatus: "married",
        preexistingMedicalRecords: "Hypertension",
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
    a.download = "dependent_bulk_upload_template.csv";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleBulkUpload = async () => {
    try {
      if (!bulkEnrolleeId) {
        setErrorMessage("Enrollee is required for bulk upload.");
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
      formData.append("enrolleeId", bulkEnrolleeId);

      const data = await apiClient("/admin/enrollee-dependents/bulk/create", {
        method: "POST",
        formData,
        onLoading: (l: boolean) => setLoading(l),
      });

      if (data?.data?.dependents && Array.isArray(data.data.dependents)) {
        data.data.dependents.forEach((dependent: any) => {
          addDependent(dependent);
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
      if (!enrolleeId) {
        setErrorMessage("Enrollee is required.");
        errorModal.openModal();
        return;
      }
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
      if (!dateOfBirth) {
        setErrorMessage("Date of birth is required.");
        errorModal.openModal();
        return;
      }
      if (!gender) {
        setErrorMessage("Gender is required.");
        errorModal.openModal();
        return;
      }
      if (!relationshipToEnrollee) {
        setErrorMessage("Relationship to enrollee is required.");
        errorModal.openModal();
        return;
      }

      setLoading(true);

      const payload: any = {
        enrolleeId,
        firstName: firstName.trim(),
        middleName: middleName.trim() || undefined,
        lastName: lastName.trim(),
        dateOfBirth,
        gender,
        relationshipToEnrollee,
        phoneNumber: phoneNumber.trim() || undefined,
        email: email.trim() || undefined,
        occupation: occupation.trim() || undefined,
        maritalStatus: maritalStatus || undefined,
        preexistingMedicalRecords:
          preexistingMedicalRecords.trim() || undefined,
      };

      const data = await apiClient("/admin/enrollee-dependents", {
        method: "POST",
        body: payload,
        onLoading: (l: boolean) => setLoading(l),
      });

      if (data?.data?.dependent) {
        addDependent(data.data.dependent);
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
                {isBulkUpload
                  ? "Bulk Upload Dependents"
                  : "Add a new Dependent"}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isBulkUpload
                  ? "Upload multiple dependents at once using a CSV file."
                  : "Fill in the details below to add a new dependent."}
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
            <div className="custom-scrollbar h-[350px] sm:h-[450px] overflow-y-auto px-2">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Enrollee *</Label>
                  <Select
                    options={bulkEnrollees.map((e) => ({
                      value: e.id,
                      label: `${e.firstName} ${e.lastName} (${e.policyNumber})`,
                    }))}
                    placeholder="Select enrollee"
                    onChange={(value) => setBulkEnrolleeId(value as string)}
                    defaultValue={bulkEnrolleeId}
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
                      {loading ? "Uploading..." : "Upload Dependents"}
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
                  <Label>Enrollee *</Label>
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

                <div>
                  <Label>First Name *</Label>
                  <Input
                    type="text"
                    placeholder="Enter first name..."
                    value={firstName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFirstName(e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label>Middle Name</Label>
                  <Input
                    type="text"
                    placeholder="Enter middle name..."
                    value={middleName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setMiddleName(e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label>Last Name *</Label>
                  <Input
                    type="text"
                    placeholder="Enter last name..."
                    value={lastName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setLastName(e.target.value)
                    }
                  />
                </div>

                <div>
                  <DatePicker
                    id="dob-create"
                    label="Date of Birth *"
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
                  <Label>Gender *</Label>
                  <Select
                    options={[
                      { value: "male", label: "Male" },
                      { value: "female", label: "Female" },
                      { value: "other", label: "Other" },
                    ]}
                    placeholder="Select gender"
                    onChange={(value) =>
                      setGender(value as "male" | "female" | "other")
                    }
                    defaultValue={gender}
                  />
                </div>

                <div>
                  <Label>Relationship to Enrollee *</Label>
                  <Select
                    options={[
                      { value: "spouse", label: "Spouse" },
                      { value: "child", label: "Child" },
                      { value: "parent", label: "Parent" },
                      { value: "sibling", label: "Sibling" },
                      { value: "other", label: "Other" },
                    ]}
                    placeholder="Select relationship"
                    onChange={(value) =>
                      setRelationshipToEnrollee(
                        value as
                          | "spouse"
                          | "child"
                          | "parent"
                          | "sibling"
                          | "other"
                      )
                    }
                    defaultValue={relationshipToEnrollee}
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
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="Enter email address..."
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setEmail(e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label>Occupation</Label>
                  <Input
                    type="text"
                    placeholder="Enter occupation..."
                    value={occupation}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setOccupation(e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label>Marital Status</Label>
                  <Select
                    options={[
                      { value: "single", label: "Single" },
                      { value: "married", label: "Married" },
                      { value: "divorced", label: "Divorced" },
                      { value: "widowed", label: "Widowed" },
                      { value: "separated", label: "Separated" },
                    ]}
                    placeholder="Select marital status"
                    onChange={(value) =>
                      setMaritalStatus(
                        value as
                          | "single"
                          | "married"
                          | "divorced"
                          | "widowed"
                          | "separated"
                          | ""
                      )
                    }
                    defaultValue={maritalStatus}
                  />
                </div>

                <div className="col-span-2">
                  <Label>Pre-existing Medical Records</Label>
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
                    {loading ? "Creating..." : "Create Dependent"}
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
