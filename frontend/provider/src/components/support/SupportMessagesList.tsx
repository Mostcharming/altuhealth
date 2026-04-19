"use client";

import { useTicketStore } from "@/lib/store/ticketStore";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import CreateTicketModal from "./CreateTicketModal";

const SupportMessagesList: React.FC = () => {
  const {
    tickets = [],
    ticketsLoading,
    ticketsError,
    ticketsPagination,
    listTickets,
  } = useTicketStore();

  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const perPage = 10;
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  const [filters, setFilters] = useState({
    category: "",
    priority: "",
  });

  // Fetch tickets
  useEffect(() => {
    // Map display status to API status
    const statusMap: Record<string, string> = {
      All: "",
      Pending: "pending",
      "In Progress": "in_progress",
      "On Hold": "on_hold",
      Solved: "solved",
      Closed: "closed",
    };

    listTickets({
      page: currentPage,
      limit: perPage,
      q: searchQuery,
      status: statusMap[selectedStatus] || undefined,
      category: filters.category || undefined,
      priority: filters.priority || undefined,
    });
  }, [currentPage, searchQuery, selectedStatus, filters, listTickets]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending:
        "bg-warning-50 dark:bg-warning-500/15 text-warning-600 dark:text-warning-500",
      in_progress:
        "bg-info-50 dark:bg-info-500/15 text-info-600 dark:text-info-500",
      on_hold:
        "bg-yellow-50 dark:bg-yellow-500/15 text-yellow-600 dark:text-yellow-500",
      solved:
        "bg-success-50 dark:bg-success-500/15 text-success-700 dark:text-success-500",
      closed: "bg-gray-50 dark:bg-gray-500/15 text-gray-700 dark:text-gray-500",
    };
    return colors[status] || colors.pending;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "text-green-600 dark:text-green-400",
      medium: "text-blue-600 dark:text-blue-400",
      high: "text-orange-600 dark:text-orange-400",
      urgent: "text-red-600 dark:text-red-400",
    };
    return colors[priority] || colors.medium;
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < (ticketsPagination?.totalPages || 1))
      setCurrentPage(currentPage + 1);
  };

  const handleGoToPage = (page: number) => {
    if (page >= 1 && page <= (ticketsPagination?.totalPages || 1))
      setCurrentPage(page);
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  if (ticketsError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
        <p className="text-red-700 dark:text-red-400">Error: {ticketsError}</p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Header */}
        <div className="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Support Messages
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              View and manage your support tickets
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Status Filter */}
            <div className="hidden h-11 items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 lg:inline-flex dark:bg-gray-900">
              {[
                "All",
                "Pending",
                "In Progress",
                "On Hold",
                "Solved",
                "Closed",
              ].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`text-sm h-10 rounded-md px-3 py-2 font-medium transition-all ${
                    selectedStatus === status
                      ? "shadow-md text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex-1 sm:flex-none">
              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.25 14.25C11.5637 14.25 14.25 11.5637 14.25 8.25C14.25 4.93629 11.5637 2.25 8.25 2.25C4.93629 2.25 2.25 4.93629 2.25 8.25C2.25 11.5637 4.93629 14.25 8.25 14.25Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15.75 15.75L13.0875 13.0875"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={handleSearch}
                className="shadow-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pr-4 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <button
                className="shadow-xs flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 sm:w-auto dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                onClick={() => setShowFilter(!showFilter)}
                type="button"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.5 3H16.5M3.75 9H14.25M6 15H12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Filter
              </button>
              {showFilter && (
                <div className="absolute right-0 z-10 mt-2 w-56 rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-4">
                    <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Category
                    </label>
                    <select
                      name="category"
                      value={filters.category}
                      onChange={handleFilterChange}
                      className="shadow-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-10 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    >
                      <option value="">All Categories</option>
                      <option value="billing">Billing</option>
                      <option value="technical">Technical</option>
                      <option value="claim">Claim</option>
                      <option value="provider">Provider</option>
                      <option value="enrollment">Enrollment</option>
                      <option value="prescription">Prescription</option>
                      <option value="appointment">Appointment</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={filters.priority}
                      onChange={handleFilterChange}
                      className="shadow-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-10 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    >
                      <option value="">All Priorities</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Create Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="shadow-xs flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white sm:w-auto hover:bg-brand-600 transition-colors"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 3.75V14.25M3.75 9H14.25"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              New Ticket
            </button>
          </div>
        </div>

        {/* Table */}
        {ticketsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500 dark:border-gray-700"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mb-4 text-gray-300 dark:text-gray-700"
            >
              <path
                d="M6 10C6 8.89543 6.89543 8 8 8H40C41.1046 8 42 8.89543 42 10V36C42 37.1046 41.1046 38 40 38H8C6.89543 38 6 37.1046 6 36V10Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M6 10L24 22L42 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No support tickets yet
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-brand-500 hover:text-brand-600 font-medium"
            >
              Create your first ticket
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      Ticket ID
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      Subject
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      Category
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      Priority
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      Status
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <Link
                          href={`/support-messages/${ticket.id}`}
                          className="font-medium text-brand-500 hover:text-brand-600"
                        >
                          #{ticket.ticketNumber}
                        </Link>
                      </td>
                      <td className="px-5 py-3">
                        <Link
                          href={`/support-messages/${ticket.id}`}
                          className="text-sm text-gray-700 dark:text-gray-300 hover:text-brand-500"
                        >
                          {ticket.subject}
                        </Link>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm capitalize text-gray-600 dark:text-gray-400">
                          {ticket.category}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-sm font-medium capitalize ${getPriorityColor(
                            ticket.priority
                          )}`}
                        >
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-xs rounded-full px-3 py-1 font-semibold inline-block ${getStatusColor(
                            ticket.status
                          )} capitalize`}
                        >
                          {ticket.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 px-5 py-4 dark:border-gray-800 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Showing {(currentPage - 1) * perPage + 1} to{" "}
                  {Math.min(
                    currentPage * perPage,
                    ticketsPagination?.count || 0
                  )}{" "}
                  of {ticketsPagination?.count || 0}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="shadow-xs h-10 px-4 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Previous
                </button>

                <div className="flex gap-1">
                  {Array.from(
                    { length: ticketsPagination?.totalPages || 1 },
                    (_, i) => i + 1
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => handleGoToPage(page)}
                      className={`h-10 w-10 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? "bg-brand-500 text-white"
                          : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={
                    currentPage === (ticketsPagination?.totalPages || 1)
                  }
                  className="shadow-xs h-10 px-4 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          listTickets({
            page: 1,
            limit: perPage,
          });
        }}
      />
    </>
  );
};

export default SupportMessagesList;
