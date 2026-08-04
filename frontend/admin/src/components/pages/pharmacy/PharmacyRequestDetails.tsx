"use client";

import { Modal } from "@/components/ui/modal";
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  ExternalLink,
  Pill,
  ReceiptText,
  Store,
  UserRound,
  XCircle,
} from "lucide-react";
import {
  approvePharmacyRequest,
  fetchPharmacyRequest,
  getPharmacyMember,
  recordPharmacyPayment,
  rejectPharmacyRequest,
  type PharmacyRequest,
  type PharmacyRequestStatus,
} from "@/lib/apis/pharmacyRequest";
import { formatDate, formatPrice } from "@/lib/formatDate";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";

const fieldClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-800 outline-none transition focus:border-brand-500 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const textAreaClass = `${fieldClass} h-auto min-h-24 py-3`;

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
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold capitalize ring-1 ring-inset ${classes[status]}`}
    >
      {status}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-gray-100 py-3 last:border-0 dark:border-gray-800">
      <dt className="text-sm text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="max-w-[65%] break-words text-right text-sm font-medium text-gray-800 dark:text-white/90">
        {value || "—"}
      </dd>
    </div>
  );
}

export default function PharmacyRequestDetails({ id }: { id: string }) {
  const [request, setRequest] = useState<PharmacyRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const loadRequest = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchPharmacyRequest(id);
      setRequest(response?.data?.pharmacyRequest || null);
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to load pharmacy request",
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRequest();
  }, [loadRequest]);

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-gray-600 dark:text-gray-400">
          This pharmacy request could not be found.
        </p>
        <Link
          href="/pharmacy-requests"
          className="mt-4 inline-flex text-sm font-medium text-brand-600"
        >
          Return to pharmacy requests
        </Link>
      </div>
    );
  }

  const member = getPharmacyMember(request);
  const memberName = member
    ? `${member.firstName} ${member.lastName}`
    : "Unknown enrollee";

  const completeAction = async (message: string) => {
    setShowApprove(false);
    setShowReject(false);
    setShowPayment(false);
    setFeedback({ type: "success", message });
    await loadRequest();
  };

  return (
    <div className="space-y-5">
      <Link
        href="/pharmacy-requests"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-brand-600 dark:text-gray-400"
      >
        <ArrowLeft size={17} /> Back to pharmacy requests
      </Link>

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

      <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10">
              <Pill size={24} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                  {request.requestNumber}
                </h2>
                <StatusBadge status={request.status} />
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Logged by{" "}
                {request.creator
                  ? `${request.creator.firstName} ${request.creator.lastName}`
                  : "an admin"}{" "}
                on {formatDate(request.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {request.status === "pending" && (
              <>
                <button
                  type="button"
                  onClick={() => setShowReject(true)}
                  className="inline-flex h-11 items-center gap-2 rounded-lg border border-red-200 px-4 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-500/10"
                >
                  <XCircle size={18} /> Reject
                </button>
                <button
                  type="button"
                  onClick={() => setShowApprove(true)}
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600"
                >
                  <CheckCircle2 size={18} /> Approve
                </button>
              </>
            )}
            {request.status === "approved" && (
              <button
                type="button"
                onClick={() => setShowPayment(true)}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700"
              >
                <Banknote size={18} /> Record reimbursement payment
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10">
              <UserRound size={18} />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-white/90">
              Enrollee details
            </h3>
          </div>
          <dl>
            <DetailRow label="Name" value={memberName} />
            <DetailRow label="Policy number" value={member?.policyNumber} />
            <DetailRow label="Type" value={`${request.memberType} enrollee`} />
            <DetailRow label="Phone" value={member?.phoneNumber} />
            <DetailRow label="Email" value={member?.email} />
          </dl>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-500/10">
              <Store size={18} />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-white/90">
              Pharmacy and call details
            </h3>
          </div>
          <dl>
            <DetailRow label="Pharmacy" value={request.pharmacyName} />
            <DetailRow label="Phone" value={request.pharmacyPhone} />
            <DetailRow label="Address" value={request.pharmacyAddress} />
            <DetailRow
              label="Purchase date"
              value={new Date(request.purchaseDate).toLocaleDateString(
                "en-NG",
                {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                },
              )}
            />
            <DetailRow label="Call reference" value={request.callReference} />
          </dl>
          {request.receiptUrl && (
            <a
              href={request.receiptUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-600"
            >
              <ReceiptText size={17} /> View purchase receipt{" "}
              <ExternalLink size={14} />
            </a>
          )}
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white/90">
              Drugs purchased
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              {request.items.length} line item
              {request.items.length === 1 ? "" : "s"}
            </p>
          </div>
          <p className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {formatPrice(Number(request.amountClaimed), request.currency)}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/70 text-left text-xs font-semibold uppercase text-gray-500 dark:border-gray-800 dark:bg-white/[0.02]">
                <th className="px-6 py-3.5">Drug</th>
                <th className="px-6 py-3.5">Quantity</th>
                <th className="px-6 py-3.5">Unit price</th>
                <th className="px-6 py-3.5">Notes</th>
                <th className="px-6 py-3.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {request.items.map((item) => (
                <tr
                  key={item.id || item.drugName}
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  <td className="px-6 py-4 font-medium text-gray-800 dark:text-white/90">
                    {item.drugName}
                  </td>
                  <td className="px-6 py-4">{item.quantity}</td>
                  <td className="px-6 py-4">
                    {formatPrice(Number(item.unitPrice), request.currency)}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {item.notes || "—"}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold">
                    {formatPrice(Number(item.lineTotal), request.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {(request.notes || request.reviewNotes || request.rejectionReason) && (
        <section className="grid gap-5 lg:grid-cols-2">
          {request.notes && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="font-semibold text-gray-800 dark:text-white/90">
                Call-center notes
              </h3>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-600 dark:text-gray-400">
                {request.notes}
              </p>
            </div>
          )}
          {(request.reviewNotes || request.rejectionReason) && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="font-semibold text-gray-800 dark:text-white/90">
                Admin review
              </h3>
              <p className="mt-2 text-xs text-gray-500">
                {request.reviewer
                  ? `${request.reviewer.firstName} ${request.reviewer.lastName}`
                  : "Admin"}
                {request.reviewedAt
                  ? ` · ${formatDate(request.reviewedAt)}`
                  : ""}
              </p>
              {request.rejectionReason && (
                <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
                  {request.rejectionReason}
                </p>
              )}
              {request.reviewNotes && (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-600 dark:text-gray-400">
                  {request.reviewNotes}
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {request.payment && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 dark:border-emerald-900 dark:bg-emerald-500/5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                <Banknote size={22} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white/90">
                  Reimbursement paid
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {request.payment.paymentNumber} ·{" "}
                  {formatDate(request.payment.paymentDate)}
                </p>
              </div>
            </div>
            <p className="text-2xl font-semibold text-emerald-700 dark:text-emerald-300">
              {formatPrice(
                Number(request.payment.amount),
                request.payment.currency,
              )}
            </p>
          </div>
          <dl className="mt-5 grid gap-x-8 md:grid-cols-2">
            <DetailRow
              label="Beneficiary"
              value={request.payment.beneficiaryName}
            />
            <DetailRow
              label="Payment method"
              value={request.payment.paymentMethod.replaceAll("_", " ")}
            />
            <DetailRow
              label="Transaction reference"
              value={request.payment.transactionReference}
            />
            <DetailRow label="Bank" value={request.payment.bankName} />
          </dl>
          <Link
            href="/pharmacy-payments"
            className="mt-4 inline-flex text-sm font-medium text-emerald-700 dark:text-emerald-300"
          >
            Open pharmacy payment register
          </Link>
        </section>
      )}

      <ApproveModal
        request={request}
        isOpen={showApprove}
        onClose={() => setShowApprove(false)}
        onComplete={completeAction}
      />
      <RejectModal
        request={request}
        isOpen={showReject}
        onClose={() => setShowReject(false)}
        onComplete={completeAction}
      />
      <PaymentModal
        request={request}
        memberName={memberName}
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onComplete={completeAction}
      />
    </div>
  );
}

function ApproveModal({
  request,
  isOpen,
  onClose,
  onComplete,
}: {
  request: PharmacyRequest;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (message: string) => void;
}) {
  const [approvedAmount, setApprovedAmount] = useState(
    Number(request.amountClaimed),
  );
  const [reviewNotes, setReviewNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setApprovedAmount(Number(request.amountClaimed));
      setReviewNotes("");
      setError("");
    }
  }, [isOpen, request.amountClaimed]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      const response = await approvePharmacyRequest(request.id, {
        approvedAmount,
        reviewNotes,
      });
      await onComplete(response?.message || "Pharmacy request approved.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to approve request",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="m-4 max-w-lg p-6 lg:p-8"
    >
      <form onSubmit={submit} className="space-y-5">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Approve pharmacy request
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Confirm the amount eligible for reimbursement.
          </p>
        </div>
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <label className="block space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
          <span>Approved amount ({request.currency}) *</span>
          <input
            required
            type="number"
            min="0.01"
            max={Number(request.amountClaimed)}
            step="0.01"
            value={approvedAmount}
            onChange={(event) => setApprovedAmount(Number(event.target.value))}
            className={fieldClass}
          />
          <span className="block text-xs text-gray-400">
            Claimed:{" "}
            {formatPrice(Number(request.amountClaimed), request.currency)}
          </span>
        </label>
        <label className="block space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
          <span>Review notes</span>
          <textarea
            value={reviewNotes}
            onChange={(event) => setReviewNotes(event.target.value)}
            className={textAreaClass}
          />
        </label>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-lg border border-gray-300 px-5 text-sm font-medium dark:border-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="h-11 rounded-lg bg-brand-500 px-5 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? "Approving..." : "Approve request"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function RejectModal({
  request,
  isOpen,
  onClose,
  onComplete,
}: {
  request: PharmacyRequest;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (message: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setNotes("");
      setError("");
    }
  }, [isOpen]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      const response = await rejectPharmacyRequest(request.id, {
        rejectionReason: reason,
        reviewNotes: notes,
      });
      await onComplete(response?.message || "Pharmacy request rejected.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to reject request",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="m-4 max-w-lg p-6 lg:p-8"
    >
      <form onSubmit={submit} className="space-y-5">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Reject pharmacy request
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            A rejection reason is required for the audit trail.
          </p>
        </div>
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <label className="block space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
          <span>Rejection reason *</span>
          <textarea
            required
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className={textAreaClass}
          />
        </label>
        <label className="block space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
          <span>Internal review notes</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className={textAreaClass}
          />
        </label>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-lg border border-gray-300 px-5 text-sm font-medium dark:border-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="h-11 rounded-lg bg-red-600 px-5 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? "Rejecting..." : "Reject request"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function PaymentModal({
  request,
  memberName,
  isOpen,
  onClose,
  onComplete,
}: {
  request: PharmacyRequest;
  memberName: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (message: string) => void;
}) {
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [paymentDate, setPaymentDate] = useState("");
  const [transactionReference, setTransactionReference] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState(memberName);
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState(memberName);
  const [accountNumber, setAccountNumber] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      const date = new Date();
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      setPaymentDate(date.toISOString().slice(0, 16));
      setPaymentMethod("bank_transfer");
      setTransactionReference("");
      setBeneficiaryName(memberName);
      setBankName("");
      setAccountName(memberName);
      setAccountNumber("");
      setProofUrl("");
      setNotes("");
      setError("");
    }
  }, [isOpen, memberName]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      const response = await recordPharmacyPayment(request.id, {
        amount: Number(request.approvedAmount),
        paymentDate,
        paymentMethod,
        transactionReference,
        beneficiaryName,
        bankName,
        accountName,
        accountNumber,
        proofUrl,
        notes,
      });
      await onComplete(response?.message || "Reimbursement payment recorded.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to record payment",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="m-4 max-h-[92vh] max-w-2xl overflow-y-auto p-6 lg:p-8"
    >
      <form onSubmit={submit} className="space-y-5">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Record reimbursement payment
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            This payment is stored in the pharmacy payment register, not invoice
            payments.
          </p>
        </div>
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="rounded-xl bg-emerald-50 px-4 py-3 dark:bg-emerald-500/10">
          <p className="text-xs font-medium uppercase text-emerald-600">
            Approved amount
          </p>
          <p className="mt-1 text-2xl font-semibold text-emerald-700 dark:text-emerald-300">
            {formatPrice(Number(request.approvedAmount), request.currency)}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
            <span>Payment method *</span>
            <select
              required
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
              className={fieldClass}
            >
              <option value="bank_transfer">Bank transfer</option>
              <option value="mobile_money">Mobile money</option>
              <option value="wallet">Wallet</option>
              <option value="cheque">Cheque</option>
              <option value="cash">Cash</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
            <span>Payment date *</span>
            <input
              required
              type="datetime-local"
              value={paymentDate}
              onChange={(event) => setPaymentDate(event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
            <span>Beneficiary name *</span>
            <input
              required
              value={beneficiaryName}
              onChange={(event) => setBeneficiaryName(event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
            <span>Transaction reference</span>
            <input
              value={transactionReference}
              onChange={(event) => setTransactionReference(event.target.value)}
              className={fieldClass}
            />
          </label>
          {paymentMethod === "bank_transfer" && (
            <>
              <label className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                <span>Bank name *</span>
                <input
                  required
                  value={bankName}
                  onChange={(event) => setBankName(event.target.value)}
                  className={fieldClass}
                />
              </label>
              <label className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                <span>Account name *</span>
                <input
                  required
                  value={accountName}
                  onChange={(event) => setAccountName(event.target.value)}
                  className={fieldClass}
                />
              </label>
              <label className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                <span>Account number *</span>
                <input
                  required
                  inputMode="numeric"
                  value={accountNumber}
                  onChange={(event) =>
                    setAccountNumber(event.target.value.replace(/\s+/g, ""))
                  }
                  className={fieldClass}
                />
              </label>
            </>
          )}
          <label className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
            <span>Payment proof URL</span>
            <input
              type="url"
              value={proofUrl}
              onChange={(event) => setProofUrl(event.target.value)}
              placeholder="https://..."
              className={fieldClass}
            />
          </label>
        </div>
        <label className="block space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
          <span>Payment notes</span>
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
            className="h-11 rounded-lg border border-gray-300 px-5 text-sm font-medium dark:border-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="h-11 rounded-lg bg-emerald-600 px-5 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? "Recording..." : "Confirm payment record"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
