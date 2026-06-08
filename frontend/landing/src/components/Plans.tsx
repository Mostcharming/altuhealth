"use client";

import Link from "next/link";
import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";

const plans = [
  {
    name: "Individual Plan",
    description: "Affordable healthcare for individuals.",
    audience: "0-65 years of age",
    billing: "per individual, per year",
    priceNgn: "₦15k",
    priceUsd: "$10",
    features: [
      "✔ Hospital Access",
      "✔ Routine Checkups",
      "✔ Digital Support",
      "✔ Telemedicine",
    ],
    link: "https://paystack.com/pay/individual-plan",
  },
  {
    name: "Family Plan",
    description: "Comprehensive family healthcare.",
    audience: "Household coverage",
    billing: "per family, per year",
    priceNgn: "₦50k",
    priceUsd: "$35",
    features: [
      "✔ Family Coverage",
      "✔ Emergency Support",
      "✔ Child Healthcare",
      "✔ Telemedicine",
    ],
    link: "https://paystack.com/pay/family-plan",
  },
  {
    name: "SME Plan",
    description: "Healthcare for growing businesses.",
    audience: "Teams and growing businesses",
    billing: "per team, per year",
    priceNgn: "₦120k",
    priceUsd: "$80",
    features: [
      "✔ Staff Coverage",
      "✔ Digital Claims",
      "✔ Wellness Support",
      "✔ Dedicated Support",
    ],
    link: "https://paystack.com/pay/sme-plan",
  },
  {
    name: "Corporate Plan",
    description: "Enterprise healthcare management.",
    audience: "Custom workforce coverage",
    billing: "tailored to your organization",
    priceNgn: "Custom",
    priceUsd: "Custom",
    features: [
      "✔ Enterprise Solutions",
      "✔ Analytics Dashboard",
      "✔ Nationwide Access",
      "✔ Priority Support",
    ],
    link: "https://paystack.com/pay/corporate-plan",
  },
];

type IpLocation = {
  country_code?: string;
};

export default function Plans() {
  const [currency, setCurrency] = useState<"NGN" | "USD">("USD");
  const [selectedPlan, setSelectedPlan] = useState<(typeof plans)[number] | null>(
    null,
  );
  const [planForm, setPlanForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    let isMounted = true;

    const detectCurrency = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        if (!response.ok) {
          throw new Error("Unable to detect user location");
        }

        const location = (await response.json()) as IpLocation;
        if (!isMounted) {
          return;
        }

        setCurrency(location.country_code === "NG" ? "NGN" : "USD");
      } catch {
        if (isMounted) {
          setCurrency("USD");
        }
      }
    };

    detectCurrency();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatPrice = (price: string) => {
    if (price === "Custom") {
      return { symbol: "", amount: "Custom", code: "" };
    }

    if (price.startsWith("₦")) {
      return { symbol: "₦", amount: price.replace("₦", ""), code: "NGN" };
    }

    return { symbol: "$", amount: price.replace("$", ""), code: "USD" };
  };

  const handlePlanInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setPlanForm((prev) => ({ ...prev, [name]: value }));
  };

  const closePlanModal = () => {
    setSelectedPlan(null);
    setPlanForm({ firstName: "", lastName: "", email: "", phone: "" });
  };

  return (
    <section className="plans" id="plans">
      <div className="container">
        <div className="section-title">
          <span>Our Plans</span>
          <h2>Choose A Health Plan That Fits Your Needs.</h2>
          <p>
            Explore healthcare plans tailored to individuals, families, SMEs,
            and enterprise organizations.
          </p>
        </div>

        <div className="plan-grid">
          {plans.map((plan, index) => (
            <div key={index} className="plan-card">
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
                {(() => {
                  const price = formatPrice(
                    currency === "NGN" ? plan.priceNgn : plan.priceUsd,
                  );

                  return (
                    <>
                      <div className="price">
                        {price.symbol && <span>{price.symbol}</span>}
                        <strong>{price.amount}</strong>
                        {price.code && <em>{price.code}</em>}
                      </div>
                      <p>{plan.billing}</p>
                    </>
                  );
                })()}
              </div>

              <div className="plan-divider"></div>

              <div className="plan-content">
                <ul>
                  {plan.features.map((feature, idx) => (
                    <li key={idx}>
                      <span className="plan-check">✓</span>
                      <span>{feature.replace("✔ ", "")}</span>
                    </li>
                  ))}
                  <li className="more-benefits">
                    <span className="plan-check">+</span>
                    <span>More Benefits</span>
                  </li>
                </ul>

                {plan.priceNgn === "Custom" ? (
                  <Link href="/contact" className="buy-btn">
                    Contact Us <span>→</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="buy-btn"
                    onClick={() => setSelectedPlan(plan)}
                  >
                    Register <span>→</span>
                  </button>
                )}
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
