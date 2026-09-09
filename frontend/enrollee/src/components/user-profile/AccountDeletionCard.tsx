"use client";

import { apiClient } from "@/lib/apiClient";
import { useEffect, useMemo, useState } from "react";

type DeletionStatus =
  | "pending"
  | "approved"
  | "declined"
  | "cancelled"
  | "archived";

type DeletionRequest = {
  id: string;
  reason: string;
  status: DeletionStatus;
  adminNote?: string | null;
  retentionExpiresAt?: string | null;
  retentionDaysRemaining?: number | null;
  canCancel: boolean;
  createdAt: string;
};

type DeletionResponse = {
  data?: { request?: DeletionRequest | null };
};

const statusLabels: Record<DeletionStatus, string> = {
  pending: "Awaiting admin review",
  approved: "Deletion approved",
  declined: "Request declined",
  cancelled: "Request cancelled",
  archived: "Account archived",
};

export default function AccountDeletionCard() {
  const [request, setRequest] = useState<DeletionRequest | null>(null);
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const canCreate = !request || ["declined", "cancelled"].includes(request.status);

  const expiryLabel = useMemo(() => {
    if (!request?.retentionExpiresAt) return "";
    return new Intl.DateTimeFormat("en-NG", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date(request.retentionExpiresAt));
  }, [request?.retentionExpiresAt]);

  const loadRequest = async () => {
    try {
      setLoading(true);
      setError("");
      const response = (await apiClient(
        "/enrollee/account/deletion-request",
      )) as DeletionResponse;
      setRequest(response.data?.request || null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load account deletion settings.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRequest();
  }, []);

  const submitRequest = async () => {
    if (reason.trim().length < 10 || !confirmed) return;
    try {
      setSaving(true);
      setError("");
      setMessage("");
      const response = (await apiClient(
        "/enrollee/account/deletion-request",
        { method: "POST", body: { reason: reason.trim() } },
      )) as DeletionResponse;
      setRequest(response.data?.request || null);
      setReason("");
      setConfirmed(false);
      setMessage("Your deletion request has been sent for admin review.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to submit your deletion request.",
      );
    } finally {
      setSaving(false);
    }
  };

  const cancelRequest = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");
      const response = (await apiClient(
        "/enrollee/account/deletion-request/cancel",
        { method: "POST" },
      )) as DeletionResponse;
      setRequest(response.data?.request || null);
      setMessage("Your account deletion request has been cancelled.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to cancel your deletion request.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-red-200 bg-red-50/40 p-5 dark:border-red-900/60 dark:bg-red-950/10 lg:p-6">
      <div className="max-w-3xl">
        <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">
          Delete account
        </h4>
        <p className="mt-1.5 text-sm leading-6 text-gray-600 dark:text-gray-400">
          Requesting deletion does not remove your records immediately. An admin
          must approve the request, then your information is retained for 60 days.
          You may cancel at any point before that period ends. Afterwards your
          account is archived and you can no longer sign in.
        </p>

        {loading ? (
          <p className="mt-4 text-sm text-gray-500">Loading deletion status...</p>
        ) : (
          <>
            {request && (
              <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                      {statusLabels[request.status]}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Submitted {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {request.canCancel && (
                    <button
                      type="button"
                      onClick={cancelRequest}
                      disabled={saving}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-white/5"
                    >
                      {saving ? "Cancelling..." : "Cancel deletion"}
                    </button>
                  )}
                </div>

                {request.status === "pending" && (
                  <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">
                    Your account remains active while an admin reviews this request.
                  </p>
                )}
                {request.status === "approved" && (
                  <p className="mt-3 text-sm text-red-700 dark:text-red-300">
                    You have {request.retentionDaysRemaining ?? 0} day(s) remaining
                    to cancel. Access ends on {expiryLabel}.
                  </p>
                )}
                {request.adminNote && (
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                    Admin note: {request.adminNote}
                  </p>
                )}
              </div>
            )}

            {canCreate && (
              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Why would you like to delete your account?
                  </span>
                  <textarea
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    rows={4}
                    maxLength={2000}
                    placeholder="Please provide at least 10 characters."
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </label>
                <label className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(event) => setConfirmed(event.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  I understand that an approved request becomes permanent after
                  the 60-day cancellation window.
                </label>
                <button
                  type="button"
                  onClick={submitRequest}
                  disabled={saving || !confirmed || reason.trim().length < 10}
                  className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Submitting..." : "Submit deletion request"}
                </button>
              </div>
            )}
          </>
        )}

        {message && <p className="mt-4 text-sm text-green-700 dark:text-green-300">{message}</p>}
        {error && <p className="mt-4 text-sm text-red-700 dark:text-red-300">{error}</p>}
      </div>
    </section>
  );
}
