"use client";

import Select from "@/components/form/Select";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { EyeIcon } from "@/icons";
import { fetchMedicalHistories } from "@/lib/apis/medicalHistory";
import capitalizeWords from "@/lib/capitalize";
import { formatDate } from "@/lib/formatDate";
import {
  MedicalHistory,
  useMedicalHistoryStore,
} from "@/lib/store/medicalHistoryStore";
import React, { useCallback, useEffect, useState } from "react";
import MedicalHistoryDetailModal from "./MedicalHistoryDetailModal";

interface MedicalHistoryTableProps {
  onFetchRef?: (fetch: () => Promise<void>) => void;
}

const MedicalHistoryTable: React.FC<MedicalHistoryTableProps> = ({
  onFetchRef,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [totalItems, setTotalItems] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [hasPreviousPage, setHasPreviousPage] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalHistory | null>(
    null
  );
  const medicalHistories = useMedicalHistoryStore((s) => s.medicalHistories);
  const setMedicalHistories = useMedicalHistoryStore(
    (s) => s.setMedicalHistories
  );

  type Header = {
    key: keyof MedicalHistory | "actions";
    label: string;
  };

  const select = [
    { value: "10", label: "10" },
    { value: "20", label: "20" },
    { value: "30", label: "30" },
    { value: "40", label: "40" },
    { value: "50", label: "50" },
  ];

  const medicalHistoryStatuses = [
    { value: "", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "reviewed", label: "Reviewed" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

  const headers: Header[] = [
    { key: "id", label: "Record ID" },
    { key: "serviceDate", label: "Service Date" },
    { key: "evsCode", label: "EVS Code" },
    { key: "amount", label: "Amount" },
    { key: "status", label: "Status" },
    { key: "createdAt", label: "Created At" },
    { key: "actions", label: "Actions" },
  ];

  const fetch = useCallback(async () => {
    try {
      setLoading(true);

      const data = await fetchMedicalHistories({
        limit,
        page: currentPage,
        q: search,
        status: selectedStatus || undefined,
      });

      const items: MedicalHistory[] =
        data?.data?.list && Array.isArray(data.data.list)
          ? data.data.list
          : Array.isArray(data)
          ? data
          : [];

      setMedicalHistories(items);
      setTotalItems(data?.data?.count ?? 0);
      setHasNextPage(Boolean(data?.data?.hasNextPage));
      setHasPreviousPage(Boolean(data?.data?.hasPrevPage));
      setTotalPages(data?.data?.totalPages ?? 1);
    } catch (err) {
      console.error("Error fetching medical histories:", err);
    } finally {
      setLoading(false);
    }
  }, [limit, currentPage, search, selectedStatus, setMedicalHistories]);

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

  const handleViewDetails = (record: MedicalHistory) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Medical History Records
          </h3>
        </div>

        <div className="flex gap-3.5">
          <div className="hidden flex-col gap-3 sm:flex sm:flex-row sm:items-center">
            <Select
              options={medicalHistoryStatuses}
              placeholder="Select status"
              onChange={handleStatusChange}
              defaultValue={selectedStatus}
            />
            <div className="relative">
              <input
                type="text"
                placeholder="Search records..."
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
              {medicalHistories.map((record: MedicalHistory) => (
                <tr
                  key={record.id}
                  className="transition hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <td className="p-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
                      {record.id?.substring(0, 8) || "-"}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700 dark:text-gray-400">
                      {record.serviceDate
                        ? formatDate(record.serviceDate)
                        : "-"}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700 dark:text-gray-400">
                      {record.evsCode || "-"}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700 dark:text-gray-400">
                      {record.amount
                        ? `${record.currency} ${Number(
                            record.amount
                          ).toLocaleString()}`
                        : "-"}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        record.status
                      )}`}
                    >
                      {capitalizeWords(record.status)}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700 dark:text-gray-400">
                      {record.createdAt ? formatDate(record.createdAt) : "-"}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <button
                      onClick={() => handleViewDetails(record)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-50 p-2 text-brand-600 hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:hover:bg-brand-900/50 transition"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {medicalHistories.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No medical history records found.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 px-5 py-4 dark:border-gray-800 sm:flex-row">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {startEntry} to {endEntry} of {totalItems} records
        </div>

        <div className="flex items-center gap-3">
          <Select
            options={select}
            onChange={handleSelectChange}
            defaultValue={String(limit)}
          />

          <div className="flex items-center gap-2">
            <button
              onClick={previousPage}
              disabled={!hasPreviousPage}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              Previous
            </button>

            {visiblePages.map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  currentPage === page
                    ? "bg-brand-500 text-white dark:bg-brand-600"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={nextPage}
              disabled={!hasNextPage}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <MedicalHistoryDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        medicalHistory={selectedRecord}
      />
    </div>
  );
};

export default MedicalHistoryTable;
