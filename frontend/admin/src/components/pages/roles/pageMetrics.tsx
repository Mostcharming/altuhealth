"use client";

import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import { Modal } from "@/components/ui/modal";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { useModal } from "@/hooks/useModal";
import { apiClient } from "@/lib/apiClient";
import { Privilege, usePrivilegeStore } from "@/lib/store/privilegeStore";
import { useRoleStore } from "@/lib/store/roleStore";
import { ChangeEvent, useCallback, useEffect, useState } from "react";

export default function PageMetrics({ buttonText }: { buttonText?: string }) {
  const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const errorModal = useModal();
  const successModal = useModal();
  const handleMessageChange = (value: string) => {
    setMessage(value);
  };
  const privileges = usePrivilegeStore((s) => s.privileges);
  const setPrivileges = usePrivilegeStore((s) => s.setPrivileges);
  const addRole = useRoleStore((s) => s.addRole);
  const [errorMessage, setErrorMessage] = useState(
    "Failed to create role. Please try again."
  );

  const resetForm = () => {
    setName("");
    setMessage("");
    setSelectedIds([]);
  };

  const handleSuccessClose = () => {
    successModal.closeModal();
    resetForm();
    closeModal();
  };

  const handleErrorClose = () => {
    errorModal.closeModal();
    // resetForm();
    // closeModal();
  };

  const togglePrivilege = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const fetchPrivileges = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient("/admin/roles/privileges/list", {
        method: "GET",
        onLoading: (l) => setLoading(l),
      });

      const items: Privilege[] =
        data?.data?.list && Array.isArray(data.data.list)
          ? data.data.list
          : Array.isArray(data)
          ? data
          : [];

      setPrivileges(items);
    } catch (err) {
      console.warn("Privilege fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setPrivileges]);

  useEffect(() => {
    fetchPrivileges();
  }, [fetchPrivileges]);

  const handlesubmit = async () => {
    try {
      setLoading(true);

      const payload = {
        name,
        description: message,
        privilegeIds: selectedIds,
      };

      const data = await apiClient("/admin/roles", {
        method: "POST",
        body: payload,
        onLoading: (l: boolean) => setLoading(l),
      });

      const createdRole = data?.data?.role || data?.role || null;
      const returnedPrivileges =
        data?.data?.privileges || data?.privileges || [];

      if (createdRole) {
        // attach privileges to the role object then add to store
        const roleWithPrivileges = {
          ...createdRole,
          privileges: returnedPrivileges,
        };
        try {
          addRole(roleWithPrivileges);
        } catch (e) {
          // swallow store errors
          console.warn("Failed to add role to store", e);
        }

        successModal.openModal();
      } else {
        setErrorMessage("Failed to create role. Please try again.");
        errorModal.openModal();
      }
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
            Add a new role
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Fill in the details below to create a new role.
          </p>
        </div>

        <form className="flex flex-col">
          <div className="custom-scrollbar h-[350px] sm:h-[450px] overflow-y-auto px-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Role Name</Label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setName(e.target.value)
                  }
                />
              </div>

              <div className="sm:col-span-2">
                <Label>Description</Label>
                <TextArea
                  placeholder="Type your message here..."
                  rows={6}
                  value={message}
                  onChange={handleMessageChange}
                />
              </div>
            </div>

            <div className="relative p-3 mt-6 border border-gray-200 rounded-xl bg-gray-50 dark:border-gray-800 dark:bg-gray-900 sm:p-5">
              <input type="file" id="upload-file" className="sr-only" />
              <div className="flex items-center gap-3 mb-5">
                <span className="text-lg font-medium text-gray-800 dark:text-white/90">
                  Privileges
                </span>
              </div>
              {loading ? (
                <SpinnerThree />
              ) : (
                <>
                  {privileges && privileges.length ? (
                    privileges.map((p) => (
                      <div
                        key={p.id}
                        id={`task-${p.id}`}
                        className="p-5 mb-4 bg-white border border-gray-200 task rounded-xl shadow-theme-sm dark:border-gray-800 dark:bg-white/5"
                      >
                        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                          <div className="flex items-start w-full gap-4">
                            <label
                              htmlFor={`taskCheckbox${p.id}`}
                              className="w-full cursor-pointer"
                            >
                              <div className="relative flex items-start">
                                <input
                                  type="checkbox"
                                  id={`taskCheckbox${p.id}`}
                                  className="sr-only taskCheckbox"
                                  value={p.id}
                                  checked={selectedIds.includes(String(p.id))}
                                  onChange={() => togglePrivilege(String(p.id))}
                                />
                                <div className="flex items-center justify-center w-full h-5 mr-3 border border-gray-300 rounded-md box max-w-5 dark:border-gray-700">
                                  <span>
                                    <svg
                                      width="14"
                                      height="14"
                                      viewBox="0 0 14 14"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M11.6668 3.5L5.25016 9.91667L2.3335 7"
                                        stroke="white"
                                        strokeWidth="1.94437"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  </span>
                                </div>
                              </div>
                              <p className="-mt-0.5 text-base text-gray-800 dark:text-white/90">
                                {p.description ?? p.name ?? String(p.id)}
                              </p>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      No privileges found.
                    </p>
                  )}
                </>
              )}
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
                  Create Role
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
