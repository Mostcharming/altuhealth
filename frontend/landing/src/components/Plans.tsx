"use client";

import { useEffect, useState } from "react";

const plans = [
  {
    name: "Individual Plan",
    description: "Affordable healthcare for individuals.",
    image: "/images/cards/card-01.jpg",
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
    image: "/images/cards/card-02.jpg",
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
    image: "/images/cards/card-03.jpg",
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
    image: "/images/product/product-01.jpg",
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
              <div className="plan-image">
                <img src={plan.image} alt={`${plan.name} healthcare plan`} />
              </div>

              <div className="plan-content">
                <h3>{plan.name}</h3>
                <p>{plan.description}</p>

                <div className="price">
                  {currency === "NGN" ? plan.priceNgn : plan.priceUsd}
                </div>

                <ul>
                  {plan.features.map((feature, idx) => (
                    <li key={idx}>{feature.replace("✔ ", "")}</li>
                  ))}
                </ul>

                <a
                  href={plan.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="buy-btn"
                >
                  View Plan Details
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
