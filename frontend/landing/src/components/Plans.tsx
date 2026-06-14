"use client";

import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/lib/apiClient";

type Market = "NGN" | "GBP";

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
};

type DisplayPlan = {
  id: string;
  name: string;
  description: string;
  audience: string;
  rows: { label: string; price: string }[];
  features: string[];
  sources?: PublicPlan[];
};

type SelectedPlanPricing = {
  order: number;
  rows: { label: string; price: string }[];
};

type PlanVariantDefinition = {
  market: Market;
  group: string;
  label: string;
  order: number;
  rowOrder: number;
};

type PlansResponse = {
  data?: {
    list?: PublicPlan[];
  };
};

type IpLocation = {
  country_code?: string;
};

const selectedPlanPrices: Record<Market, Record<string, SelectedPlanPricing>> = {
  GBP: {
    "senior basic": {
      order: 1,
      rows: [
        { label: "Single Parent", price: "£25" },
        { label: "Couple", price: "£48" },
      ],
    },
    "senior standard": {
      order: 2,
      rows: [
        { label: "Single Parent", price: "£35" },
        { label: "Couple", price: "£68" },
      ],
    },
    "senior elite": {
      order: 3,
      rows: [
        { label: "Single Parent", price: "£55" },
        { label: "Couple", price: "£105" },
      ],
    },
  },
  NGN: {
    "vital basic": {
      order: 1,
      rows: [
        { label: "Individual", price: "N100,000" },
        { label: "Family", price: "N500,000" },
      ],
    },
    "vital lite": {
      order: 2,
      rows: [
        { label: "Individual", price: "N155,000" },
        { label: "Family", price: "N837,000" },
      ],
    },
    "vital groove": {
      order: 3,
      rows: [
        { label: "Individual", price: "N305,000" },
        { label: "Family", price: "N1,647,000" },
      ],
    },
    "vital plus": {
      order: 4,
      rows: [
        { label: "Individual", price: "N510,000" },
        { label: "Family", price: "N2,754,000" },
      ],
    },
    "vital max": {
      order: 5,
      rows: [
        { label: "Individual", price: "N720,000" },
        { label: "Family", price: "N3,888,000" },
      ],
    },
  },
};

const planVariantDefinitions: Record<string, PlanVariantDefinition> = {
  SENIOR_BASIC_SINGLE_PARENT: {
    market: "GBP",
    group: "senior basic",
    label: "Single Parent",
    order: 1,
    rowOrder: 1,
  },
  SENIOR_BASIC_COUPLE: {
    market: "GBP",
    group: "senior basic",
    label: "Couple",
    order: 1,
    rowOrder: 2,
  },
  SENIOR_STANDARD_SINGLE_PARENT: {
    market: "GBP",
    group: "senior standard",
    label: "Single Parent",
    order: 2,
    rowOrder: 1,
  },
  SENIOR_STANDARD_COUPLE: {
    market: "GBP",
    group: "senior standard",
    label: "Couple",
    order: 2,
    rowOrder: 2,
  },
  SENIOR_ELITE_SINGLE_PARENT: {
    market: "GBP",
    group: "senior elite",
    label: "Single Parent",
    order: 3,
    rowOrder: 1,
  },
  SENIOR_ELITE_COUPLE: {
    market: "GBP",
    group: "senior elite",
    label: "Couple",
    order: 3,
    rowOrder: 2,
  },
  VITAL_BASIC_INDIVIDUAL: {
    market: "NGN",
    group: "vital basic",
    label: "Individual",
    order: 1,
    rowOrder: 1,
  },
  VITAL_BASIC_FAMILY: {
    market: "NGN",
    group: "vital basic",
    label: "Family",
    order: 1,
    rowOrder: 2,
  },
  VITAL_LITE_INDIVIDUAL: {
    market: "NGN",
    group: "vital lite",
    label: "Individual",
    order: 2,
    rowOrder: 1,
  },
  VITAL_LITE_FAMILY: {
    market: "NGN",
    group: "vital lite",
    label: "Family",
    order: 2,
    rowOrder: 2,
  },
  VITAL_GROOVE_INDIVIDUAL: {
    market: "NGN",
    group: "vital groove",
    label: "Individual",
    order: 3,
    rowOrder: 1,
  },
  VITAL_GROOVE_FAMILY: {
    market: "NGN",
    group: "vital groove",
    label: "Family",
    order: 3,
    rowOrder: 2,
  },
  VITAL_PLUS_INDIVIDUAL: {
    market: "NGN",
    group: "vital plus",
    label: "Individual",
    order: 4,
    rowOrder: 1,
  },
  VITAL_PLUS_FAMILY: {
    market: "NGN",
    group: "vital plus",
    label: "Family",
    order: 4,
    rowOrder: 2,
  },
  VITAL_MAX_INDIVIDUAL: {
    market: "NGN",
    group: "vital max",
    label: "Individual",
    order: 5,
    rowOrder: 1,
  },
  VITAL_MAX_FAMILY: {
    market: "NGN",
    group: "vital max",
    label: "Family",
    order: 5,
    rowOrder: 2,
  },
};

const fallbackPlans: Record<Market, DisplayPlan[]> = {
  GBP: [
    "Senior Basic",
    "Senior Standard",
    "Senior Elite",
  ].map((name) => buildFallbackPlan(name, "GBP")),
  NGN: [
    "Vital Basic",
    "Vital Lite",
    "Vital Groove",
    "Vital Plus",
    "Vital Max",
  ].map((name) => buildFallbackPlan(name, "NGN")),
};

