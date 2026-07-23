import Link from "next/link";

const partnerSteps = [
  {
    number: "01",
    title: "Join and get verified",
    description:
      "Complete the partner registration and verification process at no cost.",
  },
  {
    number: "02",
    title: "Share your unique link",
    description:
      "Use your personal referral link and ready-to-use marketing resources.",
  },
  {
    number: "03",
    title: "Earn recurring commission",
    description:
      "Receive 5% of every active referral's monthly subscription payment.",
  },
];

export default function PartnershipProgram() {
  return (
    <section id="partnership" className="partnership-preview">
      <div className="container partnership-preview-grid">
        <div className="partnership-preview-copy">
          <span className="partnership-kicker">
            AltuHealth Global Partnership Program
          </span>
          <h2>Earn in foreign exchange. Safeguard lives. Build legacies.</h2>
          <p>
            Turn your network into recurring income while helping Nigerians
            access dependable healthcare coverage for their loved ones at home.
            There are no joining fees or recruitment-based earnings—every
            commission comes from an active, paid HMO subscription.
          </p>

          <div className="partnership-highlights">
            <div>
              <strong>5%</strong>
              <span>Monthly commission</span>
            </div>
            <div>
              <strong>₦0</strong>
              <span>Joining fee</span>
            </div>
            <div>
              <strong>Lifetime</strong>
              <span>While referrals stay active</span>
            </div>
          </div>

          <div className="partnership-actions">
            <a
              className="btn btn-white"
              href="https://referral.altuhealth.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Become a Partner
            </a>
            <Link className="btn partnership-learn-more" href="/partnership-program">
              Explore the Program
            </Link>
          </div>
        </div>

        <div className="partnership-path-card">
          <span>How it works</span>
          <h3>Start earning from genuine healthcare subscriptions.</h3>
          <ol>
            {partnerSteps.map((step) => (
              <li key={step.number}>
                <strong>{step.number}</strong>
                <div>
                  <h4>{step.title}</h4>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="partnership-assurance">
            Transparent tracking, practical sales tools, and support from the
            AltuHealth marketing and onboarding team.
          </p>
        </div>
      </div>
    </section>
  );
}
