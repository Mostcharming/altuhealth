"use client";

import Select from "@/components/form/Select";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { EyeIcon, TrashBinIcon } from "@/icons";
import { cancelAppointment, fetchAppointments } from "@/lib/apis/appointment";
import { formatDate } from "@/lib/formatDate";
import { Appointment, useAppointmentStore } from "@/lib/store/appointmentStore";
import { capitalizeWords } from "@/utils";
import React, { useCallback, useEffect, useState } from "react";
import AppointmentDetailModal from "./AppointmentDetailModal";

const AppointmentTable: React.FC = () => {
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
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const appointments = useAppointmentStore((s) => s.appointments);
  const setAppointments = useAppointmentStore((s) => s.setAppointments);
  const removeAppointment = useAppointmentStore((s) => s.removeAppointment);

  type Header = {
    key: keyof Appointment | "actions";
    label: string;
  };

  const select = [
    { value: "10", label: "10" },
    { value: "20", label: "20" },
    { value: "30", label: "30" },
    { value: "40", label: "40" },
    { value: "50", label: "50" },
  ];

  const appointmentStatuses = [
    { value: "", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "attended", label: "Attended" },
    { value: "missed", label: "Missed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "rescheduled", label: "Rescheduled" },
  ];

  const headers: Header[] = [
    { key: "id", label: "Appointment ID" },
    { key: "providerId", label: "Provider" },
    { key: "appointmentDateTime", label: "Appointment Date/Time" },
    { key: "complaint", label: "Complaint" },
    { key: "status", label: "Status" },
    { key: "createdAt", label: "Created At" },
    { key: "actions", label: "Actions" },
  ];

  const fetch = useCallback(async () => {
    try {
      setLoading(true);

      const data = await fetchAppointments({
        limit,
        page: currentPage,
        q: search,
        status: selectedStatus || undefined,
      });

      const items: Appointment[] =
        data?.data?.list && Array.isArray(data.data.list)
          ? data.data.list
          : Array.isArray(data)
          ? data
          : [];

      setAppointments(items);
      setTotalItems(data?.data?.count ?? 0);
      setHasNextPage(Boolean(data?.data?.hasNextPage));
      setHasPreviousPage(Boolean(data?.data?.hasPrevPage));
      setTotalPages(data?.data?.totalPages ?? 1);
    } catch (err) {
      console.warn("Appointments fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [limit, currentPage, search, selectedStatus, setAppointments]);

  useEffect(() => {
    fetch();
  }, [fetch]);

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

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleCancel = async (appointmentId: string) => {
    if (confirm("Are you sure you want to cancel this appointment?")) {
      try {
        await cancelAppointment(appointmentId);
        removeAppointment(appointmentId);
        alert("Appointment cancelled successfully");
      } catch (err) {
        console.error("Failed to cancel appointment", err);
        alert("Failed to cancel appointment");
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "approved":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "rejected":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "attended":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "missed":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "cancelled":
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
      case "rescheduled":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            My Appointments
          </h3>
        </div>

        <div className="flex gap-3.5">
          <div className="hidden flex-col gap-3 sm:flex sm:flex-row sm:items-center">
            <Select
              options={appointmentStatuses}
              placeholder="Select status"
              onChange={handleStatusChange}
              defaultValue={selectedStatus}
            />
            <div className="relative">
              <input
                type="text"
                placeholder="Search appointments..."
                className="rounded border border-gray-300 bg-white px-4 py-2 pl-10 text-sm placeholder-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
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
                    d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17ZM9 15C12.3137 15 15 12.3137 15 9C15 5.68629 12.3137 3 9 3C5.68629 3 3 5.68629 3 9C3 12.3137 5.68629 15 9 15Z"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12.8536 14.6464C13.0488 14.8417 13.3655 14.8417 13.5607 14.6464L18.3536 9.85355C18.5488 9.65829 18.5488 9.34171 18.3536 9.14645C18.1583 8.95118 17.8417 8.95118 17.6464 9.14645L12.8536 13.9393C12.6583 14.1345 12.6583 14.4512 12.8536 14.6464Z"
                  />
                </svg>
              </span>
            </div>
            <Select
              options={select}
              onChange={handleSelectChange}
              defaultValue="10"
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
            <tbody className="divide-x divide-y divide-gray-200 dark:divide-gray-800">
              {appointments.map((appointment: Appointment) => (
                <tr
                  key={appointment.id}
                  className="transition hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <td className="p-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
                      {appointment.id?.substring(0, 8) || "-"}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
                      {appointment.Provider
                        ? `${capitalizeWords(appointment.Provider.name)} `
                        : "-"}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <p className="text-sm text-gray-700 dark:text-gray-400">
                      {appointment.appointmentDateTime
                        ? formatDate(appointment.appointmentDateTime)
                        : "-"}
                    </p>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <p className="text-sm text-gray-700 dark:text-gray-400 max-w-xs truncate">
                      {appointment.complaint
                        ? appointment.complaint.substring(0, 30) + "..."
                        : "-"}
                    </p>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {capitalizeWords(appointment.status)}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <p className="text-sm text-gray-700 dark:text-gray-400">
                      {appointment.createdAt
                        ? formatDate(appointment.createdAt)
                        : "-"}
                    </p>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(appointment)}
                        className="text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                        title="View Details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      {appointment.status === "pending" && (
                        <button
                          onClick={() => handleCancel(appointment.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Cancel Appointment"
                        >
                          <TrashBinIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {appointments.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No appointments found
              </p>
            </div>
          )}
        </div>
      )}

      <div className="border-t border-gray-200 px-5 py-4 dark:border-gray-800">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {startEntry} to {endEntry} of {totalItems} appointments
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={previousPage}
              disabled={!hasPreviousPage}
              className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:text-gray-400"
            >
              Previous
            </button>

            {visiblePages.map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`rounded px-3 py-2 text-sm ${
                  page === currentPage
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-900"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={nextPage}
              disabled={!hasNextPage}
              className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:text-gray-400"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <AppointmentDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        appointment={selectedAppointment}
      />
    </div>
  );
};

export default AppointmentTable;
