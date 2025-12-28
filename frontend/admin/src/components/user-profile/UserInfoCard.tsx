"use client";
import { useModal } from "@/hooks/useModal";
import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/lib/authStore";
import { Account, useAccountStore } from "@/lib/store/accountStore";
import {
  ChangeEvent,
  SyntheticEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import PhoneInput from "../form/group-input/PhoneInput";
import FileInput from "../form/input/FileInput";
import Input from "../form/input/InputField";
import TextArea from "../form/input/TextArea";
import Label from "../form/Label";
import Select from "../form/Select";
import ErrorModal from "../modals/error";
import SuccessModal from "../modals/success";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";

export default function UserInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const errorModal = useModal();
  const successModal = useModal();
  const account = useAccountStore((s) => s.account);
  const setAccount = useAccountStore((s) => s.setAccount);
  const [loading, setLoading] = useState(true);

  // Local form state to make the form controlled
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [messageTwo, setMessageTwo] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("Failed to update");
  const user = useAuthStore((s) => s.user);

  const fetchAccount = useCallback(async () => {
    try {
      setLoading(true);

      const url = `/admin/account/profile`;

      const data = await apiClient(url, {
        method: "GET",
        onLoading: (l) => setLoading(l),
      });

      const items: Account = data.data.user;

      setAccount(items);
    } catch (err) {
      console.warn("Role fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [setAccount]);

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

  // When account updates, initialize the form fields
  useEffect(() => {
    if (!account) return;
    setFirstName(account.firstName ?? "");
    setLastName(account.lastName ?? "");
    setPhone(account.phoneNumber ?? "");
    setSelectedCountry(account.country ?? null);
    setMessageTwo(account.address ?? "");
  }, [account]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement> | null) => {
    if (!e) {
      setFile(null);
      return;
    }
    const files = e.target.files;
    const selected = files && files[0] ? files[0] : null;

    // Only accept image files
    if (selected && !selected.type.startsWith("image/")) {
      console.warn("Only image files are allowed");
      setFile(null);
      return;
    }

    setFile(selected);
  };

  const handlePhoneChange = (val: string) => {
    setPhone(val ?? "");
  };

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value ?? null);
  };

  const handleSave = async (e?: SyntheticEvent) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }

    // assemble form data for multipart/form-data upload
    const formData = new FormData();
    formData.append("firstName", firstName ?? "");
    formData.append("lastName", lastName ?? "");
    formData.append("phoneNumber", phone ?? "");
    formData.append("address", messageTwo ?? "");
    if (selectedCountry) formData.append("country", selectedCountry);
    // include existing address if available
    if (file) {
      formData.append("picture", file);
    }

    try {
      setLoading(true);

      const url = `/admin/account/profile`;

      const data = await apiClient(url, {
        method: "PUT",
        formData,
        onLoading: (l) => setLoading(l),
      });

      const updated: Account = data?.data?.user ?? data?.data ?? data;

      if (updated) {
        setAccount(updated);
        const acc = updated as Account;
        const authUser = {
          id: String(acc.id ?? ""),
          email: String(acc.email ?? ""),
          firstName: acc.firstName ?? undefined,
          lastName: acc.lastName ?? undefined,
          role: user?.role ?? undefined,
          picture: acc.picture ?? undefined,
          phoneNumber: acc.phoneNumber ?? undefined,
          status: acc.status ?? undefined,
          rolePrivileges: user?.rolePrivileges ?? undefined,
        };

        useAuthStore.setState({ user: authUser });
      }
      // closeModal();
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

  const options = [
    { value: "United States", label: "United States" },
    { value: "Canada", label: "Canada" },
    { value: "United Kingdom", label: "United Kingdom" },
    { value: "Australia", label: "Australia" },
    { value: "India", label: "India" },
    { value: "Nigeria", label: "Nigeria" },
    { value: "Germany", label: "Germany" },
    { value: "France", label: "France" },
    { value: "Spain", label: "Spain" },
    { value: "Italy", label: "Italy" },
    { value: "Brazil", label: "Brazil" },
    { value: "Mexico", label: "Mexico" },
    { value: "China", label: "China" },
    { value: "Japan", label: "Japan" },
    { value: "South Africa", label: "South Africa" },
  ];
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
  const handleSuccessClose = () => {
    successModal.closeModal();
    closeModal();
  };

  const handleErrorClose = () => {
    errorModal.closeModal();
    closeModal();
  };
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                First Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {account?.firstName || "Firstname"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Last name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {account?.lastName || "Lastname"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Email address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {account?.email || "  "}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Phone
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {account?.phoneNumber || "+00 000 000 00"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Country
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {account?.country || "  "}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {account?.address || "  "}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          Edit
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>First Name</Label>
                    <Input
                      type="text"
                      value={firstName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setFirstName(e.target.value)
                      }
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Last Name</Label>
                    <Input
                      type="text"
                      value={lastName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setLastName(e.target.value)
                      }
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label htmlFor="phone">Phone</Label>
                    <PhoneInput
                      selectPosition="start"
                      countries={countries}
                      placeholder="+1 (555) 000-0000"
                      //defaultValue={phone}
                      onChange={handlePhoneChange}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Select Country</Label>
                    <Select
                      options={options}
                      placeholder="Select Country"
                      onChange={handleCountryChange}
                      defaultValue={selectedCountry ?? ""}
                      className="dark:bg-dark-900"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Address</Label>
                    <TextArea
                      rows={3}
                      value={messageTwo}
                      error
                      onChange={(value) => setMessageTwo(value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Upload file</Label>
                    <FileInput
                      onChange={handleFileChange}
                      className="custom-class"
                      accept="image/*"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button loading={loading} size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
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
