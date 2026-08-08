import Footer from "@/components/Footer";
import Header from "@/components/Header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diaspora Healthcare Plans | AltuHealth",
  description:
    "Purchase trusted healthcare coverage for parents, spouses, children, and relatives living in Nigeria from anywhere in the world.",
};

const diasporaBenefits = [
  "Buy healthcare coverage from anywhere in the world",
  "Your loved ones receive care at accredited hospitals across Nigeria",
  "24/7 Telemedicine access",
  "Digital enrolment with instant confirmation",
  "No need to send money whenever someone falls ill",
  "Dedicated customer support",
];

export default function DiasporaPage() {
  return (
    <>
      <Header />
      <main className="diaspora-page">
        <section className="diaspora-hero">
          <div className="container diaspora-hero-grid">
            <div className="diaspora-hero-copy">
              <p className="diaspora-eyebrow">Healthcare Without Borders</p>
              <h1>Caring for Your Family from Anywhere in the World</h1>
              <p className="diaspora-intro">
                Living abroad doesn&apos;t mean you can&apos;t protect your loved
                ones in Nigeria.
              </p>
              <p>
                With AltuHealth Diaspora Plans, Nigerians living in the UK,
                USA, Canada, Europe, the Middle East, and across the world can
                conveniently purchase healthcare coverage for parents,
                spouses, children, and relatives back home.
              </p>
            </div>

            <div className="diaspora-globe" aria-hidden="true">
              <span className="diaspora-orbit diaspora-orbit-one" />
              <span className="diaspora-orbit diaspora-orbit-two" />
              <span className="diaspora-globe-core">NG</span>
              <span className="diaspora-location diaspora-location-uk">UK</span>
              <span className="diaspora-location diaspora-location-us">USA</span>
              <span className="diaspora-location diaspora-location-ca">CA</span>
              <span className="diaspora-location diaspora-location-eu">EU</span>
              <span className="diaspora-location diaspora-location-me">ME</span>
            </div>
          </div>
        </section>

        <section className="diaspora-benefits">
          <div className="container">
            <div className="diaspora-section-heading">
              <span>AltuHealth Diaspora Plans</span>
              <h2>Why Choose Our Diaspora Plans?</h2>
            </div>

            <ul className="diaspora-benefit-grid">
              {diasporaBenefits.map((benefit) => (
                <li key={benefit}>
                  <span aria-hidden="true">✓</span>
                  <p>{benefit}</p>
                </li>
              ))}
            </ul>

            <div className="diaspora-assurance">
              <p>
                Give your loved ones peace of mind while you enjoy yours.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
