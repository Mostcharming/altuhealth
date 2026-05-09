"use client";

import DatePicker from "@/components/form/date-picker";
import PhoneInput from "@/components/form/group-input/PhoneInput";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import {
  createCompanySubsidiary,
  updateCompanySubsidiary,
} from "@/lib/apis/companySubsidiary";
import {
  banksByCountry,
  countries,
  statesByCountry,
} from "@/lib/data/countries";
import {
  CompanySubsidiary,
  useCompanySubsidiaryStore,
} from "@/lib/store/companySubsidiaryStore";
import { ChangeEvent, useEffect, useMemo, useState } from "react";

interface EditCompanySubsidiaryProps {
  isOpen: boolean;
  closeModal: () => void;
  subsidiary?: CompanySubsidiary | null;
  companyId: string;
  onSuccess?: () => void;
}

const countryList = [
  { code: "US", label: "United States" },
  { code: "CA", label: "Canada" },
  { code: "GB", label: "United Kingdom" },
  { code: "AU", label: "Australia" },
  { code: "IN", label: "India" },
  { code: "NG", label: "Nigeria" },
  { code: "DE", label: "Germany" },
  { code: "FR", label: "France" },
  { code: "ES", label: "Spain" },
  { code: "IT", label: "Italy" },
  { code: "BR", label: "Brazil" },
  { code: "MX", label: "Mexico" },
  { code: "CN", label: "China" },
  { code: "JP", label: "Japan" },
  { code: "ZA", label: "South Africa" },
];

const countryOptions = countries;

