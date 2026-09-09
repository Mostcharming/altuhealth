"use client";

import { apiClient } from "@/lib/apiClient";
import { useCallback, useEffect, useState } from "react";

type RequestStatus =
  | "pending"
  | "approved"
  | "declined"
  | "cancelled"
  | "archived";

type EnrolleeSummary = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  policyNumber: string;
  type: "Enrollee" | "RetailEnrollee";
  isActive: boolean;
};

type DeletionRequest = {
  id: string;
  userId: string;
  userType: "Enrollee" | "RetailEnrollee";
  reason: string;
  status: RequestStatus;
  adminNote?: string | null;
  retentionExpiresAt?: string | null;
  retentionDaysRemaining?: number | null;
  createdAt: string;
  enrollee?: EnrolleeSummary | null;
};

type ListResponse = {
  data?: {
    list: DeletionRequest[];
    count: number;
    page: number;
    totalPages: number;
  };
};

type ActionResponse = { data?: { request?: DeletionRequest } };

const statusStyles: Record<RequestStatus, string> = {
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  approved: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
  declined: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300",
  cancelled: "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300",
  archived: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300",
};

export default function AccountDeletionRequestsTable() {
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [status, setStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<DeletionRequest | null>(null);
  const [action, setAction] = useState<"approve" | "decline" | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [saving, setSaving] = useState(false);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (status) params.set("status", status);
      if (search) params.set("q", search);
      const response = (await apiClient(
        `/admin/account-deletion-requests?${params.toString()}`,
      )) as ListResponse;
      setRequests(response.data?.list || []);
      setCount(response.data?.count || 0);
      setTotalPages(response.data?.totalPages || 1);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load account deletion requests.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const openAction = (
    request: DeletionRequest,
    nextAction: "approve" | "decline",
  ) => {
    setSelected(request);
    setAction(nextAction);
    setAdminNote("");
  };

  const closeAction = () => {
    if (saving) return;
    setSelected(null);
    setAction(null);
    setAdminNote("");
  };

  const performAction = async () => {
    if (!selected || !action) return;
    try {
      setSaving(true);
      setError("");
      const response = (await apiClient(
        `/admin/account-deletion-requests/${selected.id}/${action}`,
        { method: "PATCH", body: { adminNote: adminNote.trim() || null } },
      )) as ActionResponse;
      const updated = response.data?.request;
      if (updated) {
        setRequests((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );
      }
      closeAction();
      await loadRequests();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : `Unable to ${action} this request.`,
      );
    } finally {
      setSaving(false);
      setSelected(null);
      setAction(null);
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Account deletion requests
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Review enrollee requests. Approved accounts remain accessible for a
            60-day cancellation window before they are archived.
          </p>
        </div>

        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setSearch(searchInput.trim());
          }}
        >
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Name, email, policy or reason"
            className="min-w-64 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-brand-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="declined">Declined</option>
            <option value="cancelled">Cancelled</option>
            <option value="archived">Archived</option>
          </select>
          <button
            type="submit"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Search
          </button>
        </form>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/20 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-white/[0.03]">
            <tr>
              {[
                "Enrollee",
                "Type",
                "Reason",
                "Requested",
                "Status",
                "Retention",
                "Actions",
              ].map((heading) => (
                <th
                  key={heading}
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-transparent">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">
                  Loading requests...
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">
                  No account deletion requests found.
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr key={request.id} className="align-top">
                  <td className="whitespace-nowrap px-4 py-4">
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {request.enrollee
                        ? `${request.enrollee.firstName} ${request.enrollee.lastName}`
                        : "Unknown enrollee"}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {request.enrollee?.email || request.userId}
                    </p>
                    {request.enrollee?.policyNumber && (
                      <p className="mt-1 text-xs text-gray-500">
                        {request.enrollee.policyNumber}
                      </p>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {request.userType === "RetailEnrollee" ? "Retail" : "Corporate"}
                  </td>
                  <td className="max-w-xs px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                    <p className="line-clamp-3" title={request.reason}>
                      {request.reason}
                    </p>
                    {request.adminNote && (
                      <p className="mt-2 text-xs text-gray-500">Note: {request.adminNote}</p>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[request.status]}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {request.status === "approved" ? (
                      <>
                        <p>{request.retentionDaysRemaining ?? 0} day(s) left</p>
                        {request.retentionExpiresAt && (
                          <p className="mt-1 text-xs text-gray-500">
                            Until {new Date(request.retentionExpiresAt).toLocaleDateString()}
                          </p>
                        )}
                      </>
                    ) : request.status === "archived" ? (
                      "Access disabled"
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    {request.status === "pending" ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openAction(request, "approve")}
                          className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => openAction(request, "decline")}
                          className="rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/20"
                        >
                          Decline
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Reviewed</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex items-center justify-between text-sm text-gray-500">
        <span>{count} request(s)</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="rounded-lg border border-gray-300 px-3 py-2 disabled:opacity-40 dark:border-gray-700"
          >
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-lg border border-gray-300 px-3 py-2 disabled:opacity-40 dark:border-gray-700"
          >
            Next
          </button>
        </div>
      </div>

      {selected && action && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-gray-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h2 className="text-lg font-semibold capitalize text-gray-800 dark:text-white">
              {action} deletion request
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
              {action === "approve"
                ? "Approval starts the 60-day retention window. The enrollee may cancel before it expires; after that, access is disabled and records remain archived."
                : "Declining keeps the account active and allows the enrollee to submit another request later."}
            </p>
            <label className="mt-5 block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Admin note (optional)
              </span>
              <textarea
                value={adminNote}
                onChange={(event) => setAdminNote(event.target.value)}
                maxLength={2000}
                rows={4}
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-brand-400 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                placeholder="Add context for the enrollee or audit trail."
              />
            </label>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeAction}
                disabled={saving}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={performAction}
                disabled={saving}
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
                  action === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {saving ? "Saving..." : `Confirm ${action}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
