"use client";

import { apiClient } from "@/lib/apiClient";
import {
  detectVisitorCountryCode,
  getPlanCategoriesForCountry,
  getPlanCategoryLabel,
  type PlanCategory,
  type PlanCategoryOption,
} from "@/lib/planMarket";
import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";

type InferredPlanCategory = PlanCategory | "general";
type PaymentProvider = "paystack" | "paypal" | "stripe";

type PublicPlan = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  annualPremiumPrice?: string | number | null;
  currency?: string | null;
  planCycle?: string | null;
  allowDependentEnrolee?: boolean;
  ageLimit?: number | null;
  dependentAgeLimit?: number | null;
  maxNumberOfDependents?: number | null;
};

type CurrencyRate = {
  currencyCode: string;
  currencyName?: string;
  rateToNgn: number;
  ngnToCurrencyRate: number;
};

type CurrencyRates = Record<string, CurrencyRate>;

type DisplayPlanRow = {
  label: string;
  price: string;
  sourcePrice: string;
  paymentCurrency: string;
  converted: boolean;
  planId?: string;
};

type DisplayPlan = {
  id: string;
  name: string;
  description: string;
  category: InferredPlanCategory;
  audience: string;
  cycleLabel: string;
  rows: DisplayPlanRow[];
  features: string[];
  sources: PublicPlan[];
};

type PaymentGateway = {
  provider: PaymentProvider;
  label: string;
};

type PlansResponse = {
  data?: {
    list?: PublicPlan[];
    displayCurrency?: string;
    currencyRates?: CurrencyRates;
  };
};

type GatewaysResponse = {
  data?: {
    gateways?: PaymentGateway[];
  };
};

type CheckoutResponse = {
  data?: {
    gateway: PaymentProvider;
    checkoutUrl: string;
    checkoutReference: string;
  };
};

type CompletePurchaseResponse = {
  data?: {
    loginLink?: string;
    enrollee?: {
      email: string;
      policyNumber: string;
    };
  };
};

const countryCurrencyMap: Record<string, string> = {
  AE: "AED",
  AU: "AUD",
  BR: "BRL",
  CA: "CAD",
  CH: "CHF",
  CN: "CNY",
  DE: "EUR",
  DK: "DKK",
  ES: "EUR",
  FR: "EUR",
  GB: "GBP",
  GH: "GHS",
  HK: "HKD",
  IE: "EUR",
  IN: "INR",
  JP: "JPY",
  KE: "KES",
  NG: "NGN",
  NO: "NOK",
  NZ: "NZD",
  SE: "SEK",
  SG: "SGD",
  US: "USD",
  ZA: "ZAR",
};

const planVariantLabels: Record<string, { group: string; label: string; order: number; rowOrder: number }> = {
  SENIOR_BASIC_SINGLE_PARENT: {
    group: "senior basic",
    label: "Single Parent",
    order: 1,
    rowOrder: 1,
  },
  SENIOR_BASIC_COUPLE: {
    group: "senior basic",
    label: "Couple",
    order: 1,
    rowOrder: 2,
  },
  SENIOR_STANDARD_SINGLE_PARENT: {
    group: "senior standard",
    label: "Single Parent",
    order: 2,
    rowOrder: 1,
  },
  SENIOR_STANDARD_COUPLE: {
    group: "senior standard",
    label: "Couple",
    order: 2,
    rowOrder: 2,
  },
  SENIOR_ELITE_SINGLE_PARENT: {
    group: "senior elite",
    label: "Single Parent",
    order: 3,
    rowOrder: 1,
  },
  SENIOR_ELITE_COUPLE: {
    group: "senior elite",
    label: "Couple",
    order: 3,
    rowOrder: 2,
  },
  VITAL_BASIC_INDIVIDUAL: {
    group: "vital basic",
    label: "Individual",
    order: 1,
    rowOrder: 1,
  },
  VITAL_BASIC_FAMILY: {
    group: "vital basic",
    label: "Family",
    order: 1,
    rowOrder: 2,
  },
  VITAL_LITE_INDIVIDUAL: {
    group: "vital lite",
    label: "Individual",
    order: 2,
    rowOrder: 1,
  },
  VITAL_LITE_FAMILY: {
    group: "vital lite",
    label: "Family",
    order: 2,
    rowOrder: 2,
  },
  VITAL_GROOVE_INDIVIDUAL: {
    group: "vital groove",
    label: "Individual",
    order: 3,
    rowOrder: 1,
  },
  VITAL_GROOVE_FAMILY: {
    group: "vital groove",
    label: "Family",
    order: 3,
    rowOrder: 2,
  },
  VITAL_PLUS_INDIVIDUAL: {
    group: "vital plus",
    label: "Individual",
    order: 4,
    rowOrder: 1,
  },
  VITAL_PLUS_FAMILY: {
    group: "vital plus",
    label: "Family",
    order: 4,
    rowOrder: 2,
  },
  VITAL_MAX_INDIVIDUAL: {
    group: "vital max",
    label: "Individual",
    order: 5,
    rowOrder: 1,
  },
  VITAL_MAX_FAMILY: {
    group: "vital max",
    label: "Family",
    order: 5,
    rowOrder: 2,
  },
};

