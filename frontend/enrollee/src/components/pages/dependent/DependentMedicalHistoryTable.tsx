"use client";

import Select from "@/components/form/Select";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { apiClient } from "@/lib/apiClient";
import React, { useCallback, useEffect, useState } from "react";

interface DependentMedicalHistoryTableProps {
  dependentId: string;
}

interface MedicalHistory {
  id: string;
  enrolleeDependentId: string;
  providerId?: string;
  diagnosisId?: string;
  evsCode?: string;
  amount?: number;
  serviceDate?: string;
  notes?: string;
  attachmentUrl?: string;
  status: string;
  createdAt: string;
  provider?: { name: string };
  diagnosis?: { name: string };
}

const DependentMedicalHistoryTable: React.FC<
  DependentMedicalHistoryTableProps
> = ({ dependentId }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [hasPreviousPage, setHasPreviousPage] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [medicalHistories, setMedicalHistories] = useState<MedicalHistory[]>(
    []
  );

  type Header = {
    key: string;
    label: string;
  };

  const select = [
    { value: "10", label: "10" },
    { value: "20", label: "20" },
    { value: "30", label: "30" },
    { value: "40", label: "40" },
    { value: "50", label: "50" },
  ];

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "reviewed", label: "Reviewed" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

  const headers: Header[] = [
    { key: "provider", label: "Provider" },
    { key: "diagnosis", label: "Diagnosis" },
    { key: "evsCode", label: "EVS Code" },
    { key: "serviceDate", label: "Service Date" },
    { key: "amount", label: "Amount" },
    { key: "status", label: "Status" },
    { key: "createdAt", label: "Date Created" },
  ];

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient(
        `/enrollee/dependents/${dependentId}/medical-histories?page=${currentPage}&limit=${limit}${
          selectedStatus ? `&status=${selectedStatus}` : ""
        }`
      );

      if (response?.data) {
        setMedicalHistories(response.data.list || []);
        setTotalItems(response.data.count || 0);
        setHasNextPage(response.data.hasNextPage || false);
        setHasPreviousPage(response.data.hasPrevPage || false);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching medical histories:", err);
    } finally {
      setLoading(false);
    }
  }, [limit, currentPage, selectedStatus, dependentId]);

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

  const handleSelectChange = (selectedValue: string) => {
    const newLimit = Number(selectedValue);
    setLimit(newLimit);
    setCurrentPage(1);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const nextPage = (): void => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const previousPage = (): void => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const getStatusBadgeColor = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "reviewed":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "approved":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "rejected":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Medical History
          </h3>
        </div>

        <div className="flex gap-3.5">
          <div className="hidden flex-col gap-3 sm:flex sm:flex-row sm:items-center">
            <Select
              options={statusOptions}
              placeholder="Select status"
              onChange={handleStatusChange}
              defaultValue={selectedStatus}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <SpinnerThree />
      ) : (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                {headers.map((h) => (
                  <th
                    key={h.key}
                    className="p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400"
                  >
                    <div className="flex items-center gap-3">
                      <p className="text-theme-xs font-medium text-gray-700 dark:text-gray-400">
                        {h.label}
                      </p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {medicalHistories.map((history) => (
                <tr
                  key={history.id}
                  className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                    {history.provider?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                    {history.diagnosis?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                    {history.evsCode || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                    {formatDate(history.serviceDate)}
                  </td>
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                    {history.amount ? `$${history.amount.toFixed(2)}` : "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                        history.status
                      )}`}
                    >
                      {history.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                    {formatDate(history.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {medicalHistories.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No medical history found
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center flex-col sm:flex-row justify-between border-t border-gray-200 px-5 py-4 dark:border-gray-800">
        <div>
          <Select
            options={select}
            placeholder="Select limit"
            onChange={handleSelectChange}
            defaultValue=""
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
            <svg
              className="fill-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M2.58203 9.99868C2.58174 10.1909 2.6549 10.3833 2.80152 10.53L7.79818 15.5301C8.09097 15.8231 8.56584 15.8233 8.85883 15.5305C9.15183 15.2377 9.152 14.7629 8.85921 14.4699L5.13911 10.7472L16.6665 10.7472C17.0807 10.7472 17.4165 10.4114 17.4165 9.99715C17.4165 9.58294 17.0807 9.24715 16.6665 9.24715L5.14456 9.24715L8.85919 5.53016C9.15199 5.23717 9.15184 4.7623 8.85885 4.4695C8.56587 4.1767 8.09099 4.17685 7.79819 4.46984L2.84069 9.43049C2.68224 9.568 2.58203 9.77087 2.58203 9.99715C2.58203 9.99766 2.58203 9.99817 2.58203 9.99868Z"
                fill=""
              />
            </svg>
          </button>
          <span className="block text-sm font-medium text-gray-700 sm:hidden dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <ul className="hidden items-center gap-0.5 sm:flex">
            {visiblePages.map((page) => (
              <li key={page}>
                <button
                  onClick={() => goToPage(page)}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium ${
                    page === currentPage
                      ? "bg-brand-500 text-white"
                      : "hover:bg-brand-500 text-gray-700 hover:text-white dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  {page}
                </button>
              </li>
            ))}
            {visiblePages[visiblePages.length - 1] < totalPages && (
              <>
                <li>
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium text-gray-700 dark:text-gray-400">
                    ...
                  </span>
                </li>
                <li>
                  <button
                    onClick={() => goToPage(totalPages)}
                    className="hover:bg-brand-500 flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium text-gray-700 hover:text-white dark:text-gray-400 dark:hover:text-white"
                  >
                    {totalPages}
                  </button>
                </li>
              </>
            )}
          </ul>
          <button
            className={`shadow-theme-xs flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 hover:text-gray-800 sm:p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 ${
              currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={nextPage}
            disabled={!hasNextPage}
          >
            <svg
              className="fill-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M17.4165 9.9986C17.4168 10.1909 17.3437 10.3832 17.197 10.53L12.2004 15.5301C11.9076 15.8231 11.4327 15.8233 11.1397 15.5305C10.8467 15.2377 10.8465 14.7629 11.1393 14.4699L14.8594 10.7472L3.33203 10.7472C2.91782 10.7472 2.58203 10.4114 2.58203 9.99715C2.58203 9.58294 2.91782 9.24715 3.33203 9.24715L14.854 9.24715L11.1393 5.53016C10.8465 5.23717 10.8467 4.7623 11.1397 4.4695C11.4327 4.1767 11.9075 4.17685 12.2003 4.46984L17.1578 9.43049C17.3163 9.568 17.4165 9.77087 17.4165 9.99715C17.4165 9.99763 17.4165 9.99812 17.4165 9.9986Z"
                fill=""
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DependentMedicalHistoryTable;
