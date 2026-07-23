import Footer from "@/components/Footer";
import Header from "@/components/Header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Global Partnership Program | AltuHealth",
  description:
    "Join the AltuHealth Global Partnership Program, refer active healthcare subscribers, and earn a recurring 5% commission.",
};

const enhancements = [
  {
    title: "Streamlined Structure",
    description:
      "Clear calculations and visual explanations make the earning model easy to understand.",
  },
  {
    title: "Enhanced Incentives",
    description:
      "Retention rewards, annual recognition, and digital tools help partners stay engaged.",
  },
  {
    title: "Compliance Fortification",
    description:
      "Audit trails, ethical guidelines, and annual reviews support a transparent program.",
  },
  {
    title: "Scalability Focus",
    description:
      "A diaspora-ready model connects foreign-exchange earning potential with family protection.",
  },
  {
    title: "Brand Alignment",
    description:
      "Every partnership supports a wider mission to safeguard lives and transform communities.",
  },
];

const partnerFeatures = [
  "Commission remains payable for as long as the referred subscription stays active.",
  "Unlimited personal referrals, with higher-value plans generating higher commission amounts.",
  "A dedicated dashboard for real-time referral, subscription, and payment visibility.",
  "Annual recognition and additional rewards for the five most outstanding partners.",
  "Monthly team webinars and access to versatile partner dashboards.",
  "Simple product materials, online tutorials, and support from the marketing and onboarding team.",
  "The option to hand prospective subscribers over to the AltuHealth marketing and onboarding team.",
  "A referral toolkit with custom links, email templates, and WhatsApp support tools.",
  "A flexible path to build a business or career through recurring and freelance income.",
];

const safeguards = [
  {
    title: "No entry barriers",
    description:
      "There are no joining fees. Verified partners can begin earning from genuine subscriptions from day one.",
  },
  {
    title: "Value-tied earnings",
    description:
      "Commissions come exclusively from subscription revenue—not recruitment, membership, or pyramid fees.",
  },
  {
    title: "Transparency controls",
    description:
      "The partner payout is fixed at 5%, with annual third-party accounting review built into the strategy.",
  },
  {
    title: "Ethical guardrails",
    description:
      "Mandatory fair-claims training and anti-churn policies, including safeguards against subscriber poaching.",
  },
  {
    title: "Auditable referrals",
    description:
      "Blockchain-tracked referrals and annual compliance certification are included as program accountability enhancements.",
  },
];

const partnerSteps = [
  {
    number: "01",
    title: "Register",
    description:
      "Sign up through the AltuHealth referral portal and provide the required partner information.",
  },
  {
    number: "02",
    title: "Get verified",
    description:
      "AltuHealth verifies the application and activates the partner account.",
  },
  {
    number: "03",
    title: "Receive your referral link",
    description:
      "Use your unique link across personal referrals and approved marketing campaigns.",
  },
  {
    number: "04",
    title: "Track and earn",
    description:
      "Monitor active subscriptions and receive 5% of each active referral's monthly payment.",
  },
];

