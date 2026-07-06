"use client";

import Select from "@/components/form/Select";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { fetchEnrolleeBenefits } from "@/lib/apis/benefit";
import React, { useCallback, useEffect, useState } from "react";

interface Benefit {
  id: string;
  name: string;
  benefitCategory?: string;
  benefitCategoryId?: string;
  isCovered: boolean;
  description?: string;
  coverageType?:
    | "times_per_year"
    | "times_per_month"
    | "quarterly"
    | "unlimited"
    | "amount_based"
    | "limit_based";
  coverageValue?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface BenefitsTableProps {
  onFetchRef?: (fetch: () => Promise<void>) => void;
}

const BenefitsTable: React.FC<BenefitsTableProps> = ({ onFetchRef }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  // const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [totalItems, setTotalItems] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [hasPreviousPage, setHasPreviousPage] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [benefits, setBenefits] = useState<Benefit[]>([]);

  type Header = {
    key: keyof Benefit | "actions";
    label: string;
  };

  const select = [
    { value: "10", label: "10" },
    { value: "20", label: "20" },
    { value: "30", label: "30" },
    { value: "40", label: "40" },
    { value: "50", label: "50" },
  ];

  // const benefitStatuses = [
  //   { value: "", label: "All Statuses" },
  //   { value: "active", label: "Active" },
  //   { value: "inactive", label: "Inactive" },
  //   { value: "pending", label: "Pending" },
  //   { value: "expired", label: "Expired" },
  // ];

  const headers: Header[] = [
    { key: "name", label: "Benefit Name" },
    { key: "description", label: "Description" },
  ];

  const fetch = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch benefits from the API
      const response = await fetchEnrolleeBenefits({
        limit,
        page: currentPage,
        search: search || undefined,
        // status: selectedStatus || undefined,
      });

      // Handle response structure
      const benefitsData = response?.data?.benefits || [];
      const paginationData = response?.data?.pagination || {};

      // Format benefits to match component interface
      const formattedBenefits: Benefit[] = benefitsData.map(
        (benefit: Record<string, unknown>) => ({
          id: String(benefit.id),
          name: String(benefit.name),
          benefitType: String(benefit.benefitType || "General"),
          coverageAmount: Number(benefit.coverageAmount || 0),
          currency: String(benefit.currency || "NGN"),
          limitPerAnnum: Number(benefit.limitPerAnnum || 0),
          amountUtilized: Number(benefit.amountUtilized || 0),
          remainingBalance: Number(benefit.remainingBalance || 0),
          status:
            (benefit.status as "active" | "inactive" | "pending" | "expired") ||
            "active",
          startDate: benefit.startDate ? String(benefit.startDate) : undefined,
          endDate: benefit.endDate ? String(benefit.endDate) : undefined,
          provider: benefit.provider ? String(benefit.provider) : undefined,
          description: benefit.description
            ? String(benefit.description)
            : undefined,
          createdAt: benefit.createdAt ? String(benefit.createdAt) : undefined,
          updatedAt: benefit.updatedAt ? String(benefit.updatedAt) : undefined,
        })
      );

      setBenefits(formattedBenefits);
      setTotalItems(Number(paginationData.total || 0));
      setHasNextPage(Boolean(paginationData.hasNextPage || false));
      setHasPreviousPage(Boolean(paginationData.hasPreviousPage || false));
      setTotalPages(Number(paginationData.totalPages || 1));
    } catch (err) {
      console.error("Error fetching benefits:", err);
      // Clear data on error
      setBenefits([]);
      setTotalItems(0);
      setHasNextPage(false);
      setHasPreviousPage(false);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [
    limit,
    currentPage,
    search,
    //  selectedStatus
  ]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  useEffect(() => {
    if (onFetchRef) {
      onFetchRef(fetch);
    }
  }, [fetch, onFetchRef]);

  const startEntry: number =
    totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endEntry: number = Math.min(currentPage * limit, totalItems);

  const handleSelectChange = (selectedValue: string) => {
    setLimit(Number(selectedValue));
    setCurrentPage(1);
  };

  // const handleStatusChange = (selectedValue: string) => {
  //   setSelectedStatus(selectedValue);
  //   setCurrentPage(1);
  // };

  const previousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const nextPage = () => {
    setCurrentPage((prev) => (hasNextPage ? prev + 1 : prev));
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const visiblePages: number[] = [];
  const maxVisiblePages = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const end = Math.min(totalPages, start + maxVisiblePages - 1);

  if (end - start < maxVisiblePages - 1) {
    start = Math.max(1, end - maxVisiblePages + 1);
  }

  for (let i = start; i <= end; i++) {
    visiblePages.push(i);
  }

  // Removed modal functionality

  // Removed getStatusColor - no longer needed

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Benefit Coverage
          </h3>
        </div>

        <div className="flex gap-3.5">
          <div className="hidden flex-col gap-3 sm:flex sm:flex-row sm:items-center">
            {/* <Select
              options={benefitStatuses}
              placeholder="Select status"
              onChange={handleStatusChange}
              defaultValue={selectedStatus}
            /> */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search benefits..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 placeholder-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <SpinnerThree />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
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
            <tbody className="divide-x divide-y divide-gray-200 dark:divide-gray-800">
              {benefits.map((benefit: Benefit) => (
                <tr
                  key={benefit.id}
                  className="transition hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <td className="p-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
                      {benefit.name || "-"}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700 dark:text-gray-400">
                      {benefit.description || "-"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {benefits.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No benefits found.
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

export default BenefitsTable;
