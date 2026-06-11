"use client";

import Select from "@/components/form/Select";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { EyeIcon } from "@/icons";
import { fetchPaymentAdvices } from "@/lib/apis/paymentAdvice";
import capitalizeWords from "@/lib/capitalize";
import { formatDate, formatPrice } from "@/lib/formatDate";
import {
  PaymentAdvice,
  usePaymentAdviceStore,
} from "@/lib/store/paymentAdviceStore";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";

const ClaimsRefundsTable: React.FC = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const paymentAdvices = usePaymentAdviceStore((s) => s.paymentAdvices);
  const setPaymentAdvices = usePaymentAdviceStore((s) => s.setPaymentAdvices);

  const pageSizes = [
    { value: "10", label: "10" },
    { value: "20", label: "20" },
    { value: "30", label: "30" },
    { value: "40", label: "40" },
    { value: "50", label: "50" },
  ];

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchPaymentAdvices({
        limit,
        page: currentPage,
        q: search,
      });

      const items: PaymentAdvice[] =
        data?.data?.paymentAdvices && Array.isArray(data.data.paymentAdvices)
          ? data.data.paymentAdvices
          : Array.isArray(data)
          ? data
          : [];
      const pagination = data?.data?.pagination;

      setPaymentAdvices(items);
      setTotalItems(pagination?.total ?? 0);
      setTotalPages(pagination?.pages ?? 1);
      setHasNextPage(Boolean(pagination?.hasNextPage));
      setHasPreviousPage(Boolean(pagination?.hasPreviousPage));
    } catch (err) {
      console.warn("Payment advice fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, search, setPaymentAdvices]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const startEntry = totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endEntry = Math.min(currentPage * limit, totalItems);

  const visiblePages = useMemo(() => {
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPages]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "paid":
      case "acknowledged":
        return "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400";
      case "failed":
        return "bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400";
      case "approved":
      case "sent":
        return "bg-info-100 text-info-700 dark:bg-info-900/30 dark:text-info-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 dark:border-gray-800 xl:flex-row xl:items-center xl:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Payments & Refunds
        </h3>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
              placeholder="Search payment advice..."
              className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pr-4 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden sm:w-[300px] dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>
      {loading ? (
        <SpinnerThree />
      ) : (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                {[
                  "Advice Number",
                  "Batch",
                  "Claims",
                  "Amount",
                  "Payment Date",
                  "Status",
                  "Actions",
                ].map((header) => (
                  <th
                    key={header}
                    className="p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {paymentAdvices.map((advice) => (
                <tr
                  key={advice.id}
                  className="transition hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <td className="p-4 text-sm font-medium text-gray-800 dark:text-white/90">
                    {advice.paymentAdviceNumber}
                  </td>
                  <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                    {advice.paymentBatch?.title || "-"}
                  </td>
                  <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                    {advice.numberOfClaims}
                  </td>
                  <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                    {formatPrice(advice.totalAmount)}
                  </td>
                  <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                    {advice.paymentDate ? formatDate(advice.paymentDate) : "-"}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeColor(
                        advice.status
                      )}`}
                    >
                      {capitalizeWords(advice.status.replace(/_/g, " "))}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      className="text-gray-500 hover:text-brand-500 dark:text-gray-400"
                      onClick={() => router.push(`/claims-refunds/${advice.id}`)}
                      aria-label="View payment advice"
                    >
                      <EyeIcon />
                    </button>
                  </td>
                </tr>
              ))}
              {paymentAdvices.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="p-6 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No payments or refunds found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">Show</span>
          <Select
            options={pageSizes}
            placeholder="10"
            onChange={(value) => {
              setLimit(Number(value));
              setCurrentPage(1);
            }}
            defaultValue={String(limit)}
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            entries
          </span>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {startEntry} to {endEntry} of {totalItems} entries
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
            disabled={!hasPreviousPage}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
          >
            Previous
          </button>
          {visiblePages.map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`rounded-lg px-3 py-2 text-sm ${
                page === currentPage
                  ? "bg-brand-500 text-white"
                  : "border border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((page) => (hasNextPage ? page + 1 : page))}
            disabled={!hasNextPage}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClaimsRefundsTable;
