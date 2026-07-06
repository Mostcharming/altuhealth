/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import DatePicker from "@/components/form/date-picker";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { updateRetailEnrolleeBasicDetails } from "@/lib/apis/retailEnrollee";
import {
  countries,
  lgasByState,
  statesByCountry,
} from "@/lib/data/countries";
import { RetailEnrollee } from "@/lib/store/retailEnrolleeStore";
import { ChangeEvent, useEffect, useMemo, useState } from "react";

type Props = {
  enrollee: RetailEnrollee | any | null;
  isOpen: boolean;
  closeModal: () => void;
  onSuccess?: (enrollee: RetailEnrollee) => void;
};

const toDateValue = (value?: string | null) =>
  value ? new Date(value).toISOString().split("T")[0] : "";

export default function EditRetailEnrolleeModal({
  enrollee,
  isOpen,
  closeModal,
  onSuccess,
}: Props) {
  const successModal = useModal();
  const errorModal = useModal();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    "Failed to update retail enrollee. Please try again.",
  );

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
  const [maxDependents, setMaxDependents] = useState("");

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
    if (!enrollee) return;

    setFirstName(enrollee.firstName ?? "");
    setMiddleName(enrollee.middleName ?? "");
    setLastName(enrollee.lastName ?? "");
    setPhoneNumber(enrollee.phoneNumber ?? "");
    setDateOfBirth(toDateValue(enrollee.dateOfBirth));
    setCountry(enrollee.country ?? "");
    setState(enrollee.state ?? "");
    setLga(enrollee.lga ?? "");
    setMaxDependents(
      enrollee.maxDependents === null || enrollee.maxDependents === undefined
        ? ""
        : String(enrollee.maxDependents),
    );
  }, [enrollee]);

  const handleEmailClick = () => {
    setErrorMessage("Reach out to system admin to change the email.");
    errorModal.openModal();
  };

  const handleSubmit = async () => {
    if (!enrollee?.id) return;
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
    if (!phoneNumber.trim()) {
      setErrorMessage("Phone number is required.");
      errorModal.openModal();
      return;
    }
    if (!dateOfBirth) {
      setErrorMessage("Date of birth is required.");
      errorModal.openModal();
      return;
    }

    try {
      setLoading(true);
      const response = await updateRetailEnrolleeBasicDetails(enrollee.id, {
        firstName: firstName.trim(),
        middleName: middleName.trim() || null,
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        dateOfBirth,
        country: country || null,
        state: state || null,
        lga: lga || null,
        maxDependents: maxDependents ? Number(maxDependents) : null,
      } as Partial<RetailEnrollee>);

      const updated = response?.data?.enrollee;
      if (updated) onSuccess?.(updated);
      successModal.openModal();
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Failed to update retail enrollee.",
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
            Edit Retail Enrollee Details
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Update the basic retail enrollee information below.
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
                  id={`retail-enrollee-dob-${enrollee?.id ?? "edit"}`}
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

              <div onClick={handleEmailClick}>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={enrollee?.email ?? ""}
                  disabled
                  hint="Reach out to system admin to change the email."
                />
              </div>

              <div>
                <Label>Phone Number *</Label>
                <Input
                  value={phoneNumber}
                  placeholder="Enter phone number..."
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setPhoneNumber(e.target.value)
                  }
                />
              </div>

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

              <div>
                <Label>Max Dependents</Label>
                <Input
                  type="number"
                  min="0"
                  value={maxDependents}
                  placeholder="Enter max dependents..."
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setMaxDependents(e.target.value)
                  }
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
