"use client";

import PhoneInput from "@/components/form/group-input/PhoneInput";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { apiClient } from "@/lib/apiClient";
import { Role as RoleType, useRoleStore } from "@/lib/store/roleStore";
import { Unit as UnitType, useUnitStore } from "@/lib/store/unitStore";
import { useUserStore } from "@/lib/store/userStore";
import { ChangeEvent, useEffect, useState } from "react";

export default function PageMetricsUnits({
  buttonText,
}: {
  buttonText?: string;
}) {
  const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);

  const errorModal = useModal();
  const successModal = useModal();

  // stores
  const addUser = useUserStore((s) => s.addUser);
  const setUnitsStore = useUnitStore((s) => s.setUnits);
  const setRolesStore = useRoleStore((s) => s.setRoles);

  // form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  // fetched lists
  const [roles, setRoles] = useState<RoleType[]>([]);
  const [units, setUnits] = useState<UnitType[]>([]);
  const [errorMessage, setErrorMessage] = useState(
    "Failed to create admin. Please try again."
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

  // computed options for Select component
  const roleOptions = roles.map((r) => ({ value: r.id, label: r.name }));
  const unitOptions = units.map((u) => ({
    value: u.id,
    label: `${u.name} (${u.accountType})`,
  }));

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhoneNumber("");
    setPassword("");
    setStatus("active");
    setSelectedRole(null);
    setSelectedUnit(null);
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

  // fetch roles and units for dropdowns
  useEffect(() => {
    let mounted = true;
    const fetchLists = async () => {
      try {
        const [rolesRes, unitsRes] = await Promise.all([
          apiClient("/admin/roles/list?limit=all"),
          apiClient("/admin/units/list?limit=all"),
        ]);

        const fetchedRoles = (rolesRes?.data?.list as RoleType[]) || [];
        const fetchedUnits = (unitsRes?.data?.list as UnitType[]) || [];

        if (!mounted) return;

        setRoles(fetchedRoles);
        setUnits(fetchedUnits);

        // update global stores as well (non-blocking)
        try {
          setRolesStore(fetchedRoles);
          setUnitsStore(fetchedUnits);
        } catch {
          // ignore store set errors
        }
      } catch (err) {
        console.warn("Failed to fetch roles/units", err);
      }
    };

    fetchLists();
    return () => {
      mounted = false;
    };
  }, [setRolesStore, setUnitsStore]);

  const handlesubmit = async () => {
    try {
      // simple client-side validation
      if (!firstName || !lastName || !email) {
        setErrorMessage("First name, last name, and email are required.");
        errorModal.openModal();
        return;
      }

      setLoading(true);

      const payload: {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string | null;
        status: "active" | "inactive";
        password?: string;
        roleId?: string;
        unitId?: string;
      } = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber || null,
        status,
      };

      if (password) payload.password = password;
      if (selectedRole) payload.roleId = selectedRole;
      if (selectedUnit) payload.unitId = selectedUnit;

      const data = await apiClient("/admin/admins", {
        method: "POST",
        body: payload,
        onLoading: (l: boolean) => setLoading(l),
      });

      // if backend returns created admin id or object, you can handle it here
      // Optionally, if a unit was created/returned and you want to add to unit store
      if (data?.data?.id) {
        addUser({
          id: data.data.id,
          firstName: firstName,
          lastName: lastName,
          email: email,
          phoneNumber: phoneNumber,
          status: status,
          role: {
            id: selectedRole ?? "",
            name: selectedRole
              ? roles.find((r) => r.id === selectedRole)?.name || ""
              : "",
          },
          unit: {
            id: selectedUnit ?? "",
            name: selectedUnit
              ? units.find((u) => u.id === selectedUnit)?.name || ""
              : "",
          },
          createdAt: Date.now().toString(),
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
  const statuses = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];
  const handleStatusChange = (value: string | null) => {
    setStatus((value as "active" | "inactive") ?? null);
  };
  const handlePhoneChange = (v: string) => setPhoneNumber(v);

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
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Add a new admin
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Fill in the details below to create a new admin user.
          </p>
        </div>

        <form
          className="flex flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            handlesubmit();
          }}
        >
          <div className="custom-scrollbar h-[350px] sm:h-[450px] overflow-y-auto px-2">
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
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label htmlFor="phone">Phone</Label>
                <PhoneInput
                  selectPosition="start"
                  countries={countries}
                  placeholder="+1 (555) 000-0000"
                  //defaultValue={phoneNumber}
                  onChange={handlePhoneChange}
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Password (optional)</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                  }
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Role</Label>
                <Select
                  key={`role-${selectedRole || "none"}`}
                  options={roleOptions}
                  placeholder="Select role (optional)"
                  defaultValue={selectedRole || ""}
                  onChange={(v: string) => setSelectedRole(v || null)}
                  className="w-full"
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Unit</Label>
                <Select
                  key={`unit-${selectedUnit || "none"}`}
                  options={unitOptions}
                  placeholder="Select unit (optional)"
                  defaultValue={selectedUnit || ""}
                  onChange={(v: string) => setSelectedUnit(v || null)}
                  className="w-full"
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Status</Label>
                <Select
                  options={statuses}
                  placeholder="Select Status"
                  defaultValue={status ?? ""}
                  onChange={handleStatusChange}
                  className="w-full"
                />
              </div>

              <div className="col-span-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded bg-brand-500 text-white"
                >
                  {loading ? "Creating..." : "Create admin"}
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
    </div>
  );
}
