"use client";

import Select from "@/components/form/Select";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { EyeIcon } from "@/icons";
import { fetchClaims, fetchProviders } from "@/lib/apis/claim";
import capitalizeWords from "@/lib/capitalize";
import { formatDate, formatPrice, getMonthName } from "@/lib/formatDate";
import { Claim, useClaimStore } from "@/lib/store/claimStore";
import { Provider, useProviderStore } from "@/lib/store/providerStore";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

const ClaimTable: React.FC = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [totalItems, setTotalItems] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [hasPreviousPage, setHasPreviousPage] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(1);
  const claims = useClaimStore((s) => s.claims);
  const setClaims = useClaimStore((s) => s.setClaims);
  const providers = useProviderStore((s) => s.providers);
  const setProviders = useProviderStore((s) => s.setProviders);

  type Header = {
    key: keyof Claim | "actions";
    label: string;
  };

  const select = [
    { value: "10", label: "10" },
    { value: "20", label: "20" },
    { value: "30", label: "30" },
    { value: "40", label: "40" },
    { value: "50", label: "50" },
  ];

  const claimStatuses = [
    { value: "", label: "All Statuses" },
    { value: "draft", label: "Draft" },
    { value: "submitted", label: "Submitted" },
    { value: "pending_vetting", label: "Pending Vetting" },
    { value: "under_review", label: "Under Review" },
    { value: "awaiting_payment", label: "Awaiting Payment" },
    { value: "paid", label: "Paid" },
    { value: "rejected", label: "Rejected" },
    { value: "partially_paid", label: "Partially Paid" },
    { value: "queried", label: "Queried" },
  ];

  const headers: Header[] = [
    { key: "claimReference", label: "Claim Reference" },
    { key: "providerId", label: "Provider" },
    { key: "amountSubmitted", label: "Amount Submitted" },
    { key: "amountProcessed", label: "Amount Processed" },
    { key: "status", label: "Status" },
    { key: "year", label: "Year" },
    { key: "month", label: "Month" },
    { key: "createdAt", label: "Date Created" },
    { key: "actions", label: "Actions" },
  ];

  const fetch = useCallback(async () => {
    try {
      setLoading(true);

      const data = await fetchClaims({
        limit,
        page: currentPage,
        q: search,
        providerId: selectedProviderId || undefined,
        status: selectedStatus || undefined,
      });

      const items: Claim[] =
        data?.data?.claims && Array.isArray(data.data.claims)
          ? data.data.claims
          : Array.isArray(data)
          ? data
          : [];

      setClaims(items);
      setTotalItems(data?.data?.pagination?.total ?? 0);
      setHasNextPage(Boolean(data?.data?.pagination?.hasNextPage));
      setHasPreviousPage(Boolean(data?.data?.pagination?.hasPreviousPage));
      setTotalPages(data?.data?.pagination?.pages ?? 1);
    } catch (err) {
      console.warn("Claims fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [
    limit,
    currentPage,
    search,
    selectedProviderId,
    selectedStatus,
    setClaims,
  ]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // Fetch providers on component mount
  useEffect(() => {
    const fetchProviderList = async () => {
      try {
        const data = await fetchProviders({ limit: 100 });
        const items: Provider[] =
          data?.data?.list && Array.isArray(data.data.list)
            ? data.data.list
            : [];
        setProviders(items);
      } catch (err) {
        console.warn("Providers fetch failed", err);
      }
    };

    fetchProviderList();
  }, [setProviders]);

  const startEntry: number =
    totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endEntry: number = Math.min(currentPage * limit, totalItems);

  const handleSelectChange = (selectedValue: string) => {
    setLimit(Number(selectedValue));
    setCurrentPage(1);
  };

  const handleProviderChange = (selectedValue: string) => {
    setSelectedProviderId(selectedValue);
    setCurrentPage(1);
  };

  const handleStatusChange = (selectedValue: string) => {
    setSelectedStatus(selectedValue);
    setCurrentPage(1);
  };

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

  const handleNavigate = (claim: Claim) => {
    router.push(`/claims/${claim.id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
      case "submitted":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "pending_vetting":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Under_review":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "awaiting_payment":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "paid":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "rejected":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "partially_paid":
        return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400";
      case "queried":
        return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Claims Listing
          </h3>
        </div>

        <div className="flex gap-3.5">
          <div className="hidden flex-col gap-3 sm:flex sm:flex-row sm:items-center">
            <Select
              options={[
                { value: "", label: "All Providers" },
                ...providers.map((provider) => ({
                  value: provider.id,
                  label: provider.name,
                })),
              ]}
              placeholder="Select provider"
              onChange={handleProviderChange}
              defaultValue={selectedProviderId}
            />
            <Select
              options={claimStatuses}
              placeholder="Select status"
              onChange={handleStatusChange}
              defaultValue={selectedStatus}
            />
            <div className="relative">
              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
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
                    d="M3.04199 9.37363C3.04199 5.87693 5.87735 3.04199 9.37533 3.04199C12.8733 3.04199 15.7087 5.87693 15.7087 9.37363C15.7087 12.8703 12.8733 15.7053 9.37533 15.7053C5.87735 15.7053 3.04199 12.8703 3.04199 9.37363ZM9.37533 1.54199C5.04926 1.54199 1.54199 5.04817 1.54199 9.37363C1.54199 13.6991 5.04926 17.2053 9.37533 17.2053C11.2676 17.2053 13.0032 16.5344 14.3572 15.4176L17.1773 18.238C17.4702 18.5309 17.945 18.5309 18.2379 18.238C18.5308 17.9451 18.5309 17.4703 18.238 17.1773L15.4182 14.3573C16.5367 13.0033 17.2087 11.2669 17.2087 9.37363C17.2087 5.04817 13.7014 1.54199 9.37533 1.54199Z"
                    fill=""
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search..."
                className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pr-4 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden xl:w-[300px] dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
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
              {claims.map((claim: Claim) => (
                <tr
                  key={claim.id}
                  className="transition hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <td className="p-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
                      {capitalizeWords(claim.claimReference)}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
                      {capitalizeWords(claim.Provider?.name) || "-"}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <p className="text-sm text-gray-700 dark:text-gray-400">
                      {formatPrice(claim.amountSubmitted)}
                    </p>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <p className="text-sm text-gray-700 dark:text-gray-400">
                      {formatPrice(claim.amountProcessed)}
                    </p>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                        claim.status
                      )}`}
                    >
                      {capitalizeWords(claim.status.replace(/_/g, " "))}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <p className="text-sm text-gray-700 dark:text-gray-400">
                      {claim.year}
                    </p>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <p className="text-sm text-gray-700 dark:text-gray-400">
                      {getMonthName(claim.month)}
                    </p>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <p className="text-sm text-gray-700 dark:text-gray-400">
                      {claim.createdAt ? formatDate(claim.createdAt) : "-"}
                    </p>
                  </td>

                  <td className="p-4 whitespace-nowrap">
                    <div className="flex items-center w-full gap-2">
                      <button
                        onClick={() => handleNavigate(claim)}
                        className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90"
                      >
                        <EyeIcon />
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

export default ClaimTable;
