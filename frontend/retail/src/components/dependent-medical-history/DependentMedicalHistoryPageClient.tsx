"use client";

import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/lib/authStore";
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
};

type HistoryResponse = {
  list: History[];
  count: number;
  totalPages: number;
};

function dataOf<T>(response: unknown): T | null {
  if (!response || typeof response !== "object") return null;
  return (response as { data?: T }).data ?? (response as T);
}

function dateLabel(value?: string | null) {
  return value
    ? new Intl.DateTimeFormat("en", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "N/A";
}

function moneyLabel(value?: number | string | null, currency = "NGN") {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "N/A";

  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export default function DependentMedicalHistoryPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const canViewHistory = useAuthStore(
    (state) => state.user?.dependentVisitNotificationsEnabled,
  );
  const [dependentId, setDependentId] = useState(
    searchParams.get("dependentId") || "",
  );
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [histories, setHistories] = useState<History[]>([]);
  const [dependents, setDependents] = useState<Dependent[]>([]);
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

    apiClient("/enrollee/dependents/list?limit=all")
      .then((response) => {
        setDependents(dataOf<{ list: Dependent[] }>(response)?.list ?? []);
      })
      .catch((requestError) => {
        console.warn("Unable to load dependents", requestError);
      });
  }, [canViewHistory]);

  const load = useCallback(async () => {
    if (canViewHistory !== true) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const query = new URLSearchParams({
        page: String(page),
        limit: "10",
      });
      if (dependentId) query.set("dependentId", dependentId);
      if (status) query.set("status", status);

      const response = await apiClient(
        `/enrollee/dependents/medical-histories?${query.toString()}`,
      );
      const payload = dataOf<HistoryResponse>(response);
      setHistories(payload?.list ?? []);
      setTotal(payload?.count ?? 0);
      setTotalPages(payload?.totalPages ?? 1);
    } catch (requestError) {
      setHistories([]);
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
    load();
  }, [load]);

  const recordRange = useMemo(() => {
    if (!total) return "0 records";
    return `${(page - 1) * 10 + 1}–${Math.min(page * 10, total)} of ${total}`;
  }, [page, total]);

  if (canViewHistory !== true) return null;

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex flex-col gap-4 border-b border-gray-200 p-5 dark:border-gray-800 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Your dependents&apos; records
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Provider visits recorded during authorization requests.
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
              className="h-11 min-w-52 rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:text-white"
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
              className="h-11 min-w-40 rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:text-white"
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
        <div className="p-8 text-center text-sm text-error-500">{error}</div>
      ) : histories.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <h3 className="font-medium text-gray-900 dark:text-white">
            No dependent medical history yet
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Records will appear here after a provider logs a dependent visit.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-white/[0.02]">
              <tr>
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
                    className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {histories.map((history) => (
                <tr key={history.id}>
                  <td className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {history.dependent
                      ? `${history.dependent.firstName} ${history.dependent.lastName}`
                      : "N/A"}
                    <span className="mt-1 block text-xs font-normal text-gray-500">
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
                    {dateLabel(history.serviceDate)}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {moneyLabel(history.amount, history.currency || "NGN")}
                  </td>
                  <td className="px-5 py-4 text-sm capitalize text-gray-700 dark:text-gray-300">
                    {history.status || "pending"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && total > 0 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4 dark:border-gray-800">
          <span className="text-sm text-gray-500">Showing {recordRange}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-gray-700"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((value) => Math.min(totalPages, value + 1))
              }
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
