"use client";

import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/lib/authStore";
import { useCallback, useEffect, useMemo, useState } from "react";

type Plan = {
  id: string;
  name?: string;
  code?: string;
  description?: string;
  planCycle?: string;
  amount?: number;
  currency?: string;
  maxNumberOfDependents?: number;
};

type Subscription = {
  id: string;
  referenceNumber?: string;
  planId?: string;
  plan?: Plan | null;
  amountPaid?: number;
  currency?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  status?: string;
  isRenewal?: boolean;
};

type Overview = {
  current?: Subscription | null;
  history?: Subscription[];
  plans?: Plan[];
};

type CheckoutSession = {
  planId: string;
  gateway: string;
  checkoutReference: string;
  mode: "renew" | "change";
};

const CHECKOUT_STORAGE_KEY = "altu-retail-subscription-checkout";

function responseData<T>(response: unknown): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: T }).data;
  }
  return response as T;
}

function formatDate(value?: string) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

function formatMoney(amount = 0, currency = "NGN") {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export default function SubscriptionPage() {
  const user = useAuthStore((state) => state.user);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [gateways, setGateways] = useState<
    Array<{ provider: string; label: string }>
  >([]);
  const [gateway, setGateway] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient("/enrollee/subscriptions");
      const data = responseData<Overview>(response);
      setOverview(data);
      const currentPlan =
        data.plans?.find((plan) => plan.id === data.current?.planId) ||
        data.plans?.[0] ||
        null;
      setSelectedPlan(currentPlan);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load subscription details",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadGateways = useCallback(async (plan: Plan) => {
    setGateway("");
    setGateways([]);
    try {
      const response = await apiClient(
        `/enrollee/subscriptions/gateways?currency=${encodeURIComponent(
          plan.currency || "NGN",
        )}`,
      );
      const data = responseData<{
        gateways?: Array<{ provider: string; label: string }>;
      }>(response);
      const items = data.gateways || [];
      setGateways(items);
      setGateway(items[0]?.provider || "");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load payment methods",
      );
    }
  }, []);

  useEffect(() => {
    if (user?.type === "RetailEnrollee") void loadOverview();
    else setLoading(false);
  }, [loadOverview, user?.type]);

  useEffect(() => {
    if (selectedPlan) void loadGateways(selectedPlan);
  }, [loadGateways, selectedPlan]);

  useEffect(() => {
    const finishCheckout = async () => {
      const query = new URLSearchParams(window.location.search);
      const paymentStatus = query.get("payment_status");
      if (!paymentStatus) return;

      window.history.replaceState({}, "", window.location.pathname);
      if (paymentStatus === "cancelled") {
        sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
        setError("Payment was cancelled. Your current subscription is unchanged.");
        return;
      }

      const stored = sessionStorage.getItem(CHECKOUT_STORAGE_KEY);
      if (!stored) {
        setError("The payment session could not be restored. Contact support if you were charged.");
        return;
      }

      const session = JSON.parse(stored) as CheckoutSession;
      const reference =
        query.get("reference") ||
        query.get("trxref") ||
        query.get("session_id") ||
        query.get("token") ||
        session.checkoutReference;
      setProcessing(true);
      setError("");
      try {
        await apiClient("/enrollee/subscriptions/complete", {
          method: "POST",
          body: {
            planId: session.planId,
            gateway: session.gateway,
            checkoutReference: reference,
            mode: session.mode,
          },
        });
        sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
        setSuccess(
          session.mode === "renew"
            ? "Your subscription was renewed successfully."
            : "Your health plan was updated successfully.",
        );
        await loadOverview();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to confirm your payment",
        );
      } finally {
        setProcessing(false);
      }
    };

    void finishCheckout();
  }, [loadOverview]);

  const selectedMode = useMemo<"renew" | "change">(
    () =>
      overview?.current?.planId === selectedPlan?.id ? "renew" : "change",
    [overview?.current?.planId, selectedPlan?.id],
  );

  const beginCheckout = async () => {
    if (!selectedPlan || !gateway) {
      setError("Choose a plan and payment method.");
      return;
    }

    setProcessing(true);
    setError("");
    setSuccess("");
    try {
      const response = await apiClient("/enrollee/subscriptions/checkout", {
        method: "POST",
        body: {
          planId: selectedPlan.id,
          gateway,
          returnUrl: `${window.location.origin}/subscription`,
        },
      });
      const checkout = responseData<{
        checkoutUrl: string;
        checkoutReference: string;
      }>(response);
      sessionStorage.setItem(
        CHECKOUT_STORAGE_KEY,
        JSON.stringify({
          planId: selectedPlan.id,
          gateway,
          checkoutReference: checkout.checkoutReference,
          mode: selectedMode,
        } satisfies CheckoutSession),
      );
      window.location.assign(checkout.checkoutUrl);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to start payment",
      );
      setProcessing(false);
    }
  };

  if (user?.type !== "RetailEnrollee") {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03]">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Retail subscriptions only
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Company-sponsored cover is managed by your employer. Subscription
          renewal is available here only for retail enrollees.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-brand-600 dark:text-brand-400">
          Retail cover
        </p>
        <h1 className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
          Subscription & plans
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Renew your current subscription or move to another individual plan.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900/30 dark:bg-green-900/10 dark:text-green-400">
          {success}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500 dark:border-gray-800 dark:bg-white/[0.03]">
          Loading subscription details...
        </div>
      ) : (
        <>
          {overview?.current && (
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-600 p-6 text-white shadow-lg shadow-emerald-900/10">
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
                    Current subscription
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    {overview.current.plan?.name || "Retail health plan"}
                  </h2>
                  <p className="mt-2 text-sm text-emerald-100">
                    Reference {overview.current.referenceNumber || "—"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div>
                    <p className="text-emerald-100">Status</p>
                    <p className="mt-1 font-semibold capitalize">
                      {overview.current.status || "active"}
                    </p>
                  </div>
                  <div>
                    <p className="text-emerald-100">Coverage ends</p>
                    <p className="mt-1 font-semibold">
                      {formatDate(overview.current.subscriptionEndDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Choose your plan
            </h2>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              {(overview?.plans || []).map((plan) => {
                const selected = selectedPlan?.id === plan.id;
                const current = overview?.current?.planId === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlan(plan)}
                    className={`rounded-2xl border p-5 text-left transition ${
                      selected
                        ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/10 dark:bg-emerald-500/10"
                        : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {plan.name || "Health plan"}
                          </h3>
                          {current && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                              CURRENT
                            </span>
                          )}
                        </div>
                        <p className="mt-2 line-clamp-3 text-sm leading-5 text-gray-500 dark:text-gray-400">
                          {plan.description || "Individual health cover"}
                        </p>
                      </div>
                      <span
                        className={`mt-1 h-5 w-5 shrink-0 rounded-full border-2 ${
                          selected
                            ? "border-emerald-600 bg-emerald-600"
                            : "border-gray-300"
                        }`}
                      />
                    </div>
                    <p className="mt-5 text-2xl font-semibold text-emerald-700 dark:text-emerald-400">
                      {formatMoney(plan.amount, plan.currency)}
                    </p>
                    <p className="mt-1 text-xs capitalize text-gray-500">
                      {plan.planCycle || "annual"} billing
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {selectedPlan && (
            <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Payment method
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {gateways.map((item) => (
                      <button
                        key={item.provider}
                        type="button"
                        onClick={() => setGateway(item.provider)}
                        className={`rounded-xl border px-4 py-2.5 text-sm font-medium ${
                          gateway === item.provider
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10"
                            : "border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                    {gateways.length === 0 && (
                      <p className="text-sm text-gray-500">
                        No payment gateway is available for {selectedPlan.currency}.
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={beginCheckout}
                  disabled={processing || !gateway}
                  className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {processing
                    ? "Processing..."
                    : selectedMode === "renew"
                      ? "Renew subscription"
                      : "Change plan and pay"}
                </button>
              </div>
            </section>
          )}

          {(overview?.history?.length || 0) > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Subscription history
              </h2>
              <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                {overview?.history?.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between gap-3 border-b border-gray-100 px-5 py-4 last:border-b-0 sm:flex-row sm:items-center dark:border-gray-800"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.plan?.name || "Retail health plan"}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {formatDate(item.subscriptionStartDate)} – {formatDate(item.subscriptionEndDate)}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatMoney(item.amountPaid, item.currency)}
                      </p>
                      <p className="mt-1 text-xs capitalize text-gray-500">
                        {item.status || "active"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
