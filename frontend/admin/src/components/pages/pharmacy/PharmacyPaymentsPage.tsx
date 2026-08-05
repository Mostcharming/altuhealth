"use client";

import { Banknote, ExternalLink, Eye, Search, WalletCards } from "lucide-react";
import {
  fetchPharmacyPayments,
  fetchPharmacySummary,
  getPharmacyMember,
  type PharmacyPayment,
  type PharmacySummary,
} from "@/lib/apis/pharmacyRequest";
import { formatDate, formatPrice } from "@/lib/formatDate";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const fieldClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-800 outline-none transition focus:border-brand-500 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

const emptySummary: PharmacySummary = {
  counts: { pending: 0, approved: 0, rejected: 0, paid: 0 },
  totalRequests: 0,
  totalClaimed: 0,
  totalApproved: 0,
  totalPaid: 0,
};

export default function PharmacyPaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<PharmacyPayment[]>([]);
  const [summary, setSummary] = useState<PharmacySummary>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [paymentResponse, summaryResponse] = await Promise.all([
        fetchPharmacyPayments({
          limit: 10,
          page,
          q: search.trim() || undefined,
          paymentMethod: paymentMethod || undefined,
        }),
        fetchPharmacySummary(),
      ]);
      setPayments(paymentResponse?.data?.list || []);
      setTotalPages(paymentResponse?.data?.totalPages || 1);
      setTotal(paymentResponse?.data?.count || 0);
      setSummary(summaryResponse?.data || emptySummary);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load pharmacy payments",
      );
    } finally {
      setLoading(false);
    }
  }, [page, paymentMethod, search]);

  useEffect(() => {
    const timer = window.setTimeout(loadData, 300);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Metric
          label="Payments recorded"
          value={summary.counts.paid.toLocaleString()}
          icon={<Banknote size={21} />}
          tone="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
        />
        <Metric
          label="Total reimbursed"
          value={formatPrice(Number(summary.totalPaid || 0), "NGN")}
          icon={<WalletCards size={21} />}
          tone="bg-blue-50 text-blue-600 dark:bg-blue-500/10"
        />
        <Metric
          label="Approved awaiting payment"
          value={summary.counts.approved.toLocaleString()}
          icon={<Banknote size={21} />}
          tone="bg-amber-50 text-amber-600 dark:bg-amber-500/10"
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-200 p-5 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Pharmacy payment register
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Reimbursement payments are recorded here separately from invoice
            payments.
          </p>
        </div>
        <div className="grid gap-3 border-b border-gray-200 p-5 dark:border-gray-800 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search payment, beneficiary or reference"
              className={`${fieldClass} pl-10`}
            />
          </div>
          <select
            value={paymentMethod}
            onChange={(event) => {
              setPaymentMethod(event.target.value);
              setPage(1);
            }}
            className={fieldClass}
          >
            <option value="">All payment methods</option>
            <option value="bank_transfer">Bank transfer</option>
            <option value="mobile_money">Mobile money</option>
            <option value="wallet">Wallet</option>
            <option value="cheque">Cheque</option>
            <option value="cash">Cash</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/70 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-white/[0.02] dark:text-gray-400">
                <th className="px-5 py-3.5">Payment</th>
                <th className="px-5 py-3.5">Request</th>
                <th className="px-5 py-3.5">Enrollee</th>
                <th className="px-5 py-3.5">Beneficiary</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Method</th>
                <th className="px-5 py-3.5">Paid on</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-16 text-center text-sm text-gray-500"
                  >
                    No pharmacy payments match these filters.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => {
                  const member = payment.request
                    ? getPharmacyMember(payment.request)
                    : null;
                  return (
                    <tr
                      key={payment.id}
                      className="text-sm text-gray-700 transition hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4 font-semibold text-gray-800 dark:text-white/90">
                        {payment.paymentNumber}
                        <span className="mt-1 block text-xs font-normal text-gray-400">
                          {payment.transactionReference ||
                            "No transaction reference"}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-medium">
                        {payment.request?.requestNumber || "—"}
                      </td>
                      <td className="px-5 py-4">
                        {member
                          ? `${member.firstName} ${member.lastName}`
                          : "—"}
                        <span className="mt-1 block text-xs text-gray-400">
                          {member?.policyNumber || ""}
                        </span>
                      </td>
                      <td className="px-5 py-4">{payment.beneficiaryName}</td>
                      <td className="px-5 py-4 font-semibold text-emerald-700 dark:text-emerald-300">
                        {formatPrice(Number(payment.amount), payment.currency)}
                      </td>
                      <td className="px-5 py-4 capitalize">
                        {payment.paymentMethod.replaceAll("_", " ")}
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500">
                        {formatDate(payment.paymentDate)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {payment.proofUrl && (
                            <a
                              href={payment.proofUrl}
                              target="_blank"
                              rel="noreferrer"
                              title="Open payment proof"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:text-brand-600 dark:border-gray-700 dark:text-gray-300"
                            >
                              <ExternalLink size={15} />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              payment.request &&
                              router.push(
                                `/pharmacy-requests/${payment.request.id}`,
                              )
                            }
                            className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-300 px-3 text-xs font-medium text-gray-700 hover:text-brand-600 dark:border-gray-700 dark:text-gray-300"
                          >
                            <Eye size={15} /> Request
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4 text-sm dark:border-gray-800">
          <span className="text-gray-500 dark:text-gray-400">
            {total} payment{total === 1 ? "" : "s"}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(current - 1, 1))}
              className="rounded-lg border border-gray-300 px-3 py-2 text-gray-600 disabled:opacity-40 dark:border-gray-700 dark:text-gray-300"
            >
              Previous
            </button>
            <span className="px-2 text-gray-500">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((current) => Math.min(current + 1, totalPages))
              }
              className="rounded-lg border border-gray-300 px-3 py-2 text-gray-600 disabled:opacity-40 dark:border-gray-700 dark:text-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="mt-1 text-xl font-semibold text-gray-800 dark:text-white/90">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
