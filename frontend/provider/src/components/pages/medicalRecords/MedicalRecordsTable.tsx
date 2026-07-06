"use client";

import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { EyeIcon } from "@/icons";
import {
  fetchProviderMedicalRecords,
  getProviderMedicalRecord,
  MedicalRecord,
} from "@/lib/apis/medicalRecord";
import React, { FormEvent, useMemo, useState } from "react";

type Props = {
  title: string;
  description: string;
  requireSearch?: boolean;
};

function formatDate(value?: string | null) {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatMoney(value?: string | number | null, currency = "NGN") {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount)) return "N/A";

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function memberName(record: MedicalRecord) {
  const firstName = record.member?.firstName || "";
  const lastName = record.member?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || "Unknown patient";
}

function memberTypeLabel(type: string) {
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusBadge(status?: string) {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "rejected":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    case "reviewed":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    default:
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
  }
}

export default function MedicalRecordsTable({
  title,
  description,
  requireSearch = false,
}: Props) {
  const [query, setQuery] = useState("");
  const [searchedQuery, setSearchedQuery] = useState("");
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
    null,
  );
  const [loading, setLoading] = useState(!requireSearch);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const select = [
    { value: "10", label: "10" },
    { value: "20", label: "20" },
    { value: "30", label: "30" },
    { value: "40", label: "40" },
    { value: "50", label: "50" },
  ];

  const headers = [
    "Patient",
    "Policy",
    "Diagnosis",
    "EVS Code",
    "Service Date",
    "Amount",
    "Status",
    "Action",
  ];

  async function loadRecords(searchValue = query) {
    const normalizedQuery = searchValue.trim();
    if (requireSearch && !normalizedQuery) {
      setError("Enter an email address or policy number.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await fetchProviderMedicalRecords(normalizedQuery);
      setRecords(
        Array.isArray(response?.data?.records) ? response.data.records : [],
      );
      setSearchedQuery(normalizedQuery);
      setPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load records.");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (!requireSearch) {
      loadRecords("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requireSearch]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadRecords(query);
  }

  async function handleView(record: MedicalRecord) {
    try {
      setDetailLoading(true);
      setSelectedRecord(record);
      const response = await getProviderMedicalRecord(
        record.id,
        record.memberType,
      );
      if (response?.data?.record) setSelectedRecord(response.data.record);
    } catch {
      setSelectedRecord(record);
    } finally {
      setDetailLoading(false);
    }
  }

  const totalItems = records.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const paginatedRecords = useMemo(
    () => records.slice((page - 1) * limit, page * limit),
    [records, page, limit],
  );
  const hasPreviousPage = page > 1;
  const hasNextPage = page < totalPages;
  const startEntry = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const endEntry = Math.min(page * limit, totalItems);
  const visiblePages = useMemo(() => {
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [page, totalPages]);

  const showInitialSearch =
    requireSearch && !searchedQuery && records.length === 0;

  function goToPage(nextPage: number) {
    if (nextPage >= 1 && nextPage <= totalPages) setPage(nextPage);
  }

  function handleSelectChange(value: string) {
    setLimit(Number(value));
    setPage(1);
  }

  return (
    <div className="space-y-5 mt-4">
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {title}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 sm:flex-row sm:items-start"
        >
          <div className="w-full sm:max-w-md">
            <Input
              type="text"
              placeholder="Email address or policy number"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              hint="Search exact email or policy number."
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="h-11 rounded-lg bg-brand-500 px-5 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Searching..." : "Search"}
          </button>
          {!requireSearch && searchedQuery && (
            <button
              type="button"
              className="h-11 rounded-lg border border-gray-300 px-5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.04]"
              onClick={() => {
                setQuery("");
                loadRecords("");
              }}
            >
              Clear
            </button>
          )}
        </form>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Medical History
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {totalItems} record{totalItems === 1 ? "" : "s"} found
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12">
            <SpinnerThree />
          </div>
        ) : showInitialSearch ? (
          <div className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
            Search by patient email or policy number to view medical history.
          </div>
        ) : records.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
            No medical history found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                    {headers.map((header) => (
                      <th
                        key={header}
                        className="p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400"
                      >
                        <div className="flex items-center gap-3">
                          <p className="text-theme-xs font-medium text-gray-700 dark:text-gray-400">
                            {header}
                          </p>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-x divide-y divide-gray-200 dark:divide-gray-800">
                  {paginatedRecords.map((record) => (
                    <tr
                      key={`${record.memberType}-${record.id}`}
                      className="transition hover:bg-gray-50 dark:hover:bg-gray-900"
                    >
                      <td className="p-4 whitespace-nowrap">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                          {memberName(record)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {memberTypeLabel(record.memberType)}
                        </p>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <p className="text-sm text-gray-700 dark:text-gray-400">
                          {record.member?.policyNumber || "—"}
                        </p>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <p className="text-sm text-gray-700 dark:text-gray-400">
                          {record.diagnosis?.name || "—"}
                        </p>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <p className="text-sm text-gray-700 dark:text-gray-400">
                          {record.evsCode || "—"}
                        </p>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <p className="text-sm text-gray-700 dark:text-gray-400">
                          {formatDate(record.serviceDate || record.createdAt)}
                        </p>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <p className="text-sm text-gray-700 dark:text-gray-400">
                          {formatMoney(record.amount, record.currency)}
                        </p>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusBadge(record.status)}`}
                        >
                          {record.status || "pending"}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <button
                          type="button"
                          title="View medical record"
                          className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90"
                          onClick={() => handleView(record)}
                        >
                          <EyeIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
                  <span className="text-gray-800 dark:text-white/90">
                    {endEntry}
                  </span>{" "}
                  of{" "}
                  <span className="text-gray-800 dark:text-white/90">
                    {totalItems}
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 bg-gray-50 p-4 sm:p-0 rounded-lg sm:bg-transparent dark:sm:bg-transparent w-full sm:w-auto dark:bg-white/[0.03] sm:justify-normal">
                <button
                  type="button"
                  disabled={!hasPreviousPage}
                  className={`shadow-theme-xs flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 hover:text-gray-800 sm:p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 ${
                    !hasPreviousPage ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => goToPage(page - 1)}
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
                  Page {page} of {totalPages}
                </span>
                <ul className="hidden items-center gap-0.5 sm:flex">
                  {visiblePages.map((visiblePage) => (
                    <li key={visiblePage}>
                      <button
                        type="button"
                        onClick={() => goToPage(visiblePage)}
                        className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                          visiblePage === page
                            ? "bg-blue-600 text-white dark:bg-blue-700"
                            : "hover:bg-gray-100 text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                        }`}
                      >
                        {visiblePage}
                      </button>
                    </li>
                  ))}
                  {visiblePages[visiblePages.length - 1] < totalPages && (
                    <li>
                      <span className="px-2 py-2 text-gray-500">...</span>
                    </li>
                  )}
                </ul>
                <button
                  type="button"
                  disabled={!hasNextPage}
                  className={`shadow-theme-xs flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 hover:text-gray-800 sm:p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 ${
                    !hasNextPage ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => goToPage(page + 1)}
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
          </>
        )}
      </div>

      {selectedRecord && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  {memberName(selectedRecord)}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedRecord.member?.policyNumber || "No policy number"}
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
                onClick={() => setSelectedRecord(null)}
              >
                Close
              </button>
            </div>

            {detailLoading ? (
              <SpinnerThree />
            ) : (
              <div className="grid gap-4 text-sm sm:grid-cols-2">
                <Detail
                  label="Member Type"
                  value={memberTypeLabel(selectedRecord.memberType)}
                />
                <Detail
                  label="Email"
                  value={selectedRecord.member?.email || "N/A"}
                />
                <Detail
                  label="Phone"
                  value={selectedRecord.member?.phoneNumber || "N/A"}
                />
                <Detail
                  label="Provider"
                  value={selectedRecord.provider?.name || "N/A"}
                />
                <Detail
                  label="Diagnosis"
                  value={selectedRecord.diagnosis?.name || "N/A"}
                />
                <Detail
                  label="EVS Code"
                  value={selectedRecord.evsCode || "N/A"}
                />
                <Detail
                  label="Service Date"
                  value={formatDate(selectedRecord.serviceDate)}
                />
                <Detail
                  label="Amount"
                  value={formatMoney(
                    selectedRecord.amount,
                    selectedRecord.currency,
                  )}
                />
                <Detail
                  label="Status"
                  value={selectedRecord.status || "pending"}
                />
                <div className="sm:col-span-2">
                  <Detail label="Notes" value={selectedRecord.notes || "N/A"} />
                </div>
                {selectedRecord.attachmentUrl && (
                  <a
                    href={selectedRecord.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-600 hover:text-brand-700"
                  >
                    View attachment
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <div className="mt-1 text-sm text-gray-800 dark:text-white/90">
        {value}
      </div>
    </div>
  );
}
