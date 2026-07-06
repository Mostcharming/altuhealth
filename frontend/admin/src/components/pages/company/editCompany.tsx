"use client";

import PhoneInput from "@/components/form/group-input/PhoneInput";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { createCompany, updateCompany } from "@/lib/apis/company";
import { Company, useCompanyStore } from "@/lib/store/companyStore";
import { ChangeEvent, useEffect, useState } from "react";

interface EditCompanyProps {
  isOpen: boolean;
  closeModal: () => void;
  company?: Company | null;
}

export default function EditCompany({
  isOpen,
  closeModal,
  company,
}: EditCompanyProps) {
  const [loading, setLoading] = useState(false);
  const errorModal = useModal();
  const successModal = useModal();
  const [id, setId] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [errorMessage, setErrorMessage] = useState(
    "Failed to save company. Please try again."
  );

  const updateCompanyStore = useCompanyStore((s) => s.updateCompany);
  const addCompanyStore = useCompanyStore((s) => s.addCompany);

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

  const handleSuccessClose = () => {
    successModal.closeModal();
    closeModal();
  };

  const handleErrorClose = () => {
    errorModal.closeModal();
  };

  useEffect(() => {
    if (isOpen && company) {
      setId(company.id ?? "");
      setName(company.name ?? "");
      setEmail(company.email ?? "");
      setPhoneNumber(company.phoneNumber ?? "");
      setIsActive(company.isActive ?? true);
    }

    if (!isOpen) {
      setId("");
      setName("");
      setEmail("");
      setPhoneNumber("");
      setIsActive(true);
    }
  }, [isOpen, company]);

  const handleSubmit = async () => {
    try {
      if (!name.trim()) {
        setErrorMessage("Company name is required.");
        errorModal.openModal();
        return;
      }

      if (!email.trim()) {
        setErrorMessage("Email is required.");
        errorModal.openModal();
        return;
      }

      setLoading(true);

      const payload = {
        name: name.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        ...(company ? { isActive } : {}),
      };

      if (company) {
        // Update existing company
        await updateCompany(id, payload);
        updateCompanyStore(id, payload);
      } else {
        // Create new company
        const data = await createCompany(payload);
        if (data?.data?.company) {
          addCompanyStore(data.data.company);
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
        className="max-w-[900px] p-5 lg:p-10 m-4"
      >
        <div className="px-2">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {company ? "Edit Company" : "Create New Company"}
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            {company
              ? "Update the company details below."
              : "Fill in the details below to create a new company."}
          </p>
        </div>

        <form className="flex flex-col">
          <div className="custom-scrollbar h-auto sm:h-auto overflow-y-auto px-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div className="col-span-2 lg:col-span-1">
                <Label>Company Name</Label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setName(e.target.value)
                  }
                  placeholder="Enter company name"
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter email address"
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Phone Number</Label>
                <PhoneInput
                  selectPosition="start"
                  countries={countries}
                  placeholder="+1 (555) 000-0000"
                  //defaultValue={phoneNumber}
                  onChange={handlePhoneChange}
                />
              </div>

              {company && (
                <div className="col-span-2 lg:col-span-1">
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

              <div className="col-span-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded border"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-4 py-2 rounded bg-brand-500 text-white disabled:opacity-50"
                >
                  {loading
                    ? "Saving..."
                    : company
                    ? "Update Company"
                    : "Create Company"}
                </button>
              </div>
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
    </>
  );
}
