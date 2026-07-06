/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { apiClient } from "@/lib/apiClient";
import capitalizeWords from "@/lib/capitalize";
import { useCallback, useEffect, useMemo, useState } from "react";

type RenderedItem = {
  id: string;
  itemName?: string;
  unit?: string;
  unitPrice?: number | string;
  quantityRendered?: number | string;
  lineAmount?: number | string;
  approvedAmount?: number | string | null;
  adminComment?: string | null;
  status?: string;
  notes?: string | null;
  drugId?: string | null;
  serviceId?: string | null;
  Drug?: any;
  Service?: any;
};

type AuthorizationCode = {
  id: string;
  authorizationCode: string;
  authorizationType: string;
  status: string;
  validFrom: string;
  validTo: string;
  amountAuthorized?: number | string;
  currency?: string;
  notes?: string | null;
  reasonForCode?: string | null;
  approvalNote?: string | null;
  memberType?: string | null;
  member?: any;
  Provider?: any;
  Diagnosis?: any;
  Company?: any;
  CompanyPlan?: any;
  renderedItems?: RenderedItem[];
  createdAt?: string;
};

type ReviewDraft = {
  action: "approve" | "decline" | "partial";
  approvedAmount: string;
  adminComment: string;
};

function formatDate(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function money(value?: number | string | null, currency = "NGN") {
  const amount = Number(value || 0);
  return `${currency === "NGN" ? "₦" : currency} ${amount.toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )}`;
}

function statusClass(status?: string) {
  switch (status) {
    case "active":
    case "approved":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "partial":
      return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400";
    case "pending":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "used":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "expired":
    case "cancelled":
    case "rejected":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
  }
}

function Field({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">
        {value || "-"}
      </p>
    </div>
  );
}

export default function AuthorizationCodeDetailsPage({ id }: { id: string }) {
  const [authorizationCode, setAuthorizationCode] =
    useState<AuthorizationCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingItemId, setSavingItemId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [reviewDrafts, setReviewDrafts] = useState<Record<string, ReviewDraft>>(
    {},
  );

  const fetchAuthorizationCode = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient(`/admin/authorization-codes/${id}`);
      const item = response?.data?.authorizationCode || response?.data || null;
      setAuthorizationCode(item);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to fetch authorization code.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAuthorizationCode();
  }, [fetchAuthorizationCode]);

  const memberName = useMemo(() => {
    const member = authorizationCode?.member;
    if (!member) return "-";
    return `${member.firstName || ""} ${member.lastName || ""}`.trim() || "-";
  }, [authorizationCode]);

  const setDraft = (itemId: string, patch: Partial<ReviewDraft>) => {
    setReviewDrafts((current) => ({
      ...current,
      [itemId]: {
        ...(current[itemId] || {
          action: "approve",
          approvedAmount: "",
          adminComment: "",
        }),
        ...patch,
      },
    }));
  };

  const reviewLineItem = async (item: RenderedItem) => {
    const draft = reviewDrafts[item.id] || {
      action: "approve",
      approvedAmount: "",
      adminComment: "",
    };

    if (["decline", "partial"].includes(draft.action) && !draft.adminComment) {
      setErrorMessage("Admin comment is required for decline or partial approval.");
      return;
    }

    if (draft.action === "partial" && !draft.approvedAmount) {
      setErrorMessage("Approved amount is required for partial approval.");
      return;
    }

    try {
      setSavingItemId(item.id);
      setErrorMessage("");
      await apiClient(
        `/admin/authorization-codes/${id}/rendered-items/${item.id}/review`,
        {
          method: "PUT",
          body: {
            action: draft.action,
            approvedAmount:
              draft.action === "partial" ? Number(draft.approvedAmount) : undefined,
            adminComment: draft.adminComment || undefined,
          },
        },
      );
      setSuccessMessage("Line item reviewed successfully.");
      await fetchAuthorizationCode();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to review line item.",
      );
    } finally {
      setSavingItemId(null);
    }
  };

  if (loading) return <SpinnerThree />;

  if (!authorizationCode) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
        {errorMessage || "Authorization code not found."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(errorMessage || successMessage) && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            errorMessage
              ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400"
              : "border-green-200 bg-green-50 text-green-700 dark:border-green-900/30 dark:bg-green-900/10 dark:text-green-400"
          }`}
        >
          {errorMessage || successMessage}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Authorization Code
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {authorizationCode.authorizationCode}
            </h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusClass(
                  authorizationCode.status,
                )}`}
              >
                {capitalizeWords(authorizationCode.status)}
              </span>
              <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {capitalizeWords(authorizationCode.authorizationType)}
              </span>
            </div>
          </div>
          <div className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-right dark:border-brand-900/30 dark:bg-brand-900/10">
            <p className="text-xs font-medium uppercase text-brand-700 dark:text-brand-300">
              Approved Amount
            </p>
            <p className="mt-1 text-2xl font-semibold text-brand-900 dark:text-brand-200">
              {money(authorizationCode.amountAuthorized, authorizationCode.currency)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
            Member
          </h2>
          <div className="space-y-4">
            <Field label="Name" value={memberName} />
            <Field
              label="Member Type"
              value={
                authorizationCode.memberType
                  ? capitalizeWords(authorizationCode.memberType.replace(/_/g, " "))
                  : "-"
              }
            />
            <Field label="Policy Number" value={authorizationCode.member?.policyNumber} />
            <Field label="Email" value={authorizationCode.member?.email} />
            <Field label="Phone" value={authorizationCode.member?.phoneNumber} />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
            Provider & Plan
          </h2>
          <div className="space-y-4">
            <Field label="Provider" value={authorizationCode.Provider?.name} />
            <Field label="Provider Code" value={authorizationCode.Provider?.code} />
            <Field label="Company" value={authorizationCode.Company?.name} />
            <Field label="Plan" value={authorizationCode.CompanyPlan?.name} />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
            Request
          </h2>
          <div className="space-y-4">
            <Field label="Diagnosis" value={authorizationCode.Diagnosis?.name} />
            <Field label="Valid From" value={formatDate(authorizationCode.validFrom)} />
            <Field label="Valid To" value={formatDate(authorizationCode.validTo)} />
            <Field label="Created" value={formatDateTime(authorizationCode.createdAt)} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
          Notes
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Field label="Provider Notes" value={authorizationCode.notes} />
          <Field label="Reason" value={authorizationCode.reasonForCode} />
          <Field label="Approval Note" value={authorizationCode.approvalNote} />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Line Item Review
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                {[
                  "Item",
                  "Requested",
                  "Approved",
                  "Status",
                  "Admin Comment",
                  "Review",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {authorizationCode.renderedItems?.length ? (
                authorizationCode.renderedItems.map((item) => {
                  const draft = reviewDrafts[item.id] || {
                    action: "approve",
                    approvedAmount: "",
                    adminComment: "",
                  };

                  return (
                    <tr key={item.id}>
                      <td className="p-4 align-top">
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                          {item.itemName || item.Drug?.name || item.Service?.name || "-"}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {item.drugId ? "Drug" : "Service"} • {item.unit || "-"} • Qty{" "}
                          {Number(item.quantityRendered || 0)}
                        </p>
                        {item.notes && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {item.notes}
                          </p>
                        )}
                      </td>
                      <td className="p-4 align-top text-sm text-gray-700 dark:text-gray-400">
                        {money(item.lineAmount, authorizationCode.currency)}
                      </td>
                      <td className="p-4 align-top text-sm font-medium text-gray-800 dark:text-white/90">
                        {item.approvedAmount !== null && item.approvedAmount !== undefined
                          ? money(item.approvedAmount, authorizationCode.currency)
                          : "-"}
                      </td>
                      <td className="p-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusClass(
                            item.status,
                          )}`}
                        >
                          {capitalizeWords(item.status || "pending")}
                        </span>
                      </td>
                      <td className="p-4 align-top text-sm text-gray-700 dark:text-gray-400">
                        {item.adminComment || "-"}
                      </td>
                      <td className="min-w-[320px] p-4 align-top">
                        <div className="grid gap-2">
                          <select
                            value={draft.action}
                            onChange={(event) =>
                              setDraft(item.id, {
                                action: event.target.value as ReviewDraft["action"],
                              })
                            }
                            className="h-10 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                          >
                            <option value="approve">Approve</option>
                            <option value="decline">Decline</option>
                            <option value="partial">Partial approval</option>
                          </select>

                          {draft.action === "partial" && (
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Approved amount"
                              value={draft.approvedAmount}
                              onChange={(event) =>
                                setDraft(item.id, {
                                  approvedAmount: event.target.value,
                                })
                              }
                              className="h-10 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                            />
                          )}

                          {draft.action !== "approve" && (
                            <textarea
                              rows={2}
                              placeholder="Admin comment"
                              value={draft.adminComment}
                              onChange={(event) =>
                                setDraft(item.id, {
                                  adminComment: event.target.value,
                                })
                              }
                              className="rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                            />
                          )}

                          <button
                            onClick={() => reviewLineItem(item)}
                            disabled={savingItemId === item.id}
                            className="h-10 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
                          >
                            {savingItemId === item.id ? "Saving..." : "Save review"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="p-4 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No line items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