export default function EditCompanySubsidiary({
  isOpen,
  closeModal,
  subsidiary,
  companyId,
  onSuccess,
}: EditCompanySubsidiaryProps) {
  const [loading, setLoading] = useState(false);
  const errorModal = useModal();
  const successModal = useModal();

  const [id, setId] = useState<string>("");
  const [name, setName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [secondaryPhoneNumber, setSecondaryPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [website, setWebsite] = useState("");
  const [industryType, setIndustryType] = useState("");
  const [numberOfEmployees, setNumberOfEmployees] = useState<
    number | undefined
  >(undefined);
  const [contactPersonName, setContactPersonName] = useState("");
  const [contactPersonTitle, setContactPersonTitle] = useState("");
  const [contactPersonEmail, setContactPersonEmail] = useState("");
  const [contactPersonPhoneNumber, setContactPersonPhoneNumber] = useState("");
  const [taxIdentificationNumber, setTaxIdentificationNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [subsidiaryType, setSubsidiaryType] = useState("");
  const [establishmentDate, setEstablishmentDate] = useState("");
  const [operatingLicense, setOperatingLicense] = useState("");
  const [licenseExpiryDate, setLicenseExpiryDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [errorMessage, setErrorMessage] = useState(
    "Failed to save company subsidiary. Please try again."
  );

  const updateSubsidiaryStore = useCompanySubsidiaryStore(
    (s) => s.updateSubsidiary
  );
  const addSubsidiaryStore = useCompanySubsidiaryStore((s) => s.addSubsidiary);

  const subsidiaryTypeOptions = [
    { value: "branch", label: "Branch" },
    { value: "office", label: "Office" },
    { value: "warehouse", label: "Warehouse" },
    { value: "plant", label: "Plant" },
  ];

  const availableStates = useMemo(
    () =>
      country
        ? statesByCountry[country as keyof typeof statesByCountry] || []
        : [],
    [country]
  );

  const availableBanks = useMemo(
    () =>
      country
        ? banksByCountry[country as keyof typeof banksByCountry] || []
        : [],
    [country]
  );

  const handleSuccessClose = () => {
    successModal.closeModal();
    closeModal();
    onSuccess?.();
  };

  const handleErrorClose = () => {
    errorModal.closeModal();
  };

  useEffect(() => {
    if (isOpen && subsidiary) {
      setId(subsidiary.id ?? "");
      setName(subsidiary.name ?? "");
      setRegistrationNumber(subsidiary.registrationNumber ?? "");
      setEmail(subsidiary.email ?? "");
      setPhoneNumber(subsidiary.phoneNumber ?? "");
      setSecondaryPhoneNumber(subsidiary.secondaryPhoneNumber ?? "");
      setAddress(subsidiary.address ?? "");
      setCity(subsidiary.city ?? "");
      setState(subsidiary.state ?? "");
      setCountry(subsidiary.country ?? "");
      setZipCode(subsidiary.zipCode ?? "");
      setWebsite(subsidiary.website ?? "");
      setIndustryType(subsidiary.industryType ?? "");
      setNumberOfEmployees(subsidiary.numberOfEmployees);
      setContactPersonName(subsidiary.contactPersonName ?? "");
      setContactPersonTitle(subsidiary.contactPersonTitle ?? "");
      setContactPersonEmail(subsidiary.contactPersonEmail ?? "");
      setContactPersonPhoneNumber(subsidiary.contactPersonPhoneNumber ?? "");
      setTaxIdentificationNumber(subsidiary.taxIdentificationNumber ?? "");
      setBankName(subsidiary.bankName ?? "");
      setBankAccountNumber(subsidiary.bankAccountNumber ?? "");
      setBankCode(subsidiary.bankCode ?? "");
      setSubsidiaryType(subsidiary.subsidiaryType ?? "");
      setEstablishmentDate(subsidiary.establishmentDate ?? "");
      setOperatingLicense(subsidiary.operatingLicense ?? "");
      setLicenseExpiryDate(subsidiary.licenseExpiryDate ?? "");
      setIsActive(subsidiary.isActive ?? true);
    }

    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, subsidiary]);

  const resetForm = () => {
    setId("");
    setName("");
    setRegistrationNumber("");
    setEmail("");
    setPhoneNumber("");
    setSecondaryPhoneNumber("");
    setAddress("");
    setCity("");
    setState("");
    setCountry("");
    setZipCode("");
    setWebsite("");
    setIndustryType("");
    setNumberOfEmployees(undefined);
    setContactPersonName("");
    setContactPersonTitle("");
    setContactPersonEmail("");
    setContactPersonPhoneNumber("");
    setTaxIdentificationNumber("");
    setBankName("");
    setBankAccountNumber("");
    setBankCode("");
    setSubsidiaryType("");
    setEstablishmentDate("");
    setOperatingLicense("");
    setLicenseExpiryDate("");
    setIsActive(true);
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setErrorMessage("Subsidiary name is required.");
      return false;
    }
    if (!email.trim()) {
      setErrorMessage("Email is required.");
      return false;
    }
    if (!phoneNumber.trim()) {
      setErrorMessage("Phone number is required.");
      return false;
    }
    if (!address.trim()) {
      setErrorMessage("Address is required.");
      return false;
    }
    if (!city.trim()) {
      setErrorMessage("City is required.");
      return false;
    }
    if (!state.trim()) {
      setErrorMessage("State is required.");
      return false;
    }
    if (!country.trim()) {
      setErrorMessage("Country is required.");
      return false;
    }
    if (!contactPersonName.trim()) {
      setErrorMessage("Contact person name is required.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) {
        errorModal.openModal();
        return;
      }

      setLoading(true);

      const payload = {
        name: name.trim(),
        registrationNumber: registrationNumber.trim() || undefined,
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        secondaryPhoneNumber: secondaryPhoneNumber.trim() || undefined,
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        country: country.trim(),
        zipCode: zipCode.trim() || undefined,
        website: website.trim() || undefined,
        industryType: industryType.trim() || undefined,
        numberOfEmployees: numberOfEmployees || undefined,
        contactPersonName: contactPersonName.trim(),
        contactPersonTitle: contactPersonTitle.trim() || undefined,
        contactPersonEmail: contactPersonEmail.trim() || undefined,
        contactPersonPhoneNumber: contactPersonPhoneNumber.trim() || undefined,
        taxIdentificationNumber: taxIdentificationNumber.trim() || undefined,
        bankName: bankName.trim() || undefined,
        bankAccountNumber: bankAccountNumber.trim() || undefined,
        bankCode: bankCode.trim() || undefined,
        subsidiaryType: subsidiaryType || "branch",
        establishmentDate: establishmentDate || undefined,
        operatingLicense: operatingLicense.trim() || undefined,
        licenseExpiryDate: licenseExpiryDate || undefined,
      };

      if (subsidiary) {
        await updateCompanySubsidiary(id, {
          ...payload,
          isActive,
        });
        updateSubsidiaryStore(id, {
          ...payload,
          isActive,
        });
      } else {
        const data = await createCompanySubsidiary({
          ...payload,
          companyId,
          isActive: true,
        } as Parameters<typeof createCompanySubsidiary>[0]);
        if (data?.data?.subsidiary) {
          addSubsidiaryStore(data.data.subsidiary);
        }
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
    <>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[1000px] p-5 lg:p-10 m-4"
      >
        <div className="px-2">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {subsidiary
              ? "Edit Company Subsidiary"
              : "Create New Company Subsidiary"}
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            {subsidiary
              ? "Update the subsidiary details below."
              : "Fill in the details below to create a new company subsidiary."}
          </p>
        </div>

        <form className="flex flex-col">
          <div className="custom-scrollbar h-[350px] sm:h-[450px] overflow-y-auto px-2">
            {/* Basic Information */}
            <div className="mb-6">
              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Basic Information
              </h5>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Subsidiary Name *</Label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setName(e.target.value)
                    }
                    placeholder="Enter subsidiary name"
                  />
                </div>

                <div>
                  <Label>Registration Number</Label>
                  <Input
                    type="text"
                    value={registrationNumber}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setRegistrationNumber(e.target.value)
                    }
                    placeholder="Enter registration number"
                  />
                </div>

                <div>
                  <Label>Subsidiary Type</Label>
                  <Select
                    options={subsidiaryTypeOptions}
                    placeholder="Select type"
                    onChange={(val) => setSubsidiaryType(val)}
                    defaultValue={subsidiaryType}
                  />
                </div>

                <div>
                  <DatePicker
                    id="establishment-date-picker"
                    label="Establishment Date"
                    placeholder="Select date"
                    defaultDate={establishmentDate}
                    onChange={(dates, currentDateString) => {
                      setEstablishmentDate(currentDateString);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-6">
              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Contact Information
              </h5>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setEmail(e.target.value)
                    }
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <Label>Phone Number *</Label>
                  <PhoneInput
                    selectPosition="start"
                    countries={countryList}
                    placeholder="+1 (555) 000-0000"
                    //defaultValue={phoneNumber}
                    onChange={setPhoneNumber}
                  />
                </div>

                <div>
                  <Label>Secondary Phone Number</Label>
                  <PhoneInput
                    selectPosition="start"
                    countries={countryList}
                    placeholder="+1 (555) 000-0000"
                    //defaultValue={phoneNumber}
                    onChange={setSecondaryPhoneNumber}
                  />
                </div>

                <div>
                  <Label>Website</Label>
                  <Input
                    type="url"
                    value={website}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setWebsite(e.target.value)
                    }
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="mb-6">
              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Address Information
              </h5>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="col-span-2">
                  <Label>Address *</Label>
                  <Input
                    type="text"
                    value={address}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setAddress(e.target.value)
                    }
                    placeholder="Enter address"
                  />
                </div>

                <div>
                  <Label>City *</Label>
                  <Input
                    type="text"
                    value={city}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setCity(e.target.value)
                    }
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <Label>State/Province *</Label>
                  <Select
                    options={
                      availableStates.length > 0
                        ? availableStates
                        : [{ value: "", label: "Select country first" }]
                    }
                    placeholder="Select state"
                    onChange={(value: string) => setState(value)}
                    defaultValue={state}
                  />
                </div>

                <div>
                  <Label>Country *</Label>
                  <Select
                    options={countryOptions}
                    placeholder="Select country"
                    onChange={(val) => {
                      setCountry(val);
                      setState("");
                      setBankName("");
                    }}
                    defaultValue={country}
                  />
                </div>

                <div>
                  <Label>Zip Code</Label>
                  <Input
                    type="text"
                    value={zipCode}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setZipCode(e.target.value)
                    }
                    placeholder="Enter zip code"
                  />
                </div>
              </div>
            </div>

            {/* Contact Person Information */}
            <div className="mb-6">
              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Contact Person
              </h5>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Contact Person Name *</Label>
                  <Input
                    type="text"
                    value={contactPersonName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setContactPersonName(e.target.value)
                    }
                    placeholder="Enter contact person name"
                  />
                </div>

                <div>
                  <Label>Contact Person Title</Label>
                  <Input
                    type="text"
                    value={contactPersonTitle}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setContactPersonTitle(e.target.value)
                    }
                    placeholder="Enter title"
                  />
                </div>

                <div>
                  <Label>Contact Person Email</Label>
                  <Input
                    type="email"
                    value={contactPersonEmail}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setContactPersonEmail(e.target.value)
                    }
                    placeholder="Enter email"
                  />
                </div>

                <div>
                  <Label>Contact Person Phone</Label>
                  <PhoneInput
                    selectPosition="start"
                    countries={countryList}
                    placeholder="+1 (555) 000-0000"
                    //defaultValue={contactPersonPhoneNumber}
                    onChange={setContactPersonPhoneNumber}
                  />
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="mb-6">
              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Business Information
              </h5>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Industry Type</Label>
                  <Input
                    type="text"
                    value={industryType}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setIndustryType(e.target.value)
                    }
                    placeholder="Enter industry type"
                  />
                </div>

                <div>
                  <Label>Number of Employees</Label>
                  <Input
                    type="number"
                    value={numberOfEmployees || ""}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setNumberOfEmployees(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    placeholder="Enter number of employees"
                  />
                </div>

                <div>
                  <Label>Tax ID Number</Label>
                  <Input
                    type="text"
                    value={taxIdentificationNumber}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setTaxIdentificationNumber(e.target.value)
                    }
                    placeholder="Enter tax ID"
                  />
                </div>
              </div>
            </div>

            {/* Banking Information */}
            <div className="mb-6">
              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Banking Information
              </h5>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Bank Name</Label>
                  <Select
                    options={
                      availableBanks.length > 0
                        ? availableBanks
                        : [{ value: "", label: "Select country first" }]
                    }
                    placeholder="Select bank"
                    onChange={(value: string) => setBankName(value)}
                    defaultValue={bankName}
                  />
                </div>

                <div>
                  <Label>Bank Account Number</Label>
                  <Input
                    type="text"
                    value={bankAccountNumber}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setBankAccountNumber(e.target.value)
                    }
                    placeholder="Enter account number"
                  />
                </div>

                <div>
                  <Label>Bank Code</Label>
                  <Input
                    type="text"
                    value={bankCode}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setBankCode(e.target.value)
                    }
                    placeholder="Enter bank code"
                  />
                </div>
              </div>
            </div>

            {/* License Information */}
            <div className="mb-6">
              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                License Information
              </h5>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Operating License</Label>
                  <Input
                    type="text"
                    value={operatingLicense}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setOperatingLicense(e.target.value)
                    }
                    placeholder="Enter operating license number"
                  />
                </div>

                <div>
                  <DatePicker
                    id="license-expiry-date-picker"
                    label="License Expiry Date"
                    placeholder="Select date"
                    defaultDate={licenseExpiryDate}
                    onChange={(dates, currentDateString) => {
                      setLicenseExpiryDate(currentDateString);
                    }}
                  />
                </div>
              </div>
            </div>

            {subsidiary && (
              <div className="mb-6">
                <Label>Status</Label>
                <Select
                  options={[
                    { value: "true", label: "Active" },
                    { value: "false", label: "Inactive" },
                  ]}
                  placeholder="Select status"
                  onChange={(val) => setIsActive(val === "true")}
                  defaultValue={isActive ? "true" : "false"}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-2 pt-6 dark:border-gray-800">
            <button
              type="button"
              onClick={closeModal}
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
            >
              {loading ? "Saving..." : subsidiary ? "Update" : "Create"}
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
