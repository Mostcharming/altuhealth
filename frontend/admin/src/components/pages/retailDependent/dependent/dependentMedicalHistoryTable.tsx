/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Select from "@/components/form/Select";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { apiClient } from "@/lib/apiClient";
import React, { useCallback, useEffect, useState } from "react";

interface RetailDependentMedicalHistoryTableProps {
  dependentId: string;
}

const RetailDependentMedicalHistoryTable: React.FC<
  RetailDependentMedicalHistoryTableProps
> = ({ dependentId }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [hasPreviousPage, setHasPreviousPage] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [medicalHistories, setMedicalHistories] = useState<any[]>([]);

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
    { key: "Provider", label: "Provider" },
    { key: "Diagnosis", label: "Diagnosis" },
    { key: "evsCode", label: "EVS Code" },
    { key: "serviceDate", label: "Service Date" },
    { key: "amount", label: "Amount" },
    { key: "status", label: "Status" },
    { key: "createdAt", label: "Date Created" },
  ];

  const fetch = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (limit) params.append("limit", String(limit));
      if (currentPage) params.append("page", String(currentPage));
      if (selectedStatus) params.append("status", selectedStatus);

      const url = `/admin/retail-enrollee-dependents/${dependentId}/medical-histories?${params.toString()}`;

      const data = await apiClient(url, {
        method: "GET",
        onLoading: (l) => setLoading(l),
      });

      const items: any[] =
        data?.data?.medicalHistories &&
        Array.isArray(data.data.medicalHistories)
          ? data.data.medicalHistories
          : Array.isArray(data)
          ? data
          : [];

      setMedicalHistories(items);
      setTotalItems(data?.data?.pagination?.total ?? 0);
      setHasNextPage(
        Boolean(
          data?.data?.pagination &&
            data.data.pagination.page < data.data.pagination.pages
        )
      );
      setHasPreviousPage(Boolean(data?.data?.pagination?.page > 1));
      setTotalPages(data?.data?.pagination?.pages ?? 1);
    } catch (err) {
      console.warn("Medical history fetch failed", err);
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

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadgeColor = (status: string | undefined) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "reviewed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
    }
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

  const handleSelectChange = (selectedValue: string) => {
    const newLimit = Number(selectedValue);
    setLimit(newLimit);
    setCurrentPage(1);
  };
  const goToPage = (page: number): void => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const visiblePages: number[] = React.useMemo(() => {
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPages]);

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
              placeholder="Filter by status"
              onChange={handleStatusChange}
              defaultValue={selectedStatus}
            />
          </div>
        </div>
      </div>
      {loading ? (
        <SpinnerThree />
      ) : medicalHistories.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No medical history found
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                {headers.map((header) => (
                  <th
                    key={header.key}
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-x divide-y divide-gray-200 dark:divide-gray-800">
              {medicalHistories.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-400">
                    {item?.Provider?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-400">
                    {item?.Diagnosis?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-400">
                    {item?.evsCode || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-400">
                    {formatDate(item?.serviceDate)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-400">
                    {item?.amount ? `₦${item.amount.toLocaleString()}` : "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(
                        item?.status
                      )}`}
                    >
                      {item?.status || "N/A"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-400">
                    {formatDate(item?.createdAt)}
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
            defaultValue={String(limit)}
          />
        </div>
        <div className="pb-4 sm:pb-0">
          <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">
            Showing {startEntry} to {endEntry} of {totalItems}
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
            Previous
          </button>
          <span className="block text-sm font-medium text-gray-700 sm:hidden dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <ul className="hidden items-center gap-0.5 sm:flex">
            {visiblePages.map((page) => (
              <li key={page}>
                <button
                  onClick={() => goToPage(page)}
                  className={`rounded px-3 py-2 text-sm font-medium transition ${
                    currentPage === page
                      ? "bg-brand-500 text-white"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
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
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default RetailDependentMedicalHistoryTable;
