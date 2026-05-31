export default function Plans() {
  const plans = [
    {
      name: "Individual Plan",
      description: "Affordable healthcare for individuals.",
      price: "₦15k",
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
      price: "₦50k",
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
      price: "₦120k",
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
      price: "Custom",
      features: [
        "✔ Enterprise Solutions",
        "✔ Analytics Dashboard",
        "✔ Nationwide Access",
        "✔ Priority Support",
      ],
      link: "https://paystack.com/pay/corporate-plan",
    },
  ];

  return (
    <section className="plans" id="plans">
      <div className="container">
        <div className="section-title">
          <span>Healthcare Plans</span>
          <h2>Flexible Coverage For Everyone.</h2>
          <p>
            Explore healthcare plans tailored to individuals, families, SMEs,
            and enterprise organizations.
          </p>
        </div>

        <div className="plan-grid">
          {plans.map((plan, index) => (
            <div key={index} className="plan-card">
              <h3>{plan.name}</h3>
              <p>{plan.description}</p>

              <div className="price">{plan.price}</div>

              <ul>
                {plan.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>

              <a
                href={plan.link}
                target="_blank"
                rel="noopener noreferrer"
                className="buy-btn"
              >
                Buy Plan
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
