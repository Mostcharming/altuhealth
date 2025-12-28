"use client";

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
  banksByCountry,
  countries,
  lgasByState,
  statesByCountry,
} from "@/lib/data/countries";
import { useProviderSpecializationStore } from "@/lib/store/providerSpecializationStore";
import { useProviderStore } from "@/lib/store/providerStore";
import { User, useUserStore } from "@/lib/store/userStore";
import { ChangeEvent, useEffect, useMemo, useState } from "react";

export default function PageMetricsProviders({}: // buttonText,
{
  buttonText?: string;
}) {
  const {
    isOpen,
    // openModal

    closeModal,
  } = useModal();
  const [loading, setLoading] = useState(false);

  const errorModal = useModal();
  const successModal = useModal();

  // stores
  const addProvider = useProviderStore((s) => s.addProvider);
  const setProviderSpecializations = useProviderSpecializationStore(
    (s) => s.setProviderSpecializations
  );
  const setUsers = useUserStore((s) => s.setUsers);
  const users = useUserStore((s) => s.users);

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

  // Fetch provider specializations and users from API when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchProviderSpecializations = async () => {
        try {
          const data = await apiClient(
            "/admin/provider-specializations/list?limit=all",
            {
              method: "GET",
            }
          );

          const items =
            data?.data?.list && Array.isArray(data.data.list)
              ? data.data.list
              : Array.isArray(data)
              ? data
              : [];

          setProviderSpecializations(items);
        } catch (err) {
          console.warn("Failed to fetch provider specializations", err);
        }
      };

      const fetchUsers = async () => {
        try {
          const data = await apiClient("/admin/admins/list?limit=all", {
            method: "GET",
          });

          const items: User[] =
            data?.data?.list && Array.isArray(data.data.list)
              ? data.data.list
              : Array.isArray(data)
              ? data
              : [];

          setUsers(items);
        } catch (err) {
          console.warn("Failed to fetch users", err);
        }
      };

      fetchProviderSpecializations();
      fetchUsers();
    }
  }, [setProviderSpecializations, setUsers]);

  // form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [secondaryPhoneNumber, setSecondaryPhoneNumber] = useState("");
  const [website, setWebsite] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
  const [address, setAddress] = useState("");
  const [providerArea, setProviderArea] = useState("");
  const [bank, setBank] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankBranch, setBankBranch] = useState("");
  const [paymentBatch, setPaymentBatch] = useState("");
  const [managerId, setManagerId] = useState("");
  const [providerSpecializationId, setProviderSpecializationId] = useState("");
  const [errorMessage, setErrorMessage] = useState(
    "Failed to create provider. Please try again."
  );

  const handlePhoneChange = (val: string) => {
    setPhoneNumber(val ?? "");
  };

  const handleSecondaryPhoneChange = (val: string) => {
    setSecondaryPhoneNumber(val ?? "");
  };

  const resetForm = () => {
    setName("");
    setCategory("");
    setEmail("");
    setPhoneNumber("");
    setSecondaryPhoneNumber("");
    setWebsite("");
    setCountry("");
    setState("");
    setLga("");
    setAddress("");
    setProviderArea("");
    setBank("");
    setAccountName("");
    setAccountNumber("");
    setBankBranch("");
    setPaymentBatch("");
    setManagerId("");
    setProviderSpecializationId("");
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
      if (!name) {
        setErrorMessage("Provider name is required.");
        errorModal.openModal();
        return;
      }
      if (!category) {
        setErrorMessage("Provider category is required.");
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
      if (!country) {
        setErrorMessage("Country is required.");
        errorModal.openModal();
        return;
      }
      if (!state) {
        setErrorMessage("State is required.");
        errorModal.openModal();
        return;
      }
      if (!lga) {
        setErrorMessage("LGA is required.");
        errorModal.openModal();
        return;
      }
      if (!address) {
        setErrorMessage("Address is required.");
        errorModal.openModal();
        return;
      }
      if (!bank) {
        setErrorMessage("Bank is required.");
        errorModal.openModal();
        return;
      }
      if (!accountName) {
        setErrorMessage("Account name is required.");
        errorModal.openModal();
        return;
      }
      if (!accountNumber) {
        setErrorMessage("Account number is required.");
        errorModal.openModal();
        return;
      }
      if (!bankBranch) {
        setErrorMessage("Bank branch is required.");
        errorModal.openModal();
        return;
      }
      // if (!paymentBatch) {
      //   setErrorMessage("Payment batch is required.");
      //   errorModal.openModal();
      //   return;
      // }
      if (!providerSpecializationId) {
        setErrorMessage("Provider specialization is required.");
        errorModal.openModal();
        return;
      }

      setLoading(true);

      const payload = {
        name: name.trim(),
        category,
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        secondaryPhoneNumber: secondaryPhoneNumber.trim() || null,
        website: website.trim() || null,
        country,
        state,
        lga,
        address: address.trim(),
        providerArea: providerArea.trim() || null,
        bank,
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim(),
        bankBranch: bankBranch.trim(),
        paymentBatch,
        managerId: managerId || null,
        providerSpecializationId,
      };

      const data = await apiClient("/admin/providers", {
        method: "POST",
        body: payload,
        onLoading: (l: boolean) => setLoading(l),
      });

      // if backend returns created provider object, add it to store
      if (data?.data?.provider) {
        addProvider({
          ...data.data.provider,
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

  const categoryOptions = [
    { value: "primary", label: "Primary" },
    { value: "secondary", label: "Secondary" },
    { value: "tertiary", label: "Tertiary" },
    { value: "specialized", label: "Specialized" },
  ];

  // const paymentBatchOptions = [
  //   { value: "batch_a", label: "Batch A" },
  //   { value: "batch_b", label: "Batch B" },
  //   { value: "batch_c", label: "Batch C" },
  //   { value: "batch_d", label: "Batch D" },
  // ];

  const providerSpecializations = useProviderSpecializationStore(
    (s) => s.providerSpecializations
  );

  const specializationOptions = useMemo(
    () =>
      providerSpecializations.map((p) => ({
        value: p.id,
        label: p.name,
      })),
    [providerSpecializations]
  );

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

  const availableBanks = useMemo(
    () =>
      country
        ? banksByCountry[country as keyof typeof banksByCountry] || []
        : [],
    [country]
  );

  const managerOptions = useMemo(
    () =>
      users.map((u) => ({
        value: u.id,
        label: `${u.firstName} ${u.lastName}`,
      })),
    [users]
  );

  return (
    <div className="p-4 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className=" flex items-center justify-between">
        <div></div>
        {/* <div>
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
        </div> */}
      </div>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[900px] p-5 lg:p-10 m-4"
      >
        <div className="px-2">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Add a new provider
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Fill in the details below to create a new provider.
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
              {/* Provider Name */}
              <div>
                <Label>Provider Name*</Label>
                <Input
                  type="text"
                  placeholder="Enter provider name"
                  value={name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setName(e.target.value)
                  }
                />
              </div>

              {/* Category */}
              <div>
                <Label>Category*</Label>
                <Select
                  options={categoryOptions}
                  placeholder="Select category"
                  onChange={(value: string) => setCategory(value)}
                  defaultValue=""
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

              {/* Secondary Phone Number */}
              <div>
                <Label>Secondary Phone Number</Label>
                <PhoneInput
                  selectPosition="start"
                  countries={phoneCountries}
                  placeholder="+1 (555) 000-0000"
                  onChange={handleSecondaryPhoneChange}
                  defaultValue={secondaryPhoneNumber}
                />
              </div>

              {/* Website */}
              <div>
                <Label>Website</Label>
                <Input
                  type="url"
                  placeholder="Enter website URL"
                  value={website}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setWebsite(e.target.value)
                  }
                />
              </div>

              {/* Country */}
              <div>
                <Label>Country*</Label>
                <Select
                  options={countries}
                  placeholder="Select country"
                  onChange={(value: string) => {
                    setCountry(value);
                    setState("");
                    setLga("");
                    setBank("");
                  }}
                  defaultValue={country}
                />
              </div>

              {/* State */}
              <div>
                <Label>State*</Label>
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
                <Label>LGA*</Label>
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

              {/* Provider Area */}
              <div>
                <Label>Provider Area</Label>
                <Input
                  type="text"
                  placeholder="Enter provider area"
                  value={providerArea}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setProviderArea(e.target.value)
                  }
                />
              </div>

              {/* Bank */}
              <div>
                <Label>Bank*</Label>
                <Select
                  options={
                    availableBanks.length > 0
                      ? availableBanks
                      : [{ value: "", label: "Select country first" }]
                  }
                  placeholder="Select bank"
                  onChange={(value: string) => setBank(value)}
                  defaultValue={bank}
                />
              </div>

              {/* Account Name */}
              <div>
                <Label>Account Name*</Label>
                <Input
                  type="text"
                  placeholder="Enter account name"
                  value={accountName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setAccountName(e.target.value)
                  }
                />
              </div>

              {/* Account Number */}
              <div>
                <Label>Account Number*</Label>
                <Input
                  type="text"
                  placeholder="Enter account number"
                  value={accountNumber}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setAccountNumber(e.target.value)
                  }
                />
              </div>

              {/* Bank Branch */}
              <div>
                <Label>Bank Branch*</Label>
                <Input
                  type="text"
                  placeholder="Enter bank branch"
                  value={bankBranch}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setBankBranch(e.target.value)
                  }
                />
              </div>

              {/* Payment Batch */}
              {/* <div>
                <Label>Payment Batch*</Label>
                <Select
                  options={paymentBatchOptions}
                  placeholder="Select payment batch"
                  onChange={(value: string) => setPaymentBatch(value)}
                  defaultValue={paymentBatch}
                />
              </div> */}

              {/* Provider Specialization */}
              <div>
                <Label>Provider Specialization*</Label>
                <Select
                  options={specializationOptions}
                  placeholder="Select specialization"
                  onChange={(value: string) =>
                    setProviderSpecializationId(value)
                  }
                  defaultValue={providerSpecializationId}
                />
              </div>

              {/* Manager ID - Optional */}
              <div>
                <Label>Manager</Label>
                <Select
                  options={managerOptions}
                  placeholder="Select manager (optional)"
                  onChange={(value: string) => setManagerId(value)}
                  defaultValue={managerId}
                />
              </div>

              {/* Address - Full Width */}
              <div className="col-span-1 lg:col-span-2">
                <Label>Address*</Label>
                <TextArea
                  placeholder="Enter complete address"
                  value={address}
                  onChange={(value: string) => setAddress(value)}
                  rows={3}
                />
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
                {loading ? "Creating..." : "Create Provider"}
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
