/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Role, useRoleStore } from "@/lib/store/roleStore";
import { Unit, useUnitStore } from "@/lib/store/unitStore";
import { User, useUserStore } from "@/lib/store/userStore";
import { ChangeEvent, useEffect, useState } from "react";

interface EditUnitProps {
  isOpen: boolean;
  closeModal: () => void;
  unit?: User | null;
}

export default function EditUnit({ isOpen, closeModal, unit }: EditUnitProps) {
  const [loading, setLoading] = useState(false);
  const errorModal = useModal();
  const successModal = useModal();
  const [id, setId] = useState<string>("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  const updateUser = useUserStore((s) => s.updateUser);
  const [roles, setRoles] = useState<Role[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const setUnitsStore = useUnitStore((s) => s.setUnits);
  const setRolesStore = useRoleStore((s) => s.setRoles);
  const [errorMessage, setErrorMessage] = useState<string>(
    "Failed to update admin."
  );

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

  const handleSuccessClose = () => {
    successModal.closeModal();
    closeModal();
  };

  const handleErrorClose = () => {
    errorModal.closeModal();
    closeModal();
  };

  // When the modal opens with a role, populate the form with its data.
  useEffect(() => {
    if (isOpen && unit) {
      setId(unit.id ?? "");

      setFirstName(unit.firstName ?? "");
      setLastName(unit.lastName ?? "");
      setEmail(unit.email ?? "");
      setPhoneNumber(unit.phoneNumber ?? "");
      const st =
        unit.status === "active" || unit.status === "inactive"
          ? unit.status
          : "active";
      setStatus(st);
      // Normalize role/unit to be the id string when they can be objects or strings
      if (unit.role) {
        // role might be a string id or an object with an `id` property
        const rid =
          typeof unit.role === "string" ? unit.role : (unit.role as any).id;
        setSelectedRole(rid || null);
      } else {
        setSelectedRole(null);
      }

      if ((unit as any).unit) {
        const uid =
          typeof (unit as any).unit === "string"
            ? (unit as any).unit
            : ((unit as any).unit as any).id;
        setSelectedUnit(uid || null);
      } else {
        setSelectedUnit(null);
      }
    }

    if (!isOpen) {
      setId("");

      setFirstName("");
      setLastName("");
      setEmail("");
      setPhoneNumber("");
      setStatus("active");
      setSelectedRole(null);
      setSelectedUnit(null);
    }
  }, [isOpen, unit]);

  useEffect(() => {
    let mounted = true;
    const fetchLists = async () => {
      try {
        const [rolesRes, unitsRes] = await Promise.all([
          apiClient("/admin/roles/list?limit=all"),
          apiClient("/admin/units/list?limit=all"),
        ]);

        const fetchedRoles = (rolesRes?.data?.list as Role[]) || [];
        const fetchedUnits = (unitsRes?.data?.list as Unit[]) || [];

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

      if (selectedRole) payload.roleId = selectedRole;
      if (selectedUnit) payload.unitId = selectedUnit;

      const url = `/admin/admins/${id}`;
      const method = "PUT";

      await apiClient(url, {
        method,
        body: payload,
        onLoading: (l: boolean) => setLoading(l),
      });

      updateUser(id, {
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
  const statuses = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];
  const handleStatusChange = (value: string | null) => {
    // ensure we always set a valid status string
    setStatus((value as "active" | "inactive") ?? "active");
  };
  const handlePhoneChange = (v: string) => setPhoneNumber(v);
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[900px] p-5 lg:p-10 m-4"
      >
        <div className="px-2">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edit Admin
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Update the admin details.
          </p>
        </div>

        <form className="flex flex-col">
          <div className="custom-scrollbar h-[350px] sm:h-[450px] overflow-y-auto px-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
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
                <Label>Role</Label>
                <Select
                  key={`role-${selectedRole || "none"}`}
                  options={roleOptions}
                  placeholder="Select role (optional)"
                  defaultValue={selectedRole ?? ""}
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
                  defaultValue={selectedUnit ?? ""}
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
            </div>

            <div className="flex flex-col items-center gap-6 px-2 mt-6 sm:flex-row sm:justify-between">
              <div className="flex flex-col items-center gap-3 sm:flex-row">
                <div className="flex -space-x-2"></div>
              </div>

              <div className="flex items-center w-full gap-3 sm:w-auto">
                <button
                  onClick={closeModal}
                  type="button"
                  className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  disabled={loading}
                  onClick={handlesubmit}
                  type="button"
                  className="flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                >
                  Update Admin
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