function normalizePlanName(name: string) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

function buildFallbackPlan(name: string, market: Market): DisplayPlan {
  const pricing = selectedPlanPrices[market][normalizePlanName(name)];

  return {
    id: `${market}-${normalizePlanName(name)}`,
    name,
    description: "Healthcare coverage for everyday care and managed support.",
    audience: market === "NGN" ? "Nigerian market" : "International market",
    rows: pricing.rows,
    features: [
      "Hospital access",
      "Routine checkups",
      "Digital support",
      "Telemedicine",
    ],
  };
}

function formatPlanPrice(plan: PublicPlan) {
  const amount = Number(plan.annualPremiumPrice || 0);

  if (plan.currency === "GBP") {
    return `£${amount.toLocaleString("en-GB")}`;
  }

  return `N${amount.toLocaleString("en-NG")}`;
}

function mapPublicPlans(plans: PublicPlan[], market: Market): DisplayPlan[] {
  const grouped = new Map<
    string,
    {
      definition: PlanVariantDefinition;
      plans: { plan: PublicPlan; definition: PlanVariantDefinition }[];
    }
  >();

  plans.forEach((plan) => {
    const definition = planVariantDefinitions[plan.code];
    if (!definition || definition.market !== market) {
      return;
    }

    const existing = grouped.get(definition.group);
    if (existing) {
      existing.plans.push({ plan, definition });
    } else {
      grouped.set(definition.group, {
        definition,
        plans: [{ plan, definition }],
      });
    }
  });

  return Array.from(grouped.entries())
    .map(([group, item]) => {
      const orderedPlans = item.plans.sort(
        (a, b) => a.definition.rowOrder - b.definition.rowOrder,
      );
      const firstPlan = orderedPlans[0]?.plan;

      return {
        id: group,
        name: firstPlan?.name || group,
        description:
          firstPlan?.description ||
          "Healthcare coverage for everyday care and managed support.",
        audience: market === "NGN" ? "Nigerian market" : "International market",
        rows: orderedPlans.map(({ plan, definition }) => ({
          label: definition.label,
          price: formatPlanPrice(plan),
        })),
        features: [
          firstPlan?.planCycle
            ? `${firstPlan.planCycle} coverage cycle`
            : "Annual coverage",
          "Managed care access",
          "Digital support",
          "More benefits",
        ],
        sources: orderedPlans.map(({ plan }) => plan),
      };
    })
    .sort((a, b) => {
      const planA = selectedPlanPrices[market][normalizePlanName(a.name)];
      const planB = selectedPlanPrices[market][normalizePlanName(b.name)];

      return planA.order - planB.order;
    });
}

export default function Plans() {
  const [market, setMarket] = useState<Market>("GBP");
  const [backendPlans, setBackendPlans] = useState<PublicPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<DisplayPlan | null>(null);
  const [planForm, setPlanForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    referralCode: "",
  });

  useEffect(() => {
    let isMounted = true;

    const detectMarket = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        if (!response.ok) {
          throw new Error("Unable to detect user location");
        }

        const location = (await response.json()) as IpLocation;
        if (isMounted) {
          setMarket(location.country_code === "NG" ? "NGN" : "GBP");
        }
      } catch {
        if (isMounted) {
          setMarket("GBP");
        }
      }
    };

    detectMarket();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchPlans = async () => {
      try {
        const payload = (await apiClient("/public/plans")) as PlansResponse;
        if (isMounted) {
          setBackendPlans(payload.data?.list || []);
        }
      } catch {
        if (isMounted) {
          setBackendPlans([]);
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

  const plans = useMemo(() => {
    const selected = mapPublicPlans(backendPlans, market);

    return selected.length > 0 ? selected : fallbackPlans[market];
  }, [backendPlans, market]);

  const handlePlanInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setPlanForm((prev) => ({ ...prev, [name]: value }));
  };

  const closePlanModal = () => {
    setSelectedPlan(null);
    setPlanForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      referralCode: "",
    });
  };

  return (
    <section className="plans" id="plans">
      <div className="container">
        <div className="section-title">
          <span>Our Plans</span>
          <h2>Choose A Health Plan That Fits Your Needs.</h2>
          <p>
            Explore selected healthcare plans tailored to your market.
          </p>
        </div>

        <div className="plan-market-toggle" aria-label="Plan market selector">
          <button
            type="button"
            className={market === "NGN" ? "active" : ""}
            onClick={() => setMarket("NGN")}
          >
            Nigeria
          </button>
          <button
            type="button"
            className={market === "GBP" ? "active" : ""}
            onClick={() => setMarket("GBP")}
          >
            International
          </button>
        </div>

        <div className="plan-grid">
          {plans.map((plan) => (
            <div key={plan.id} className="plan-card">
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
                  <div className="plan-price-row" key={row.label}>
                    <span>{row.label}</span>
                    <strong>{row.price}</strong>
                  </div>
                ))}
                <p>{market === "NGN" ? "per year" : "per month"}</p>
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
                  onClick={() => setSelectedPlan(plan)}
                  disabled={isLoadingPlans}
                >
                  {isLoadingPlans ? "Loading" : "Register"} <span>→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

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
                value={
                  selectedPlan.sources?.map((plan) => plan.id).join(",") ||
                  selectedPlan.id
                }
              />
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

              <div className="plan-modal-instructions">
                <strong>What happens next?</strong>
                <p>
                  You will receive plan details via email. Review the details,
                  then proceed to payment when ready.
                </p>
              </div>

              <button type="button" className="buy-btn">
                Proceed to Pay <span>→</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