function normalizePlanName(name: string) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

function titleCase(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeCurrency(currency?: string | null) {
  return String(currency || "NGN").trim().toUpperCase();
}

function getRate(currency: string, rates: CurrencyRates): CurrencyRate | null {
  const code = normalizeCurrency(currency);
  if (code === "NGN") {
    return {
      currencyCode: "NGN",
      currencyName: "Nigerian Naira",
      rateToNgn: 1,
      ngnToCurrencyRate: 1,
    };
  }

  return rates[code] || null;
}

function convertCurrency(
  amount: number,
  sourceCurrency: string,
  targetCurrency: string,
  rates: CurrencyRates,
) {
  const source = normalizeCurrency(sourceCurrency);
  const target = normalizeCurrency(targetCurrency);

  if (source === target) {
    return { amount, currency: source, converted: false };
  }

  const sourceRate = getRate(source, rates);
  const targetRate = getRate(target, rates);
  if (!sourceRate || !targetRate) {
    return { amount, currency: source, converted: false };
  }

  const amountInNgn = amount * Number(sourceRate.rateToNgn);
  return {
    amount: amountInNgn * Number(targetRate.ngnToCurrencyRate),
    currency: target,
    converted: true,
  };
}

function formatCurrency(amount: number, currency: string) {
  const code = normalizeCurrency(currency);
  const maximumFractionDigits = ["JPY", "KRW", "VND"].includes(code) ? 0 : 2;

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      maximumFractionDigits,
    }).format(amount);
  } catch {
    return `${code} ${amount.toLocaleString(undefined, {
      maximumFractionDigits,
    })}`;
  }
}

function inferPlanCategory(plan: PublicPlan): InferredPlanCategory {
  const text = `${plan.name || ""} ${plan.code || ""} ${plan.description || ""}`.toLowerCase();

  if (/(corporate|company|business|employer|staff|group)/.test(text)) {
    return "corporate";
  }
  if (/(geriatric|senior|elder|aged|parent)/.test(text)) {
    return "geriatric";
  }
  if (/(diaspora|international|abroad|overseas|uk|usa|europe)/.test(text)) {
    return "diaspora";
  }
  if (/(retail|vital|individual|family)/.test(text)) {
    return "retail";
  }

  return "general";
}

function getVariantLabel(plan: PublicPlan) {
  const definition = planVariantLabels[plan.code];
  if (definition) {
    return definition.label;
  }

  const text = `${plan.code || ""} ${plan.name || ""}`.toLowerCase();
  if (text.includes("family")) return "Family";
  if (text.includes("couple")) return "Couple";
  if (text.includes("single")) return "Single";
  if (text.includes("individual")) return "Individual";
  return "Plan";
}

