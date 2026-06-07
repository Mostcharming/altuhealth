/* eslint-disable @typescript-eslint/no-explicit-any */
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
  countries,
  lgasByState,
  statesByCountry,
} from "@/lib/data/countries";
import { ChangeEvent, useEffect, useMemo, useState } from "react";

type Props = {
  dependent: any | null;
  isOpen: boolean;
  closeModal: () => void;
  endpoint: string;
  title: string;
  includeLocation?: boolean;
  onSuccess?: (dependent: any) => void;
};

const toDateValue = (value?: string | null) =>
  value ? new Date(value).toISOString().split("T")[0] : "";

export default function EditDependentModal({
  dependent,
  isOpen,
  closeModal,
  endpoint,
  title,
  includeLocation = false,
  onSuccess,
}: Props) {
  const successModal = useModal();
  const errorModal = useModal();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    "Failed to update dependent. Please try again.",
  );

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [relationshipToEnrollee, setRelationshipToEnrollee] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [occupation, setOccupation] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [preexistingMedicalRecords, setPreexistingMedicalRecords] =
    useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
  const [address, setAddress] = useState("");

  const availableStates = useMemo(
    () =>
      country
        ? statesByCountry[country as keyof typeof statesByCountry] || []
        : [],
    [country],
  );

  const availableLgas = useMemo(
    () => (state ? lgasByState[state as keyof typeof lgasByState] || [] : []),
    [state],
  );

  useEffect(() => {
    if (!dependent) return;

    setFirstName(dependent.firstName ?? "");
    setMiddleName(dependent.middleName ?? "");
    setLastName(dependent.lastName ?? "");
    setDateOfBirth(toDateValue(dependent.dateOfBirth));
    setGender(dependent.gender ?? "");
    setRelationshipToEnrollee(
      dependent.relationshipToEnrollee ?? dependent.relationship ?? "",
    );
    setPhoneNumber(dependent.phoneNumber ?? "");
    setOccupation(dependent.occupation ?? "");
    setMaritalStatus(dependent.maritalStatus ?? "");
    setPreexistingMedicalRecords(dependent.preexistingMedicalRecords ?? "");
    setCountry(dependent.country ?? "");
    setState(dependent.state ?? "");
    setLga(dependent.lga ?? "");
    setAddress(dependent.address ?? "");
  }, [dependent]);

  const handleEmailClick = () => {
    setErrorMessage("Reach out to system admin to change the email.");
    errorModal.openModal();
  };

  const handleSubmit = async () => {
    if (!dependent?.id) return;
    if (!firstName.trim()) {
      setErrorMessage("First name is required.");
      errorModal.openModal();
      return;
    }
    if (!lastName.trim()) {
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
      setErrorMessage("Relationship is required.");
      errorModal.openModal();
      return;
    }

    const payload: Record<string, unknown> = {
      firstName: firstName.trim(),
      middleName: middleName.trim() || null,
      lastName: lastName.trim(),
      dateOfBirth,
      gender,
      relationshipToEnrollee,
      phoneNumber: phoneNumber.trim() || null,
      occupation: occupation.trim() || null,
      maritalStatus: maritalStatus || null,
      preexistingMedicalRecords: preexistingMedicalRecords.trim() || null,
    };

    if (includeLocation) {
      payload.country = country || null;
      payload.state = state || null;
      payload.lga = lga || null;
      payload.address = address.trim() || null;
    }

    try {
      setLoading(true);
      const response = await apiClient(`${endpoint}/${dependent.id}/basic-details`, {
        method: "PUT",
        body: payload,
        headers: { "Content-Type": "application/json" },
      });

      const updated = response?.data?.dependent;
      if (updated) onSuccess?.(updated);
      successModal.openModal();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to update dependent.",
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

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[900px] p-5 lg:p-10 m-4"
      >
        <div className="px-2">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {title}
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Update the basic dependent information below.
          </p>
        </div>

        <form
          className="flex flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="custom-scrollbar h-[450px] sm:h-[550px] overflow-y-auto px-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div>
                <Label>First Name *</Label>
                <Input
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
                  value={lastName}
                  placeholder="Enter last name..."
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setLastName(e.target.value)
                  }
                />
              </div>

              <div>
                <DatePicker
                  id={`dependent-dob-${dependent?.id ?? "edit"}`}
                  label="Date of Birth *"
                  placeholder="Select date of birth"
                  defaultDate={dateOfBirth}
                  onChange={(selectedDates) => {
                    if (selectedDates && selectedDates.length > 0) {
                      setDateOfBirth(
                        selectedDates[0].toISOString().split("T")[0],
                      );
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
                  onChange={setGender}
                  defaultValue={gender}
                />
              </div>

              <div>
                <Label>Relationship *</Label>
                <Select
                  options={[
                    { value: "spouse", label: "Spouse" },
                    { value: "child", label: "Child" },
                    { value: "parent", label: "Parent" },
                    { value: "sibling", label: "Sibling" },
                    { value: "other", label: "Other" },
                  ]}
                  placeholder="Select relationship"
                  onChange={setRelationshipToEnrollee}
                  defaultValue={relationshipToEnrollee}
                />
              </div>

              <div onClick={handleEmailClick}>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={dependent?.email ?? ""}
                  disabled
                  hint="Reach out to system admin to change the email."
                />
              </div>

              <div>
                <Label>Phone Number</Label>
                <Input
                  value={phoneNumber}
                  placeholder="Enter phone number..."
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setPhoneNumber(e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Occupation</Label>
                <Input
                  value={occupation}
                  placeholder="Enter occupation..."
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
                  onChange={setMaritalStatus}
                  defaultValue={maritalStatus}
                />
              </div>

              {includeLocation && (
                <>
                  <div>
                    <Label>Country</Label>
                    <Select
                      options={countries}
                      placeholder="Select country"
                      onChange={(value: string) => {
                        setCountry(value);
                        setState("");
                        setLga("");
                      }}
                      defaultValue={country}
                    />
                  </div>

                  <div>
                    <Label>State</Label>
                    <Select
                      options={
                        availableStates.length > 0
                          ? availableStates
                          : [{ value: "", label: "Select country first" }]
                      }
                      placeholder="Select state"
                      onChange={(value: string) => {
                        setState(value);
                        setLga("");
                      }}
                      defaultValue={state}
                    />
                  </div>

                  <div>
                    <Label>LGA</Label>
                    <Select
                      options={
                        availableLgas.length > 0
                          ? availableLgas
                          : [{ value: "", label: "Select state first" }]
                      }
                      placeholder="Select LGA"
                      onChange={setLga}
                      defaultValue={lga}
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <Label>Address</Label>
                    <Input
                      value={address}
                      placeholder="Enter address..."
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setAddress(e.target.value)
                      }
                    />
                  </div>
                </>
              )}

              <div className="lg:col-span-2">
                <Label>Pre-existing Medical Records</Label>
                <TextArea
                  rows={4}
                  value={preexistingMedicalRecords}
                  placeholder="Enter medical records..."
                  onChange={setPreexistingMedicalRecords}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-2 pt-5">
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
        handleErrorClose={() => errorModal.closeModal()}
      />
    </>
  );
}
