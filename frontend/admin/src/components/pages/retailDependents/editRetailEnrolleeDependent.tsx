/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import DatePicker from "@/components/form/date-picker";
import PhoneInput from "@/components/form/group-input/PhoneInput";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { apiClient } from "@/lib/apiClient";
import {
  RetailEnrolleeDependent,
  useRetailEnrolleeDependentStore,
} from "@/lib/store/retailEnrolleeDependentStore";
import { ChangeEvent, useEffect, useState } from "react";

interface EditRetailEnrolleeDependentProps {
  isOpen: boolean;
  closeModal: () => void;
  dependent?: RetailEnrolleeDependent | null;
}

export default function EditRetailEnrolleeDependent({
  isOpen,
  closeModal,
  dependent,
}: EditRetailEnrolleeDependentProps) {
  const [loading, setLoading] = useState(false);
  const errorModal = useModal();
  const successModal = useModal();
  const [id, setId] = useState<string>("");
  const [retailEnrolleeId, setRetailEnrolleeId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [relationship, setRelationship] = useState<
    "spouse" | "child" | "parent" | "sibling" | "other"
  >("child");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [retailEnrollees, setRetailEnrollees] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState(
    "Failed to save dependent. Please try again."
  );

  const updateDependent = useRetailEnrolleeDependentStore(
    (s) => s.updateDependent
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

  useEffect(() => {
    if (isOpen) {
      fetchRetailEnrollees();
    }
  }, [isOpen]);

  const fetchRetailEnrollees = async () => {
    try {
      const data = await apiClient("/admin/retail-enrollees?limit=all", {
        method: "GET",
      });
      const items: any[] =
        data?.data?.enrollees && Array.isArray(data.data.enrollees)
          ? data.data.enrollees
          : Array.isArray(data)
          ? data
          : [];

      setRetailEnrollees(items);
    } catch (err) {
      console.warn("Failed to fetch retail enrollees", err);
    }
  };

  // When the modal opens with a dependent, populate the form with their data.
  useEffect(() => {
    if (isOpen && dependent) {
      setId(dependent.id ?? "");
      setRetailEnrolleeId(dependent.retailEnrolleeId ?? "");
      setFirstName(dependent.firstName ?? "");
      setMiddleName(dependent.middleName ?? "");
      setLastName(dependent.lastName ?? "");
      setDateOfBirth(
        dependent.dateOfBirth ? dependent.dateOfBirth.split("T")[0] : ""
      );
      setGender(dependent.gender ?? "male");
      setRelationship(dependent.relationship ?? "child");
      setPhoneNumber(dependent.phoneNumber ?? "");
      setEmail(dependent.email ?? "");
      setState(dependent.state ?? "");
      setLga(dependent.lga ?? "");
      setCountry(dependent.country ?? "");
      setAddress(dependent.address ?? "");
      setIsActive(dependent.isActive ?? true);
    }

    if (!isOpen) {
      setId("");
      setRetailEnrolleeId("");
      setFirstName("");
      setMiddleName("");
      setLastName("");
      setDateOfBirth("");
      setGender("male");
      setRelationship("child");
      setPhoneNumber("");
      setEmail("");
      setState("");
      setLga("");
      setCountry("");
      setAddress("");
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
        relationship,
        phoneNumber: phoneNumber.trim() || undefined,
        email: email.trim() || undefined,
        state: state.trim() || undefined,
        lga: lga.trim() || undefined,
        country: country.trim() || undefined,
        address: address.trim() || undefined,
        isActive,
      };

      const url = `/admin/retail-enrollee-dependents/${id}`;
      const method = "PUT";

      await apiClient(url, {
        method,
        body: payload,
        onLoading: (l: boolean) => setLoading(l),
      });

      updateDependent(id, {
        firstName,
        middleName: middleName || undefined,
        lastName,
        dateOfBirth: dateOfBirth || undefined,
        gender,
        relationship,
        phoneNumber: phoneNumber || undefined,
        email: email || undefined,
        state: state || undefined,
        lga: lga || undefined,
        country: country || undefined,
        address: address || undefined,
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
          <div className="custom-scrollbar h-[350px] sm:h-[450px] overflow-y-auto px-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div>
                <Label>Retail Enrollee</Label>
                <Select
                  options={retailEnrollees.map((e) => ({
                    value: e.id,
                    label: `${e.firstName} ${e.lastName} (${e.email})`,
                  }))}
                  placeholder="Select retail enrollee"
                  onChange={(value) => setRetailEnrolleeId(value as string)}
                  defaultValue={retailEnrolleeId}
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
                <DatePicker
                  id="dob-edit"
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
                <Label>Relationship</Label>
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
                    setRelationship(
                      value as
                        | "spouse"
                        | "child"
                        | "parent"
                        | "sibling"
                        | "other"
                    )
                  }
                  defaultValue={relationship}
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
                  placeholder="Email address"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Country</Label>
                <Input
                  type="text"
                  placeholder="Country"
                  value={country}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setCountry(e.target.value)
                  }
                />
              </div>

              <div>
                <Label>State</Label>
                <Input
                  type="text"
                  placeholder="State"
                  value={state}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setState(e.target.value)
                  }
                />
              </div>

              <div>
                <Label>LGA</Label>
                <Input
                  type="text"
                  placeholder="Local Government Area"
                  value={lga}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setLga(e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Address</Label>
                <Input
                  type="text"
                  placeholder="Address"
                  value={address}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setAddress(e.target.value)
                  }
                />
              </div>

              <div className="col-span-2 flex items-end">
                <Checkbox
                  label="Is Active"
                  checked={isActive}
                  onChange={(checked) => setIsActive(checked)}
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
              onClick={handlesubmit}
              type="button"
              className="flex justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
            >
              Update Dependent
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