function getPlanGroupKey(plan: PublicPlan) {
  const definition = planVariantLabels[plan.code];
  return definition?.group || normalizePlanName(plan.name || plan.code || plan.id);
}

function getPlanOrder(plan: PublicPlan) {
  return planVariantLabels[plan.code]?.order ?? 999;
}

function getRowOrder(plan: PublicPlan) {
  return planVariantLabels[plan.code]?.rowOrder ?? 999;
}

function cycleToLabel(cycle?: string | null) {
  const normalized = String(cycle || "annual").toLowerCase();
  if (normalized.includes("month")) return "per month";
  if (normalized.includes("quarter")) return "per quarter";
  if (normalized.includes("week")) return "per week";
  return "per year";
}

function buildDisplayPlans(
  plans: PublicPlan[],
  displayCurrency: string,
  rates: CurrencyRates,
): DisplayPlan[] {
  const grouped = new Map<
    string,
    {
      category: InferredPlanCategory;
      group: string;
      plans: PublicPlan[];
    }
  >();

  plans.forEach((plan) => {
    const category = inferPlanCategory(plan);
    const group = getPlanGroupKey(plan);
    const key = `${category}:${group}`;
    const existing = grouped.get(key);

    if (existing) {
      existing.plans.push(plan);
      return;
    }

    grouped.set(key, {
      category,
      group,
      plans: [plan],
    });
  });

  return Array.from(grouped.values())
    .map((item) => {
      const orderedPlans = [...item.plans].sort(
        (a, b) => getRowOrder(a) - getRowOrder(b) || a.name.localeCompare(b.name),
      );
      const firstPlan = orderedPlans[0];
      const cycles = new Set(orderedPlans.map((plan) => cycleToLabel(plan.planCycle)));
      const categoryLabel =
        item.category === "general"
          ? "General"
          : getPlanCategoryLabel(item.category);

      return {
        id: `${item.category}-${item.group}`,
        name: firstPlan?.name || titleCase(item.group),
        description:
          firstPlan?.description ||
          "Healthcare coverage for everyday care and managed support.",
        category: item.category,
        audience: `${categoryLabel} plans`,
        cycleLabel: cycles.size === 1 ? Array.from(cycles)[0] : "billing cycle varies",
        rows: orderedPlans.map((plan) => {
          const amount = Number(plan.annualPremiumPrice || 0);
          const sourceCurrency = normalizeCurrency(plan.currency);
          const display = convertCurrency(
            amount,
            sourceCurrency,
            displayCurrency,
            rates,
          );

          return {
            label: getVariantLabel(plan),
            price: formatCurrency(display.amount, display.currency),
            sourcePrice: formatCurrency(amount, sourceCurrency),
            paymentCurrency: display.currency,
            converted: display.converted,
            planId: plan.id,
          };
        }),
        features: [
          firstPlan?.planCycle
            ? `${titleCase(firstPlan.planCycle)} coverage cycle`
            : "Flexible coverage cycle",
          firstPlan?.allowDependentEnrolee
            ? "Dependent coverage available"
            : "Individual focused coverage",
          firstPlan?.maxNumberOfDependents
            ? `Up to ${firstPlan.maxNumberOfDependents} dependents`
            : "Managed care access",
          "Digital support",
        ],
        sources: orderedPlans,
      };
    })
    .sort((a, b) => {
      const planA = a.sources[0];
      const planB = b.sources[0];
      return (
        getPlanOrder(planA) - getPlanOrder(planB) ||
        a.name.localeCompare(b.name)
      );
    });
}

function getCurrencyForCountry(countryCode?: string) {
  const code = String(countryCode || "").trim().toUpperCase();
  return countryCurrencyMap[code] || "";
}

function readCategoryFromUrl(
  availableCategories: PlanCategoryOption[],
): PlanCategory {
  if (typeof window === "undefined") {
    return availableCategories[0]?.key || "retail";
  }

  const params = new URLSearchParams(window.location.search);
  const category = params.get("planCategory")?.toLowerCase() as PlanCategory;
  return availableCategories.some((item) => item.key === category)
    ? category
    : availableCategories[0]?.key || "retail";
}

