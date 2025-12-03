"use client";

import Select from "@/components/form/Select";
import ConfirmModal from "@/components/modals/confirm";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import SpinnerThree from "@/components/ui/spinner";
import { useModal } from "@/hooks/useModal";
import { apiClient } from "@/lib/apiClient";
import {
  EnrolleeDependent,
  useEnrolleeDependentStore,
} from "@/lib/store/enrolleeDependentStore";
import React, { useCallback, useEffect, useState } from "react";
import EditEnrolleeDependent from "./editEnrolleeDependent";

interface Enrollee {
  id: string;
  firstName: string;
  lastName: string;
  policyNumber: string;
}

const EnrolleeDependentsTable: React.FC = () => {
  const { isOpen, openModal, closeModal } = useModal();
  const errorModal = useModal();
  const successModal = useModal();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [selectedEnrolleeId, setSelectedEnrolleeId] = useState<string>("");
  const [enrollees, setEnrollees] = useState<Enrollee[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalItems, setTotalItems] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [hasPreviousPage, setHasPreviousPage] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(1);
  const dependents = useEnrolleeDependentStore((s) => s.dependents);
  const setDependents = useEnrolleeDependentStore((s) => s.setDependents);
  const confirmModal = useModal();
  const [selectedDependentId, setSelectedDependentId] = useState<string | null>(
    null
  );
  const [editingDependent, setEditingDependent] =
    useState<EnrolleeDependent | null>(null);
  const removeDependent = useEnrolleeDependentStore((s) => s.removeDependent);
  const [errorMessage, setErrorMessage] = useState(
    "Failed to delete dependent. Please try again."
  );

  type Header = {
    key: keyof EnrolleeDependent | "actions";
    label: string;
  };

  const select = [
    { value: "10", label: "10" },
    { value: "20", label: "20" },
    { value: "30", label: "30" },
    { value: "40", label: "40" },
    { value: "50", label: "50" },
  ];

  const headers: Header[] = [
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "policyNumber", label: "Policy Number" },
    { key: "relationshipToEnrollee", label: "Relationship" },
    { key: "gender", label: "Gender" },
    { key: "isActive", label: "Status" },
    { key: "actions", label: "Actions" },
  ];

  // Fetch enrollees on mount
  useEffect(() => {
    const fetchEnrollees = async () => {
      try {
        const data = await apiClient("/admin/enrollees/list?limit=all", {
          method: "GET",
        });
        const enrolleesList = data?.data?.list || [];
        setEnrollees(enrolleesList);
      } catch (err) {
        console.warn("Failed to fetch enrollees", err);
      }
    };
    fetchEnrollees();
  }, []);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (limit) params.append("limit", String(limit));
      if (currentPage) params.append("page", String(currentPage));
      if (search) params.append("q", search);
      if (selectedEnrolleeId) params.append("enrolleeId", selectedEnrolleeId);

      const url = `/admin/enrollee-dependents/list?${params.toString()}`;

      const data = await apiClient(url, {
        method: "GET",
        onLoading: (l) => setLoading(l),
      });

      const items: EnrolleeDependent[] =
        data?.data?.list && Array.isArray(data.data.list)
          ? data.data.list
          : Array.isArray(data)
          ? data
          : [];

      setDependents(items);
      setTotalItems(data?.data?.count ?? 0);
      setHasNextPage(Boolean(data?.data?.hasNextPage));
      setHasPreviousPage(Boolean(data?.data?.hasPreviousPage));
      setTotalPages(data?.data?.totalPages ?? 1);
    } catch (err) {
      console.warn("Dependent fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [limit, currentPage, search, selectedEnrolleeId, setDependents]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const startEntry: number =
    totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;

  const endEntry: number = Math.min(currentPage * limit, totalItems);

  const visiblePages: number[] = React.useMemo(() => {
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPages]);

  const goToPage = (page: number): void => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const nextPage = (): void => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const previousPage = (): void => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleSelectChange = (value: string) => {
    setLimit(Number(value));
    setCurrentPage(1);
  };

  const handleDeleteModal = (id: string) => {
    setSelectedDependentId(id);
    confirmModal.openModal();
  };

  const handleCloseConfirm = () => {
    setSelectedDependentId(null);
    confirmModal.closeModal();
  };

  const handleView = (dependent: EnrolleeDependent) => {
    setEditingDependent(dependent);
    openModal();
  };

  const deleteDependent = async () => {
    if (!selectedDependentId) return;
    try {
      setLoading(true);
      const url = `/admin/enrollee-dependents/${selectedDependentId}`;
      await apiClient(url, {
        method: "DELETE",
        onLoading: (l) => setLoading(l),
      });

      removeDependent(selectedDependentId);
      setSelectedDependentId(null);
      confirmModal.closeModal();
      successModal.openModal();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
      errorModal.openModal();
    } finally {
      setLoading(false);
    }
  };

  const handleCloseEdit = () => {
    setEditingDependent(null);
    closeModal();
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
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Dependents Listing
          </h3>
        </div>

        <div className="flex gap-3.5">
          <div className="hidden flex-col gap-3 sm:flex sm:flex-row sm:items-center">
            <div>
              <Select
                options={[
                  { value: "", label: "All Enrollees" },
                  ...enrollees.map((e) => ({
                    value: e.id,
                    label: `${e.firstName} ${e.lastName}`,
                  })),
                ]}
                placeholder="Select enrollee"
                onChange={(value) => {
                  setSelectedEnrolleeId(value as string);
                  setCurrentPage(1);
                }}
                defaultValue={selectedEnrolleeId}
              />
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, policy number..."
                className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pr-4 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden xl:w-[300px] dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearch(e.target.value)
                }
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <SpinnerThree />
      ) : (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                {headers.map((header) => (
                  <th
                    key={header.key}
                    className="px-5 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-x divide-y divide-gray-200 dark:divide-gray-800">
              {dependents.map((dependent: EnrolleeDependent) => (
                <tr
                  key={dependent.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="px-5 py-4 text-sm text-gray-800 dark:text-gray-300">
                    {dependent.firstName}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-800 dark:text-gray-300">
                    {dependent.lastName}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-800 dark:text-gray-300">
                    {dependent.policyNumber}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-800 dark:text-gray-300">
                    <span className="capitalize">
                      {dependent.relationshipToEnrollee}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-800 dark:text-gray-300">
                    <span className="capitalize">{dependent.gender}</span>
                  </td>
                  <td className="px-5 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        dependent.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {dependent.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(dependent)}
                        className="text-brand-500 hover:text-brand-600 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteModal(dependent.id)}
                        className="text-red-500 hover:text-red-600 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center flex-col sm:flex-row justify-between border-t border-gray-200 px-5 py-4 dark:border-gray-800">
        <div>
          <Select
            options={select}
            placeholder="Select limit"
            onChange={handleSelectChange}
            defaultValue="10"
          />
        </div>
        <div className="pb-4 sm:pb-0">
          <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">
            Showing{" "}
            <span className="text-gray-800 dark:text-white/90">
              {startEntry}
            </span>{" "}
            to{" "}
            <span className="text-gray-800 dark:text-white/90">{endEntry}</span>{" "}
            of{" "}
            <span className="text-gray-800 dark:text-white/90">
              {totalItems}
            </span>
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 bg-gray-50 p-4 sm:p-0 rounded-lg sm:bg-transparent dark:sm:bg-transparent w-full sm:w-auto dark:bg-white/[0.03] sm:justify-normal">
          <button
            className={`shadow-theme-xs flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 hover:text-gray-800 sm:p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={previousPage}
            disabled={!hasPreviousPage}
          >
            ← Previous
          </button>
          <span className="block text-sm font-medium text-gray-700 sm:hidden dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <ul className="hidden items-center gap-0.5 sm:flex">
            {visiblePages.map((page) => (
              <li key={page}>
                <button
                  onClick={() => goToPage(page)}
                  className={`h-8 w-8 rounded-lg text-sm font-medium transition ${
                    currentPage === page
                      ? "bg-brand-500 text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/[0.03]"
                  }`}
                >
                  {page}
                </button>
              </li>
            ))}
          </ul>
          <button
            className={`shadow-theme-xs flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 hover:text-gray-800 sm:p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 ${
              currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={nextPage}
            disabled={!hasNextPage}
          >
            Next →
          </button>
        </div>
      </div>

      <ConfirmModal
        confirmModal={confirmModal}
        handleSave={deleteDependent}
        closeModal={handleCloseConfirm}
      />
      <EditEnrolleeDependent
        isOpen={isOpen}
        closeModal={handleCloseEdit}
        dependent={editingDependent}
      />
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
};

export default EnrolleeDependentsTable;
