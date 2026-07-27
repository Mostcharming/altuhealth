"use client";

import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/lib/authStore";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type Dependent = {
  id: string;
  firstName: string;
  lastName: string;
  policyNumber: string;
};

type History = {
  id: string;
  dependent?: Dependent | null;
  provider?: { name?: string } | null;
  diagnosis?: { name?: string } | null;
  evsCode?: string | null;
  amount?: number | string | null;
  currency?: string | null;
  serviceDate?: string | null;
  status?: string;
  notes?: string | null;
};

type HistoryResponse = {
  list: History[];
  count: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

function unwrapData<T>(response: unknown): T | null {
  if (!response || typeof response !== "object") return null;
  const envelope = response as { data?: T };
  return envelope.data ?? (response as T);
}

function formatDate(value?: string | null) {
  if (!value) return "N/A";
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatAmount(value?: number | string | null, currency = "NGN") {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "N/A";

  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency || "NGN",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency || "NGN"} ${amount.toLocaleString()}`;
  }
}

function statusClass(status?: string) {
  switch (status?.toLowerCase()) {
    case "approved":
      return "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400";
    case "rejected":
      return "bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-400";
    case "reviewed":
      return "bg-blue-light-50 text-blue-light-700 dark:bg-blue-light-500/15 dark:text-blue-light-400";
    default:
      return "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-400";
  }
}

export default function DependentMedicalHistoryPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const canViewHistory = useAuthStore(
    (state) => state.user?.dependentVisitNotificationsEnabled,
  );
  const initialDependentId = searchParams.get("dependentId") || "";
  const [histories, setHistories] = useState<History[]>([]);
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [dependentId, setDependentId] = useState(initialDependentId);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (canViewHistory === false) {
      router.replace("/overview");
    }
  }, [canViewHistory, router]);

  useEffect(() => {
    if (canViewHistory !== true) return;

    async function loadDependents() {
      try {
        const response = await apiClient("/enrollee/dependents/list?limit=all");
        const payload = unwrapData<{ list?: Dependent[] }>(response);
        setDependents(payload?.list ?? []);
      } catch (requestError) {
        console.warn("Unable to load dependents", requestError);
      }
    }

    loadDependents();
  }, [canViewHistory]);

  const loadHistories = useCallback(async () => {
    if (canViewHistory !== true) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
      });
      if (dependentId) params.set("dependentId", dependentId);
      if (status) params.set("status", status);

      const response = await apiClient(
        `/enrollee/dependents/medical-histories?${params.toString()}`,
      );
      const payload = unwrapData<HistoryResponse>(response);

      setHistories(payload?.list ?? []);
      setTotal(payload?.count ?? 0);
      setTotalPages(payload?.totalPages ?? 1);
    } catch (requestError) {
      setHistories([]);
      setTotal(0);
      setTotalPages(1);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load dependent medical history.",
      );
    } finally {
      setLoading(false);
    }
  }, [canViewHistory, dependentId, page, status]);

  useEffect(() => {
    loadHistories();
  }, [loadHistories]);

  const range = useMemo(() => {
    if (!total) return "0 records";
    const start = (page - 1) * 10 + 1;
    const end = Math.min(page * 10, total);
    return `${start}–${end} of ${total}`;
  }, [page, total]);

  if (canViewHistory !== true) return null;

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex flex-col gap-4 border-b border-gray-200 p-5 dark:border-gray-800 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Your dependents&apos; records
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Records appear when a provider logs a visit during an authorization
            request.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            <span className="mb-1.5 block">Dependent</span>
            <select
              value={dependentId}
              onChange={(event) => {
                setDependentId(event.target.value);
                setPage(1);
              }}
              className="h-11 min-w-52 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white"
            >
              <option value="">All dependents</option>
              {dependents.map((dependent) => (
                <option key={dependent.id} value={dependent.id}>
                  {dependent.firstName} {dependent.lastName}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            <span className="mb-1.5 block">Status</span>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="h-11 min-w-40 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="py-16">
          <SpinnerThree />
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <p className="text-sm text-error-600 dark:text-error-400">{error}</p>
          <button
            type="button"
            onClick={loadHistories}
            className="mt-4 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Try again
          </button>
        </div>
      ) : histories.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <h3 className="font-medium text-gray-900 dark:text-white">
            No dependent medical history yet
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
            When a provider records a visit for a dependent while requesting
            authorization, it will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-white/[0.02]">
                {[
                  "Dependent",
                  "Provider",
                  "Diagnosis",
                  "Authorization",
                  "Service date",
                  "Amount",
                  "Status",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {histories.map((history) => (
                <tr
                  key={history.id}
                  className="hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-4">
                    {history.dependent ? (
                      <Link
                        href={`/dependents/${history.dependent.id}`}
                        className="font-medium text-gray-900 hover:text-brand-500 dark:text-white"
                      >
                        {history.dependent.firstName}{" "}
                        {history.dependent.lastName}
                      </Link>
                    ) : (
                      "N/A"
                    )}
                    <span className="mt-1 block text-xs text-gray-500">
                      {history.dependent?.policyNumber}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {history.provider?.name || "N/A"}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {history.diagnosis?.name || "N/A"}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {history.evsCode || "N/A"}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {formatDate(history.serviceDate)}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {formatAmount(history.amount, history.currency || "NGN")}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusClass(
                        history.status,
                      )}`}
                    >
                      {history.status || "pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && total > 0 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4 dark:border-gray-800">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Showing {range}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
            >
              Previous
            </button>
            <span className="px-2 text-sm text-gray-600 dark:text-gray-400">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
