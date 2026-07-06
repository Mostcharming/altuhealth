/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Select from "@/components/form/Select";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { apiClient } from "@/lib/apiClient";
import React, { useCallback, useEffect, useState } from "react";

interface RetailDependentAuthorizationCodesTableProps {
  dependentId: string;
}

const RetailDependentAuthorizationCodesTable: React.FC<
  RetailDependentAuthorizationCodesTableProps
> = ({ dependentId }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [hasPreviousPage, setHasPreviousPage] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [authorizationCodes, setAuthorizationCodes] = useState<any[]>([]);

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

  const headers: Header[] = [
    { key: "authorizationCode", label: "Authorization Code" },
    { key: "authorizationType", label: "Type" },
    { key: "Provider", label: "Provider" },
    { key: "Diagnosis", label: "Diagnosis" },
    { key: "amountAuthorized", label: "Amount Authorized" },
    { key: "validFrom", label: "Valid From" },
    { key: "validTo", label: "Valid To" },
    { key: "status", label: "Status" },
  ];

  const fetch = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (limit) params.append("limit", String(limit));
      if (currentPage) params.append("page", String(currentPage));
      if (search) params.append("q", search);

      const url = `/admin/retail-enrollee-dependents/${dependentId}/authorization-codes?${params.toString()}`;

      const data = await apiClient(url, {
        method: "GET",
        onLoading: (l) => setLoading(l),
      });

      const items: any[] =
        data?.data?.authorizationCodes &&
        Array.isArray(data.data.authorizationCodes)
          ? data.data.authorizationCodes
          : Array.isArray(data)
          ? data
          : [];

      setAuthorizationCodes(items);
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
      console.warn("Authorization codes fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [limit, currentPage, search, dependentId]);

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

  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "used":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
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

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Authorization Codes
          </h3>
        </div>

        <div className="flex gap-3.5">
          <div className="hidden flex-col gap-3 sm:flex sm:flex-row sm:items-center">
            <input
              type="text"
              placeholder="Search codes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 placeholder-gray-500 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
            />
          </div>
        </div>
      </div>
      {loading ? (
        <SpinnerThree />
      ) : authorizationCodes.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No authorization codes found
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
              {authorizationCodes.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-400">
                    {item?.authorizationCode || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-400">
                    {item?.authorizationType || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-400">
                    {item?.Provider?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-400">
                    {item?.Diagnosis?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-400">
                    {item?.amountAuthorized
                      ? `₦${item.amountAuthorized.toLocaleString()}`
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-400">
                    {formatDate(item?.validFrom)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-400">
                    {formatDate(item?.validTo)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusBadge(
                        item?.status
                      )}`}
                    >
                      {item?.status || "N/A"}
                    </span>
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

export default RetailDependentAuthorizationCodesTable;
