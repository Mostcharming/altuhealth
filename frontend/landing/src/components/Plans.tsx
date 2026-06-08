"use client";

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

                <a
                  href={plan.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="buy-btn"
                >
                  Register <span>→</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