export default function PartnershipProgramPage() {
  return (
    <>
      <Header />

      <main className="partnership-page">
        <section className="partnership-hero">
          <div className="container partnership-hero-grid">
            <div>
              <div className="badge">AltuHealth Global Partnership Program</div>
              <h1>Earn in foreign exchange. Safeguard lives. Build legacies.</h1>
              <p>
                A unified Introducing Broker and compensation strategy that
                rewards personal sales with recurring income while expanding
                access to genuine healthcare coverage for Nigerians.
              </p>
              <div className="partnership-hero-actions">
                <a
                  className="btn btn-primary"
                  href="https://referral.altuhealth.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Sign Up as a Partner
                </a>
                <a className="btn btn-outline" href="#how-it-works">
                  See How It Works
                </a>
              </div>
            </div>

            <aside className="partnership-hero-card">
              <span>Transparent earning model</span>
              <strong>5%</strong>
              <h2>of every active referral&apos;s monthly payment</h2>
              <p>
                Earn for the lifetime of the subscription, provided the
                referred subscriber remains active and paid.
              </p>
              <ul>
                <li>Zero joining fees</li>
                <li>Unlimited personal referrals</li>
                <li>Real-time dashboard tracking</li>
              </ul>
            </aside>
          </div>
        </section>

        <section className="partnership-overview">
          <div className="container">
            <div className="partnership-section-heading">
              <span>Executive Summary</span>
              <h2>A scalable partnership engine built around real care.</h2>
              <p>
                AltuHealth combines a high-velocity, performance-driven
                Introducing Broker model with a structured, team-oriented
                leadership progression strategy. Partners can build recurring
                income through personal subscriptions while contributing to a
                global health campaign focused on Nigerians.
              </p>
              <p>
                AltuHealth&apos;s tiered monthly HMO subscriptions provide
                comprehensive coverage in Nigeria, including telemedicine,
                hospital access, and family add-ons. The program is designed
                especially for diaspora users who want affordable healthcare
                protection for family and friends at home.
              </p>
            </div>

            <div className="partnership-compliance-banner">
              <strong>Simple, genuine, and subscription-backed.</strong>
              <p>
                All earnings are tied exclusively to active, paid HMO
                subscriptions. There are no recruitment fees and no
                recruitment-based compensation.
              </p>
            </div>

            <div className="program-enhancement-grid">
              {enhancements.map((enhancement, index) => (
                <article key={enhancement.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{enhancement.title}</h3>
                  <p>{enhancement.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="partnership-process">
          <div className="container">
            <div className="partnership-section-heading partnership-heading-centered">
              <span>Compensation Scheme &amp; Process</span>
              <h2>Four clear steps from registration to recurring income.</h2>
              <p>
                Every verified partner receives a unique referral link for
                personal referrals and approved marketing campaigns.
              </p>
            </div>

            <div className="partnership-step-grid">
              {partnerSteps.map((step) => (
                <article key={step.number}>
                  <span>{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>

            <div className="commission-table-wrap">
              <table className="commission-table">
                <caption>Partner compensation at a glance</caption>
                <thead>
                  <tr>
                    <th>Compensation element</th>
                    <th>Partner benefit</th>
                    <th>Condition</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Personal referral commission</td>
                    <td>5% of the subscriber&apos;s monthly payment</td>
                    <td>Subscription must remain active and paid</td>
                  </tr>
                  <tr>
                    <td>Referral volume</td>
                    <td>Unlimited personal referrals</td>
                    <td>Every subscriber must purchase genuine HMO coverage</td>
                  </tr>
                  <tr>
                    <td>Payment duration</td>
                    <td>Lifetime of the active subscription</td>
                    <td>Commission stops if the subscription becomes inactive</td>
                  </tr>
                  <tr>
                    <td>Annual recognition</td>
                    <td>Additional rewards for the top five partners</td>
                    <td>Based on verified annual performance</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="partnership-benefits">
          <div className="container partnership-benefits-grid">
            <div className="partnership-section-heading">
              <span>Partner Features</span>
              <h2>Tools, visibility, and support to grow with confidence.</h2>
              <p>
                Partners receive practical resources and direct operational
                support—not just a referral link.
              </p>
            </div>

            <ul className="partner-feature-list">
              {partnerFeatures.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="partnership-safeguards">
          <div className="container">
            <div className="partnership-section-heading partnership-heading-centered">
              <span>Additional Features</span>
              <h2>Designed for transparency, ethics, and long-term trust.</h2>
            </div>

            <div className="safeguard-grid">
              {safeguards.map((safeguard) => (
                <article key={safeguard.title}>
                  <h3>{safeguard.title}</h3>
                  <p>{safeguard.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="partnership-positioning">
          <div className="container partnership-positioning-grid">
            <div>
              <span>For Individuals</span>
              <blockquote>
                “Turn your network into lifetime income—while securing your
                loved ones&apos; health.”
              </blockquote>
            </div>
            <div>
              <span>For Teams</span>
              <blockquote>
                “Lead a movement: Multiply earnings, deliver care, transform
                communities.”
              </blockquote>
            </div>
          </div>
        </section>

        <section className="partnership-final-cta">
          <div className="container">
            <div className="partnership-final-cta-card">
              <span>Build income. Expand healthcare access.</span>
              <h2>Join a global health campaign focused on Nigerians.</h2>
              <p>
                Start your AltuHealth partnership journey today and turn every
                genuine healthcare referral into lasting value.
              </p>
              <a
                className="btn btn-white"
                href="https://referral.altuhealth.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Register on the Partner Portal
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
