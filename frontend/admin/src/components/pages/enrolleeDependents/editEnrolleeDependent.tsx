/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import DatePicker from "@/components/form/date-picker";
import PhoneInput from "@/components/form/group-input/PhoneInput";
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
  EnrolleeDependent,
  useEnrolleeDependentStore,
} from "@/lib/store/enrolleeDependentStore";
import { ChangeEvent, useEffect, useState } from "react";

interface EditEnrolleeDependentProps {
  isOpen: boolean;
  closeModal: () => void;
  dependent?: EnrolleeDependent | null;
}

export default function EditEnrolleeDependent({
  isOpen,
  closeModal,
  dependent,
}: EditEnrolleeDependentProps) {
  const [loading, setLoading] = useState(false);
  const errorModal = useModal();
  const successModal = useModal();
  const [id, setId] = useState<string>("");
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
  const [isActive, setIsActive] = useState(true);
  const [enrollees, setEnrollees] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState(
    "Failed to save dependent. Please try again."
  );

  const updateDependent = useEnrolleeDependentStore((s) => s.updateDependent);

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

  useEffect(() => {
    if (isOpen) {
      fetchEnrollees();
    }
  }, [isOpen]);

  const fetchEnrollees = async () => {
    try {
      const data = await apiClient("/admin/enrollees/list?limit=all", {
        method: "GET",
      });
      const enrolleesList = data?.data?.list || [];
      setEnrollees(enrolleesList);
    } catch (err) {
      console.warn("Failed to fetch enrollees", err);
    }
  };

  // When the modal opens with a dependent, populate the form with their data.
  useEffect(() => {
    if (isOpen && dependent) {
      setId(dependent.id ?? "");
      setEnrolleeId(dependent.enrolleeId ?? "");
      setFirstName(dependent.firstName ?? "");
      setMiddleName(dependent.middleName ?? "");
      setLastName(dependent.lastName ?? "");
      setDateOfBirth(
        dependent.dateOfBirth ? dependent.dateOfBirth.split("T")[0] : ""
      );
      setGender(dependent.gender ?? "male");
      setRelationshipToEnrollee(dependent.relationshipToEnrollee ?? "child");
      setPhoneNumber(dependent.phoneNumber ?? "");
      setEmail(dependent.email ?? "");
      setOccupation(dependent.occupation ?? "");
      setMaritalStatus(dependent.maritalStatus ?? "");
      setPreexistingMedicalRecords(dependent.preexistingMedicalRecords ?? "");
      setIsActive(dependent.isActive ?? true);
    }

    if (!isOpen) {
      setId("");
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
      setIsActive(true);
    }
  }, [isOpen, dependent]);

  const handlesubmit = async () => {
    try {
      setLoading(true);

      const payload: any = {
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
        isActive,
      };

      const url = `/admin/enrollee-dependents/${id}`;
      const method = "PUT";

      await apiClient(url, {
        method,
        body: payload,
        onLoading: (l: boolean) => setLoading(l),
      });

      updateDependent(id, {
        firstName,
        middleName: middleName || null,
        lastName,
        dateOfBirth: dateOfBirth || null,
        gender,
        relationshipToEnrollee,
        phoneNumber: phoneNumber || null,
        email: email || null,
        occupation: occupation || null,
        maritalStatus: (maritalStatus as any) || null,
        preexistingMedicalRecords: preexistingMedicalRecords || null,
        isActive,
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

  const handleSuccessClose = () => {
    successModal.closeModal();
    closeModal();
  };

  const handleErrorClose = () => {
    errorModal.closeModal();
    closeModal();
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
            Edit Dependent
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Update the dependent details.
          </p>
        </div>

        <form className="flex flex-col">
          <div className="custom-scrollbar h-[450px] sm:h-[550px] overflow-y-auto px-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div>
                <Label>Enrollee</Label>
                <Select
                  options={enrollees.map((e) => ({
                    value: e.id,
                    label: `${e.firstName} ${e.lastName} (${e.policyNumber})`,
                  }))}
                  placeholder="Select enrollee"
                  onChange={(value) => setEnrolleeId(value as string)}
                  defaultValue={enrolleeId}
                  disabled
                />
              </div>

              <div>
                <Label>First Name</Label>
                <Input
                  type="text"
                  placeholder="First name"
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
                  placeholder="Middle name"
                  value={middleName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setMiddleName(e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Last Name</Label>
                <Input
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setLastName(e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Date of Birth</Label>
                <DatePicker
                  value={dateOfBirth}
                  onChange={(date) => setDateOfBirth(date)}
                />
              </div>

              <div>
                <Label>Gender</Label>
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
                <Label>Relationship to Enrollee</Label>
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
                <Label>Phone Number</Label>
                <PhoneInput
                  selectPosition="start"
                  countries={countries}
                  placeholder="+1 (555) 000-0000"
                  defaultValue={phoneNumber}
                  onChange={handlePhoneChange}
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="Email address"
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
                  placeholder="Occupation"
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

              <div className="lg:col-span-2">
                <Label>Pre-existing Medical Records</Label>
                <TextArea
                  placeholder="Enter any pre-existing medical records..."
                  value={preexistingMedicalRecords}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    setPreexistingMedicalRecords(e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Active Status</Label>
                <Select
                  options={[
                    { value: "true", label: "Active" },
                    { value: "false", label: "Inactive" },
                  ]}
                  placeholder="Select status"
                  onChange={(value) => setIsActive(value === "true")}
                  defaultValue={isActive ? "true" : "false"}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6 px-2 border-t border-gray-200 dark:border-gray-700 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlesubmit}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
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
