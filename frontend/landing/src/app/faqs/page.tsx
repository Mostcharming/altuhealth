import Footer from "@/components/Footer";
import Header from "@/components/Header";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | AltuHealth",
  description:
    "Answers to common questions about AltuHealth coverage, diaspora plans, provider access, payments, telemedicine, and support.",
};

const faqs = [
  {
    question: "What is AltuHealth?",
    answer:
      "AltuHealth is a technology-driven Health Maintenance Organization (HMO) providing affordable healthcare coverage for individuals, families, SMEs, corporates, and Nigerians in the diaspora.",
  },
  {
    question:
      "Can I buy healthcare for my parents or family in Nigeria while living abroad?",
    answer:
      "Yes. Our Diaspora Plans allow Nigerians living anywhere in the world to purchase healthcare coverage for loved ones in Nigeria.",
  },
  {
    question: "Which countries can subscribe?",
    answer:
      "Anyone living outside Nigeria can purchase a plan online for eligible beneficiaries residing in Nigeria.",
  },
  {
    question: "How do my loved ones access care?",
    answer:
      "Once enrolled, they receive their policy details and can visit any hospital within the AltuHealth provider network or contact our customer care for assistance.",
  },
  {
    question: "How long does activation take?",
    answer:
      "Most plans become active after the applicable waiting period and successful enrolment.",
  },
  {
    question: "Can I pay in foreign currency?",
    answer:
      "Yes. We support international payments for eligible diaspora customers.",
  },
  {
    question: "Which hospitals can beneficiaries use?",
    answer:
      "Beneficiaries have access to our nationwide network of accredited hospitals, pharmacies, and diagnostic centres.",
  },
  {
    question: "Can I change my hospital after registration?",
    answer:
      "Yes. Hospital changes can be requested through our customer support team, subject to our policy guidelines.",
  },
  {
    question: "Do you offer telemedicine?",
    answer:
      "Yes. Members can consult qualified healthcare professionals through our telemedicine platform 24/7.",
  },
];

export default function FaqsPage() {
  return (
    <>
      <Header />
      <main className="faq-page">
        <section className="faq-hero">
          <div className="container faq-hero-content">
            <span>AltuHealth Help Centre</span>
            <h1>FAQs</h1>
            <p>
              Find answers about healthcare coverage, diaspora plans, payments,
              provider access, and member support.
            </p>
          </div>
        </section>

        <section className="faq-section" aria-label="Frequently asked questions">
          <div className="container faq-layout">
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <details key={faq.question} className="faq-item">
                  <summary>
                    <span className="faq-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="faq-question">{faq.question}</span>
                    <span className="faq-toggle" aria-hidden="true" />
                  </summary>
                  <p>{faq.answer}</p>
                </details>
              ))}

              <details className="faq-item">
                <summary>
                  <span className="faq-number">10</span>
                  <span className="faq-question">
                    How do I contact AltuHealth?
                  </span>
                  <span className="faq-toggle" aria-hidden="true" />
                </summary>
                <p>
                  You can reach us via phone at{" "}
                  <a href="tel:+2348107599978">+234 810 759 9978</a>, email at{" "}
                  <a href="mailto:info@altuhealth.com">info@altuhealth.com</a>,
                  WhatsApp at{" "}
                  <a
                    href="https://wa.me/2348107599978"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    +234 810 759 9978
                  </a>
                  , or through the <Link href="/contact">contact form</Link> on
                  our website.
                </p>
              </details>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
