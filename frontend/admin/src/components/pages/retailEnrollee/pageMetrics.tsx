/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import DatePicker from "@/components/form/date-picker";
import PhoneInput from "@/components/form/group-input/PhoneInput";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { apiClient } from "@/lib/apiClient";
import { createRetailEnrollee } from "@/lib/apis/retailEnrollee";
import { countries, lgasByState, statesByCountry } from "@/lib/data/countries";
import { Plan, usePlanStore } from "@/lib/store/planStore";
import { useRetailEnrolleeStore } from "@/lib/store/retailEnrolleeStore";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";

export default function PageMetricsRetailEnrollee({
  buttonText,
}: {
  buttonText?: string;
}) {
  const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);

  const errorModal = useModal();
  const successModal = useModal();

  // stores
  const addRetailEnrollee = useRetailEnrolleeStore((s) => s.addRetailEnrollee);
  const plans = usePlanStore((s) => s.plans);
  const setPlans = usePlanStore((s) => s.setPlans);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);

      const url = `/admin/plans/list?limit=all`;

      const response = await apiClient(url, {
        method: "GET",
        onLoading: (l) => setLoading(l),
      });

      const items: Plan[] =
        response?.data?.list && Array.isArray(response.data.list)
          ? response.data.list
          : Array.isArray(response)
          ? response
          : [];

      setPlans(items);
      // Initialize selected IDs from existing provider plans
    } catch (err) {
      console.warn("Role fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [setPlans]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const phoneCountries = [
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

  // form state
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
  const [country, setCountry] = useState("");
  const [maxDependents, setMaxDependents] = useState<number | undefined>();
  const [planId, setPlanId] = useState("");
  const [subscriptionStartDate, setSubscriptionStartDate] = useState("");
  const [subscriptionEndDate, setSubscriptionEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [errorMessage, setErrorMessage] = useState(
    "Failed to create retail enrollee. Please try again."
  );

  const handlePhoneChange = (val: string) => {
    setPhoneNumber(val ?? "");
  };

  const resetForm = () => {
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setDateOfBirth("");
    setGender("male");
    setPhoneNumber("");
    setEmail("");
    setState("");
    setLga("");
    setCountry("");
    setMaxDependents(undefined);
    setPlanId("");
    setSubscriptionStartDate("");
    setSubscriptionEndDate("");
    setIsActive(true);
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
      if (!dateOfBirth) {
        setErrorMessage("Date of birth is required.");
        errorModal.openModal();
        return;
      }
      if (!phoneNumber) {
        setErrorMessage("Phone number is required.");
        errorModal.openModal();
        return;
      }
      if (!email) {
        setErrorMessage("Email is required.");
        errorModal.openModal();
        return;
      }
      if (!planId) {
        setErrorMessage("Plan is required.");
        errorModal.openModal();
        return;
      }
      if (!subscriptionStartDate) {
        setErrorMessage("Subscription start date is required.");
        errorModal.openModal();
        return;
      }

      setLoading(true);

      const payload: any = {
        firstName: firstName.trim(),
        middleName: middleName?.trim() || null,
        lastName: lastName.trim(),
        dateOfBirth,
        gender,
        phoneNumber: phoneNumber.trim(),
        email: email.trim().toLowerCase(),
        state: state || null,
        lga: lga || null,
        country: country || null,
        maxDependents: maxDependents || null,
        planId,
        subscriptionStartDate,
        subscriptionEndDate: subscriptionEndDate || null,
        isActive,
      };

      const response = await createRetailEnrollee(payload);

      if (response?.data?.enrollee) {
        addRetailEnrollee(response.data.enrollee);
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

  const genderOptions = useMemo(
    () => [
      { value: "male", label: "Male" },
      { value: "female", label: "Female" },
      { value: "other", label: "Other" },
    ],
    []
  );

  const planOptions = useMemo(
    () =>
      plans.map((plan) => ({
        value: plan.id,
        label: plan.name,
      })),
    [plans]
  );

  const countryOptions = useMemo(() => countries, []);

  const availableStates = useMemo(
    () =>
      country
        ? statesByCountry[country as keyof typeof statesByCountry] || []
        : [],
    [country]
  );

  const availableLgas = useMemo(
    () => (state ? lgasByState[state as keyof typeof lgasByState] || [] : []),
    [state]
  );

  return (
    <div className="p-4 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
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
            Add a new retail enrollee
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Fill in the details below to create a new retail enrollee.
          </p>
        </div>

        <form
          className="flex flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            handlesubmit();
          }}
        >
          <div className="custom-scrollbar h-auto sm:max-h-[70vh] overflow-y-auto px-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              {/* First Name */}
              <div>
                <Label>First Name*</Label>
                <Input
                  type="text"
                  placeholder="Enter first name"
                  value={firstName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFirstName(e.target.value)
                  }
                />
              </div>

              {/* Middle Name */}
              <div>
                <Label>Middle Name</Label>
                <Input
                  type="text"
                  placeholder="Enter middle name"
                  value={middleName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setMiddleName(e.target.value)
                  }
                />
              </div>

              {/* Last Name */}
              <div>
                <Label>Last Name*</Label>
                <Input
                  type="text"
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setLastName(e.target.value)
                  }
                />
              </div>

              {/* Email */}
              <div>
                <Label>Email*</Label>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                />
              </div>

              {/* Phone Number */}
              <div>
                <Label>Phone Number*</Label>
                <PhoneInput
                  selectPosition="start"
                  countries={phoneCountries}
                  placeholder="+1 (555) 000-0000"
                  onChange={handlePhoneChange}
                  //defaultValue={phoneNumber}
                />
              </div>

              {/* Date of Birth */}
              <div>
                <DatePicker
                  id="dob-retail"
                  label="Date of Birth*"
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

              {/* Gender */}
              <div>
                <Label>Gender*</Label>
                <Select
                  options={genderOptions}
                  placeholder="Select gender"
                  onChange={(value: string) =>
                    setGender(value as "male" | "female" | "other")
                  }
                  defaultValue={gender}
                />
              </div>

              {/* Country */}
              <div>
                <Label>Country</Label>
                <Select
                  options={countryOptions}
                  placeholder="Select country"
                  onChange={(value: string) => {
                    setCountry(value);
                    setState("");
                    setLga("");
                  }}
                  defaultValue={country}
                />
              </div>

              {/* State */}
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

              {/* LGA */}
              <div>
                <Label>LGA</Label>
                <Select
                  options={
                    availableLgas.length > 0
                      ? availableLgas
                      : [{ value: "", label: "Select state first" }]
                  }
                  placeholder="Select LGA"
                  onChange={(value: string) => setLga(value)}
                  defaultValue={lga}
                />
              </div>

              {/* Plan */}
              <div>
                <Label>Plan*</Label>
                <Select
                  options={planOptions}
                  placeholder="Select plan"
                  onChange={(value: string) => setPlanId(value)}
                  defaultValue={planId}
                />
              </div>

              {/* Max Dependents */}
              <div>
                <Label>Max Dependents</Label>
                <Input
                  type="number"
                  placeholder="Enter max dependents"
                  value={maxDependents || ""}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setMaxDependents(
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                />
              </div>

              {/* Subscription Start Date */}
              <div>
                <DatePicker
                  id="subscription-start-retail"
                  label="Subscription Start Date*"
                  placeholder="Select start date"
                  defaultDate={subscriptionStartDate}
                  onChange={(selectedDates) => {
                    if (selectedDates && selectedDates.length > 0) {
                      const date = selectedDates[0];
                      const formattedDate = date.toISOString().split("T")[0];
                      setSubscriptionStartDate(formattedDate);
                    }
                  }}
                />
              </div>

              {/* Subscription End Date */}
              <div>
                <DatePicker
                  id="subscription-end-retail"
                  label="Subscription End Date"
                  placeholder="Select end date"
                  defaultDate={subscriptionEndDate}
                  onChange={(selectedDates) => {
                    if (selectedDates && selectedDates.length > 0) {
                      const date = selectedDates[0];
                      const formattedDate = date.toISOString().split("T")[0];
                      setSubscriptionEndDate(formattedDate);
                    }
                  }}
                />
              </div>

              {/* Active Status */}
              <div className="lg:col-span-2">
                <Label>Active Status</Label>
                <div className="mt-2">
                  <Switch
                    label="Active"
                    defaultChecked={isActive}
                    onChange={setIsActive}
                  />
                </div>
              </div>
            </div>

            <div className="col-span-2 flex items-center justify-end gap-3 mt-6">
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
                {loading ? "Creating..." : "Create Enrollee"}
              </button>
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
