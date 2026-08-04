"use client";

import { Modal } from "@/components/ui/modal";
import {
  CheckCircle2,
  Clock3,
  Eye,
  Pill,
  Plus,
  Search,
  Trash2,
  WalletCards,
  XCircle,
} from "lucide-react";
import { fetchEnrollees } from "@/lib/apis/enrollee";
import {
  createPharmacyRequest,
  fetchPharmacyRequests,
  fetchPharmacySummary,
  getPharmacyMember,
  type CreatePharmacyRequestPayload,
  type PharmacyMember,
  type PharmacyMemberType,
  type PharmacyRequest,
  type PharmacyRequestStatus,
  type PharmacySummary,
} from "@/lib/apis/pharmacyRequest";
import { fetchRetailEnrollees } from "@/lib/apis/retailEnrollee";
import { formatDate, formatPrice } from "@/lib/formatDate";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

const fieldClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-800 outline-none transition focus:border-brand-500 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const textAreaClass = `${fieldClass} h-auto min-h-24 py-3`;

const emptySummary: PharmacySummary = {
  counts: { pending: 0, approved: 0, rejected: 0, paid: 0 },
  totalRequests: 0,
  totalClaimed: 0,
  totalApproved: 0,
  totalPaid: 0,
};

const today = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
};

type DrugFormItem = {
  drugName: string;
  quantity: number;
  unitPrice: number;
  notes: string;
};

const newDrugItem = (): DrugFormItem => ({
  drugName: "",
  quantity: 1,
  unitPrice: 0,
  notes: "",
});