function readReferralCodeFromUrl() {
  if (typeof window === "undefined") {
    return "";
  }

  return new URLSearchParams(window.location.search)
    .get("referralCode")
    ?.trim() || "";
}

export default function Plans() {
  const [availableCategories, setAvailableCategories] = useState<
    PlanCategoryOption[]
  >([]);
  const [selectedCategory, setSelectedCategory] =
    useState<PlanCategory>("retail");
  const [displayCurrency, setDisplayCurrency] = useState("NGN");
  const [backendPlans, setBackendPlans] = useState<PublicPlan[]>([]);
  const [currencyRates, setCurrencyRates] = useState<CurrencyRates>({});
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<DisplayPlan | null>(null);
  const [selectedVariantPlanId, setSelectedVariantPlanId] = useState("");
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [selectedGateway, setSelectedGateway] = useState<PaymentProvider | "">(
    "",
  );
  const [isLoadingGateways, setIsLoadingGateways] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");
  const [referralCodeFromUrl, setReferralCodeFromUrl] = useState("");
  const [planForm, setPlanForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    referralCode: "",
  });

  const allPlans = useMemo(
    () => buildDisplayPlans(backendPlans, displayCurrency, currencyRates),
    [backendPlans, displayCurrency, currencyRates],
  );

  const visiblePlans = useMemo(() => {
    return allPlans.filter((plan) => plan.category === selectedCategory);
  }, [allPlans, selectedCategory]);

  const selectedVariant = selectedPlan?.rows.find(
    (row) => row.planId === selectedVariantPlanId,
  );

  useEffect(() => {
    const referralCode = readReferralCodeFromUrl();
    setReferralCodeFromUrl(referralCode);

    if (referralCode) {
      setPlanForm((current) => ({
        ...current,
        referralCode,
      }));
    }
  }, []);

  useEffect(() => {
    setSelectedCategory(readCategoryFromUrl(availableCategories));

    const handleCategoryEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ category?: PlanCategory }>).detail;
      const category =
        detail?.category || readCategoryFromUrl(availableCategories);
      if (availableCategories.some((item) => item.key === category)) {
        setSelectedCategory(category);
      }
    };

    const handleUrlChange = () =>
      setSelectedCategory(readCategoryFromUrl(availableCategories));

    window.addEventListener("altu:plan-category", handleCategoryEvent);
    window.addEventListener("popstate", handleUrlChange);
    window.addEventListener("hashchange", handleUrlChange);

    return () => {
      window.removeEventListener("altu:plan-category", handleCategoryEvent);
      window.removeEventListener("popstate", handleUrlChange);
      window.removeEventListener("hashchange", handleUrlChange);
    };
  }, [availableCategories]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment_status");
    if (!paymentStatus) {
      return;
    }

    const completePurchase = async () => {
      if (paymentStatus === "cancelled") {
        setModalError("Payment was cancelled. No account was created.");
        window.history.replaceState({}, "", window.location.pathname);
        return;
      }

      const pendingRaw = window.localStorage.getItem("altu_pending_purchase");
      if (!pendingRaw) {
        setModalError("We could not find your pending registration details.");
        window.history.replaceState({}, "", window.location.pathname);
        return;
      }

      try {
        setIsProcessingPayment(true);
        const pending = JSON.parse(pendingRaw) as {
          planId: string;
          gateway: PaymentProvider;
          checkoutReference: string;
          form: typeof planForm;
        };
        const checkoutReference =
          pending.gateway === "stripe"
            ? params.get("session_id") || pending.checkoutReference
            : pending.gateway === "paystack"
              ? params.get("reference") || pending.checkoutReference
              : params.get("token") || pending.checkoutReference;

        const response = (await apiClient("/public/purchases/complete", {
          method: "POST",
          body: {
            planId: pending.planId,
            gateway: pending.gateway,
            checkoutReference,
            firstName: pending.form.firstName,
            lastName: pending.form.lastName,
            email: pending.form.email,
            phoneNumber: pending.form.phone,
            referralCode: pending.form.referralCode,
          },
        })) as CompletePurchaseResponse;

        window.localStorage.removeItem("altu_pending_purchase");
        setModalSuccess(
          `Payment confirmed. Your login details have been emailed. Login at ${
            response.data?.loginLink || "https://enrollee.altuhealth.com/signin"
          }.`,
        );
      } catch (err) {
        setModalError(
          err instanceof Error
            ? err.message
            : "Payment completed, but account setup failed.",
        );
      } finally {
        setIsProcessingPayment(false);
        window.history.replaceState({}, "", window.location.pathname);
      }
    };

    completePurchase();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchPlans = async () => {
      try {
        const countryCode = await detectVisitorCountryCode();
        const detectedCurrency = getCurrencyForCountry(countryCode || undefined);

        if (isMounted) {
          setAvailableCategories(getPlanCategoriesForCountry(countryCode));
        }

        const query = detectedCurrency
          ? `?currency=${encodeURIComponent(detectedCurrency)}`
          : "";
        const payload = (await apiClient(`/public/plans${query}`)) as PlansResponse;

        if (isMounted) {
          setBackendPlans(payload.data?.list || []);
          setCurrencyRates(payload.data?.currencyRates || {});
          setDisplayCurrency(payload.data?.displayCurrency || detectedCurrency || "NGN");
        }
      } catch {
        if (isMounted) {
          setBackendPlans([]);
          setCurrencyRates({});
          setDisplayCurrency("NGN");
        }
      } finally {
        if (isMounted) {
          setIsLoadingPlans(false);
        }
      }
    };

    fetchPlans();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setGateways([]);
    setSelectedGateway("");

    if (!selectedPlan || !selectedVariant) {
      setIsLoadingGateways(false);
      return;
    }

    let isCurrentRequest = true;

    const fetchGateways = async () => {
      setIsLoadingGateways(true);

      try {
        const response = (await apiClient(
          `/public/purchases/gateways?currency=${encodeURIComponent(selectedVariant.paymentCurrency)}`,
        )) as GatewaysResponse;
        const availableGateways = response.data?.gateways || [];

        if (isCurrentRequest) {
          setGateways(availableGateways);
          setSelectedGateway(availableGateways[0]?.provider || "");
        }
      } catch (err) {
        if (isCurrentRequest) {
          setModalError(
            err instanceof Error
              ? err.message
              : "Unable to fetch payment gateways.",
          );
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoadingGateways(false);
        }
      }
    };

    fetchGateways();

    return () => {
      isCurrentRequest = false;
    };
  }, [selectedPlan, selectedVariant]);

  const handleCategoryChange = (category: PlanCategory) => {
    setSelectedCategory(category);
    const url = new URL(window.location.href);
    url.searchParams.set("planCategory", category);
    url.hash = "plans";
    window.history.replaceState({}, "", url.toString());
  };

  const handlePlanInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setPlanForm((prev) => ({ ...prev, [name]: value }));
  };

  const closePlanModal = () => {
    setSelectedPlan(null);
    setSelectedVariantPlanId("");
    setSelectedGateway("");
    setGateways([]);
    setIsLoadingGateways(false);
    setModalError("");
    setPlanForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      referralCode: referralCodeFromUrl,
    });
  };

  const openPlanModal = (plan: DisplayPlan) => {
    setSelectedPlan(plan);
    setSelectedVariantPlanId(plan.rows[0]?.planId || "");
    setModalError("");
    setModalSuccess("");
  };

  const handleProceedToPayment = async () => {
    if (!selectedVariantPlanId) {
      setModalError("Select a plan option before choosing a payment gateway.");
      return;
    }
    if (!selectedGateway) {
      setModalError(
        selectedVariant?.paymentCurrency === "NGN" && gateways.length === 0
          ? "Paystack is not available yet for Naira payments."
          : "Select a payment gateway.",
      );
      return;
    }
    if (
      !planForm.firstName ||
      !planForm.lastName ||
      !planForm.email ||
      !planForm.phone
    ) {
      setModalError("Fill in your name, email, and phone number.");
      return;
    }

    try {
      setIsProcessingPayment(true);
      setModalError("");
      const response = (await apiClient("/public/purchases/checkout", {
        method: "POST",
        body: {
          planId: selectedVariantPlanId,
          gateway: selectedGateway,
          email: planForm.email,
          phoneNumber: planForm.phone,
        },
      })) as CheckoutResponse;

      if (!response.data?.checkoutUrl || !response.data.checkoutReference) {
        throw new Error("Payment gateway did not return a checkout URL.");
      }

      window.localStorage.setItem(
        "altu_pending_purchase",
        JSON.stringify({
          planId: selectedVariantPlanId,
          gateway: response.data.gateway,
          checkoutReference: response.data.checkoutReference,
          form: planForm,
        }),
      );
      window.location.assign(response.data.checkoutUrl);
    } catch (err) {
      setModalError(
        err instanceof Error ? err.message : "Unable to start payment.",
      );
      setIsProcessingPayment(false);
    }
  };

  return (
    <section className="plans" id="plans">
      <div className="container">
        <div className="section-title">
          <span>Our Plans</span>
          <h2>Choose A Health Plan That Fits Your Needs.</h2>
          <p>
            Browse plans available for your location by category. Prices are shown in{" "}
            {displayCurrency} when an exchange rate is available.
          </p>
        </div>

        <div className="plan-category-tabs" aria-label="Plan categories">
          {availableCategories.map((category) => (
            <button
              key={category.key}
              type="button"
              className={selectedCategory === category.key ? "active" : ""}
              onClick={() => handleCategoryChange(category.key)}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="plan-grid">
          {visiblePlans.map((plan) => (
            <div
              key={plan.id}
              className={`plan-card ${
                selectedCategory === plan.category
                  ? "plan-card-highlighted"
                  : ""
              }`}
            >
              <div className="plan-card-header">
                <div>
                  <h3>{plan.name}</h3>
                  <div className="plan-audience">
                    <span></span>
                    <p>{plan.audience}</p>
                  </div>
                </div>
              </div>

              <div className="plan-price-panel">
                {plan.rows.map((row) => (
                  <div className="plan-price-row" key={`${row.label}-${row.planId}`}>
                    <span>{row.label}</span>
                    <strong>{row.price}</strong>
                  </div>
                ))}
                <p>{plan.cycleLabel}</p>
              </div>

              <div className="plan-divider"></div>

              <div className="plan-content">
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <span className="plan-check">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className="buy-btn"
                  onClick={() => openPlanModal(plan)}
                  disabled={isLoadingPlans}
                >
                  {isLoadingPlans ? "Loading" : "Register"} <span>→</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {!isLoadingPlans && visiblePlans.length === 0 && (
          <div className="plan-empty-state">
            <strong>No plans in this category yet.</strong>
            <p>Choose another category to view available coverage options.</p>
          </div>
        )}
      </div>

      {modalError && !selectedPlan && (
        <div className="plan-modal-backdrop" role="dialog" aria-modal="true">
          <div className="plan-modal plan-modal-small">
            <button
              type="button"
              className="plan-modal-close"
              onClick={() => setModalError("")}
              aria-label="Close message"
            >
              ×
            </button>
            <div className="plan-modal-header">
              <span>Payment Gateway</span>
              <h3>Unavailable</h3>
              <p>{modalError}</p>
            </div>
          </div>
        </div>
      )}

      {modalSuccess && (
        <div className="plan-modal-backdrop" role="dialog" aria-modal="true">
          <div className="plan-modal plan-modal-small">
            <button
              type="button"
              className="plan-modal-close"
              onClick={() => setModalSuccess("")}
              aria-label="Close message"
            >
              ×
            </button>
            <div className="plan-modal-header">
              <span>Account Created</span>
              <h3>Registration Complete</h3>
              <p>{modalSuccess}</p>
            </div>
          </div>
        </div>
      )}

      {selectedPlan && (
        <div className="plan-modal-backdrop" role="dialog" aria-modal="true">
          <div className="plan-modal">
            <button
              type="button"
              className="plan-modal-close"
              onClick={closePlanModal}
              aria-label="Close plan registration"
            >
              ×
            </button>

            <div className="plan-modal-header">
              <span>Plan Registration</span>
              <h3>{selectedPlan.name}</h3>
              <p>
                Enter your basic details. We will send plan details and next
                steps to your email.
              </p>
            </div>

            <form className="plan-modal-form">
              <input
                type="hidden"
                name="planId"
                value={selectedVariantPlanId || selectedPlan.id}
              />
              <div className="plan-choice-group">
                <strong>Select plan option</strong>
                <div className="plan-choice-grid">
                  {selectedPlan.rows.map((row) => (
                    <button
                      type="button"
                      className={
                        row.planId === selectedVariantPlanId ? "active" : ""
                      }
                      key={`${row.label}-${row.planId}`}
                      onClick={() =>
                        setSelectedVariantPlanId((current) =>
                          current === row.planId ? "" : row.planId || "",
                        )
                      }
                    >
                      <span>{row.label}</span>
                      <strong>{row.price}</strong>
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={planForm.firstName}
                onChange={handlePlanInputChange}
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={planForm.lastName}
                onChange={handlePlanInputChange}
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={planForm.email}
                onChange={handlePlanInputChange}
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={planForm.phone}
                onChange={handlePlanInputChange}
              />
              <input
                type="text"
                name="referralCode"
                placeholder="Referral Code (Optional)"
                value={planForm.referralCode}
                onChange={handlePlanInputChange}
              />

              <div className="plan-choice-group">
                <strong>Select payment gateway</strong>
                <div className="plan-choice-grid">
                  {isLoadingGateways && (
                    <button type="button" className="unavailable" disabled>
                      <span>Loading payment options...</span>
                    </button>
                  )}
                  {gateways.map((gateway) => (
                    <button
                      type="button"
                      className={
                        gateway.provider === selectedGateway ? "active" : ""
                      }
                      key={gateway.provider}
                      onClick={() =>
                        setSelectedGateway((current) =>
                          current === gateway.provider ? "" : gateway.provider,
                        )
                      }
                    >
                      <span>{gateway.label}</span>
                    </button>
                  ))}
                  {!isLoadingGateways &&
                    gateways.length === 0 &&
                    selectedVariant?.paymentCurrency === "NGN" && (
                      <button type="button" className="unavailable" disabled>
                        <span>Paystack</span>
                        <small>Not available yet</small>
                      </button>
                    )}
                  {!isLoadingGateways &&
                    gateways.length === 0 &&
                    selectedVariant?.paymentCurrency !== "NGN" && (
                      <p className="plan-gateway-unavailable">
                        No payment gateway is currently available for this
                        currency.
                      </p>
                    )}
                </div>
              </div>

              {selectedVariant && (
                <div className="plan-modal-instructions">
                  <strong>Selected option</strong>
                  <p>
                    {selectedVariant.label} - {selectedVariant.price}
                    {selectedVariant.converted
                      ? ` (converted from ${selectedVariant.sourcePrice})`
                      : ""}
                  </p>
                </div>
              )}

              {modalError && (
                <div className="plan-modal-error">{modalError}</div>
              )}

              <div className="plan-modal-instructions">
                <strong>What happens next?</strong>
                <p>
                  After payment, we will create your retail enrollee account and
                  email your login details for enrollee.altuhealth.com.
                </p>
              </div>

              <button
                type="button"
                className="buy-btn"
                onClick={handleProceedToPayment}
                disabled={
                  isProcessingPayment || isLoadingGateways || gateways.length === 0
                }
              >
                {isProcessingPayment ? "Processing..." : "Proceed to Pay"}{" "}
                <span>→</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