function StatusBadge({ status }: { status: PharmacyRequestStatus }) {
  const classes: Record<PharmacyRequestStatus, string> = {
    pending:
      "bg-amber-50 text-amber-700 ring-amber-600/15 dark:bg-amber-500/10 dark:text-amber-300",
    approved:
      "bg-blue-50 text-blue-700 ring-blue-600/15 dark:bg-blue-500/10 dark:text-blue-300",
    rejected:
      "bg-red-50 text-red-700 ring-red-600/15 dark:bg-red-500/10 dark:text-red-300",
    paid: "bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-300",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${classes[status]}`}
    >
      {status}
    </span>
  );
}

export default function PharmacyRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<PharmacyRequest[]>([]);
  const [summary, setSummary] = useState<PharmacySummary>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PharmacyRequestStatus | "">("");
  const [memberTypeFilter, setMemberTypeFilter] = useState<
    PharmacyMemberType | ""
  >("");
  const [showCreate, setShowCreate] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [requestResponse, summaryResponse] = await Promise.all([
        fetchPharmacyRequests({
          page,
          limit: 10,
          q: search.trim() || undefined,
          status,
          memberType: memberTypeFilter,
        }),
        fetchPharmacySummary(),
      ]);
      setRequests(requestResponse?.data?.list || []);
      setTotalPages(requestResponse?.data?.totalPages || 1);
      setTotal(requestResponse?.data?.count || 0);
      setSummary(summaryResponse?.data || emptySummary);
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to load pharmacy requests",
      });
    } finally {
      setLoading(false);
    }
  }, [memberTypeFilter, page, search, status]);

  useEffect(() => {
    const timer = window.setTimeout(loadData, 300);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  const metrics = [
    {
      label: "Pending review",
      value: summary.counts.pending,
      icon: Clock3,
      tone: "bg-amber-50 text-amber-600 dark:bg-amber-500/10",
    },
    {
      label: "Approved",
      value: summary.counts.approved,
      icon: CheckCircle2,
      tone: "bg-blue-50 text-blue-600 dark:bg-blue-500/10",
    },
    {
      label: "Rejected",
      value: summary.counts.rejected,
      icon: XCircle,
      tone: "bg-red-50 text-red-600 dark:bg-red-500/10",
    },
    {
      label: "Paid reimbursements",
      value: formatPrice(Number(summary.totalPaid || 0), "NGN"),
      icon: WalletCards,
      tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10",
    },
  ];

  return (
    <div className="space-y-5">
      {feedback && (
        <div
          className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-300"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-500/10 dark:text-red-300"
          }`}
        >
          <span>{feedback.message}</span>
          <button type="button" onClick={() => setFeedback(null)}>
            ×
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${metric.tone}`}
              >
                <metric.icon size={21} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {metric.label}
                </p>
                <p className="mt-1 text-xl font-semibold text-gray-800 dark:text-white/90">
                  {metric.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 border-b border-gray-200 p-5 dark:border-gray-800 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Pharmacy requests
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Call-center entries waiting for review and reimbursement.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            <Plus size={18} /> Log pharmacy request
          </button>
        </div>

        <div className="grid gap-3 border-b border-gray-200 p-5 dark:border-gray-800 md:grid-cols-[1fr_180px_180px]">
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
              placeholder="Search request, policy or pharmacy"
              className={`${fieldClass} pl-10`}
            />
          </div>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as PharmacyRequestStatus | "");
              setPage(1);
            }}
            className={fieldClass}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="paid">Paid</option>
          </select>
          <select
            value={memberTypeFilter}
            onChange={(event) => {
              setMemberTypeFilter(
                event.target.value as PharmacyMemberType | "",
              );
              setPage(1);
            }}
            className={fieldClass}
          >
            <option value="">All enrollee types</option>
            <option value="corporate">Corporate</option>
            <option value="retail">Retail</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/70 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-white/[0.02] dark:text-gray-400">
                <th className="px-5 py-3.5">Request</th>
                <th className="px-5 py-3.5">Enrollee</th>
                <th className="px-5 py-3.5">Pharmacy</th>
                <th className="px-5 py-3.5">Purchase</th>
                <th className="px-5 py-3.5">Claimed</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Logged</th>
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
              ) : requests.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-16 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No pharmacy requests match these filters.
                  </td>
                </tr>
              ) : (
                requests.map((request) => {
                  const member = getPharmacyMember(request);
                  return (
                    <tr
                      key={request.id}
                      className="text-sm text-gray-700 transition hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4 font-semibold text-gray-800 dark:text-white/90">
                        {request.requestNumber}
                        <span className="mt-1 block text-xs font-normal capitalize text-gray-400">
                          {request.memberType}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-medium text-gray-800 dark:text-white/90">
                          {member
                            ? `${member.firstName} ${member.lastName}`
                            : "Unknown enrollee"}
                        </span>
                        <span className="mt-1 block text-xs text-gray-400">
                          {member?.policyNumber || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4">{request.pharmacyName}</td>
                      <td className="px-5 py-4">
                        {new Date(request.purchaseDate).toLocaleDateString(
                          "en-NG",
                          { day: "2-digit", month: "short", year: "numeric" },
                        )}
                      </td>
                      <td className="px-5 py-4 font-semibold">
                        {formatPrice(
                          Number(request.amountClaimed),
                          request.currency,
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={request.status} />
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500">
                        {formatDate(request.createdAt)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/pharmacy-requests/${request.id}`)
                          }
                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-300 px-3 text-xs font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600 dark:border-gray-700 dark:text-gray-300"
                        >
                          <Eye size={15} /> Review
                        </button>
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
            {total} request{total === 1 ? "" : "s"}
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

      <CreateRequestModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(message) => {
          setShowCreate(false);
          setFeedback({ type: "success", message });
          setPage(1);
          loadData();
        }}
      />
    </div>
  );
}

function CreateRequestModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (message: string) => void;
}) {
  const [memberType, setMemberType] = useState<PharmacyMemberType>("corporate");
  const [memberSearch, setMemberSearch] = useState("");
  const [memberResults, setMemberResults] = useState<PharmacyMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<PharmacyMember | null>(
    null,
  );
  const [searchingMembers, setSearchingMembers] = useState(false);
  const [pharmacyName, setPharmacyName] = useState("");
  const [pharmacyPhone, setPharmacyPhone] = useState("");
  const [pharmacyAddress, setPharmacyAddress] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(today());
  const [currency, setCurrency] = useState("NGN");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [callReference, setCallReference] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<DrugFormItem[]>([newDrugItem()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
        0,
      ),
    [items],
  );

  const reset = useCallback(() => {
    setMemberType("corporate");
    setMemberSearch("");
    setMemberResults([]);
    setSelectedMember(null);
    setPharmacyName("");
    setPharmacyPhone("");
    setPharmacyAddress("");
    setPurchaseDate(today());
    setCurrency("NGN");
    setReceiptUrl("");
    setCallReference("");
    setNotes("");
    setItems([newDrugItem()]);
    setError("");
  }, []);

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const searchMembers = async () => {
    if (!memberSearch.trim()) {
      setError("Enter a name, email, phone number, or policy number.");
      return;
    }
    try {
      setSearchingMembers(true);
      setError("");
      const response =
        memberType === "corporate"
          ? await fetchEnrollees({
              limit: 8,
              page: 1,
              q: memberSearch.trim(),
              isActive: true,
            })
          : await fetchRetailEnrollees({
              limit: 8,
              page: 1,
              q: memberSearch.trim(),
              isActive: true,
            });
      setMemberResults(response?.data?.enrollees || []);
    } catch (memberError) {
      setError(
        memberError instanceof Error
          ? memberError.message
          : "Unable to search enrollees",
      );
      setMemberResults([]);
    } finally {
      setSearchingMembers(false);
    }
  };

  const updateItem = (
    index: number,
    key: keyof DrugFormItem,
    value: string | number,
  ) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    );
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedMember) {
      setError("Select the enrollee who made the purchase.");
      return;
    }
    if (items.some((item) => !item.drugName.trim())) {
      setError("Enter the name of every drug item.");
      return;
    }
    if (total <= 0) {
      setError("The drug total must be greater than zero.");
      return;
    }

    const payload: CreatePharmacyRequestPayload = {
      memberType,
      ...(memberType === "corporate"
        ? { enrolleeId: selectedMember.id }
        : { retailEnrolleeId: selectedMember.id }),
      pharmacyName,
      pharmacyPhone,
      pharmacyAddress,
      purchaseDate,
      currency,
      receiptUrl,
      callReference,
      notes,
      items,
    };

    try {
      setSubmitting(true);
      setError("");
      const response = await createPharmacyRequest(payload);
      onCreated(
        response?.message || "Pharmacy request logged and sent for approval.",
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to log pharmacy request",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="m-4 max-h-[92vh] max-w-4xl overflow-y-auto p-6 lg:p-8"
    >
      <form onSubmit={handleSubmit} className="space-y-7">
        <div className="pr-12">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10">
            <Pill size={22} />
          </div>
          <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-white/90">
            Log pharmacy purchase
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Capture the call-center report. Admins will receive a notification
            to review it.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        )}

        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-gray-800 dark:text-white/90">
            Enrollee
          </legend>
          <div className="grid gap-3 md:grid-cols-[180px_1fr_auto]">
            <select
              value={memberType}
              onChange={(event) => {
                setMemberType(event.target.value as PharmacyMemberType);
                setSelectedMember(null);
                setMemberResults([]);
              }}
              className={fieldClass}
            >
              <option value="corporate">Corporate enrollee</option>
              <option value="retail">Retail enrollee</option>
            </select>
            <input
              value={memberSearch}
              onChange={(event) => setMemberSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  searchMembers();
                }
              }}
              placeholder="Name, email, phone or policy number"
              className={fieldClass}
            />
            <button
              type="button"
              onClick={searchMembers}
              disabled={searchingMembers}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
            >
              <Search size={17} /> {searchingMembers ? "Searching" : "Search"}
            </button>
          </div>

          {selectedMember ? (
            <div className="flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-3 dark:border-brand-900 dark:bg-brand-500/10">
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  {selectedMember.firstName} {selectedMember.lastName}
                </p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {selectedMember.policyNumber} ·{" "}
                  {selectedMember.phoneNumber || selectedMember.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="text-xs font-medium text-brand-600"
              >
                Change
              </button>
            </div>
          ) : memberResults.length > 0 ? (
            <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-800">
              {memberResults.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => {
                    setSelectedMember(member);
                    setMemberResults([]);
                  }}
                  className="flex w-full items-center justify-between border-b border-gray-100 px-4 py-3 text-left last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.03]"
                >
                  <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {member.firstName} {member.lastName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {member.policyNumber}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </fieldset>

        <fieldset className="grid gap-4 md:grid-cols-2">
          <legend className="mb-4 text-sm font-semibold text-gray-800 dark:text-white/90">
            Purchase details
          </legend>
          <label className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
            <span>Pharmacy name *</span>
            <input
              required
              value={pharmacyName}
              onChange={(event) => setPharmacyName(event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
            <span>Purchase date *</span>
            <input
              required
              type="date"
              max={today()}
              value={purchaseDate}
              onChange={(event) => setPurchaseDate(event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
            <span>Pharmacy phone</span>
            <input
              value={pharmacyPhone}
              onChange={(event) => setPharmacyPhone(event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
            <span>Call reference</span>
            <input
              value={callReference}
              onChange={(event) => setCallReference(event.target.value)}
              placeholder="Call ticket or reference"
              className={fieldClass}
            />
          </label>
          <label className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400 md:col-span-2">
            <span>Pharmacy address</span>
            <input
              value={pharmacyAddress}
              onChange={(event) => setPharmacyAddress(event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
            <span>Currency *</span>
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              className={fieldClass}
            >
              <option value="NGN">NGN</option>
              <option value="GBP">GBP</option>
              <option value="USD">USD</option>
            </select>
          </label>
          <label className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
            <span>Receipt URL</span>
            <input
              type="url"
              value={receiptUrl}
              onChange={(event) => setReceiptUrl(event.target.value)}
              placeholder="https://..."
              className={fieldClass}
            />
          </label>
        </fieldset>

        <fieldset className="space-y-3">
          <div className="flex items-center justify-between">
            <legend className="text-sm font-semibold text-gray-800 dark:text-white/90">
              Drugs purchased
            </legend>
            <button
              type="button"
              onClick={() => setItems((current) => [...current, newDrugItem()])}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600"
            >
              <Plus size={16} /> Add drug
            </button>
          </div>
          {items.map((item, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800 md:grid-cols-[1fr_100px_150px_44px]"
            >
              <label className="space-y-1.5 text-xs text-gray-500">
                <span>Drug name *</span>
                <input
                  required
                  value={item.drugName}
                  onChange={(event) =>
                    updateItem(index, "drugName", event.target.value)
                  }
                  className={fieldClass}
                />
              </label>
              <label className="space-y-1.5 text-xs text-gray-500">
                <span>Quantity *</span>
                <input
                  required
                  min={1}
                  step={1}
                  type="number"
                  value={item.quantity}
                  onChange={(event) =>
                    updateItem(index, "quantity", Number(event.target.value))
                  }
                  className={fieldClass}
                />
              </label>
              <label className="space-y-1.5 text-xs text-gray-500">
                <span>Unit price *</span>
                <input
                  required
                  min={0}
                  step="0.01"
                  type="number"
                  value={item.unitPrice}
                  onChange={(event) =>
                    updateItem(index, "unitPrice", Number(event.target.value))
                  }
                  className={fieldClass}
                />
              </label>
              <button
                type="button"
                title="Remove drug"
                disabled={items.length === 1}
                onClick={() =>
                  setItems((current) =>
                    current.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
                className="mt-5 flex h-11 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-30 dark:hover:bg-red-500/10"
              >
                <Trash2 size={18} />
              </button>
              <label className="space-y-1.5 text-xs text-gray-500 md:col-span-3">
                <span>Item notes</span>
                <input
                  value={item.notes}
                  onChange={(event) =>
                    updateItem(index, "notes", event.target.value)
                  }
                  placeholder="Strength, dosage, or other details"
                  className={fieldClass}
                />
              </label>
              <div className="flex items-end justify-end text-sm font-semibold text-gray-700 dark:text-gray-300">
                {formatPrice(item.quantity * item.unitPrice, currency)}
              </div>
            </div>
          ))}
          <div className="flex justify-end rounded-xl bg-gray-50 px-4 py-3 dark:bg-white/[0.03]">
            <span className="text-sm text-gray-500">Amount claimed</span>
            <span className="ml-4 text-lg font-semibold text-gray-800 dark:text-white/90">
              {formatPrice(total, currency)}
            </span>
          </div>
        </fieldset>

        <label className="block space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
          <span>Call-center notes</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className={textAreaClass}
          />
        </label>

        <div className="flex justify-end gap-3 border-t border-gray-200 pt-5 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-lg border border-gray-300 px-5 text-sm font-medium text-gray-700 dark:border-gray-700 dark:text-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="h-11 rounded-lg bg-brand-500 px-5 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit for approval"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
