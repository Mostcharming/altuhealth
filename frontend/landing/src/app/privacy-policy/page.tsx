import Footer from "@/components/Footer";
import Header from "@/components/Header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | AltuHealth",
  description:
    "Learn how AltuHealth collects, uses, shares, protects, retains, and deletes personal and health information.",
  alternates: {
    canonical: "https://altuhealth.com/privacy-policy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const policySections = [
  { id: "scope", label: "Scope" },
  { id: "information-we-collect", label: "Information we collect" },
  { id: "how-we-use-information", label: "How we use information" },
  { id: "how-we-share-information", label: "How we share information" },
  { id: "permissions-and-device-features", label: "Device features" },
  { id: "security", label: "Security" },
  { id: "retention", label: "Retention" },
  { id: "account-deletion", label: "Account deletion" },
  { id: "your-rights", label: "Your rights" },
  { id: "contact-us", label: "Contact us" },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="privacy-page">
        <section className="privacy-hero" aria-labelledby="privacy-title">
          <div className="container privacy-hero-inner">
            <p className="privacy-eyebrow">Your information. Your care.</p>
            <h1 id="privacy-title">Privacy Policy</h1>
            <p className="privacy-intro">
              This policy explains how AltuHealth handles personal and
              sensitive information when you use our healthcare services,
              website, member portals, and the Altuhealth mobile application.
            </p>
            <div className="privacy-meta" aria-label="Policy dates">
              <span>Effective: 25 August 2026</span>
              <span>Last updated: 25 August 2026</span>
            </div>
          </div>
        </section>

        <div className="container privacy-layout">
          <aside className="privacy-navigation" aria-label="Privacy policy contents">
            <p>On this page</p>
            <nav>
              {policySections.map((section) => (
                <a key={section.id} href={`#${section.id}`}>
                  {section.label}
                </a>
              ))}
            </nav>
          </aside>

          <article className="privacy-content">
            <div className="privacy-summary">
              <strong>At a glance</strong>
              <p>
                We use information to provide healthcare coverage and related
                services. We do not sell personal or health information, and
                we do not use it for third-party advertising.
              </p>
            </div>

            <section id="scope">
              <h2>1. Who we are and the scope of this policy</h2>
              <p>
                AltuHealth (&quot;AltuHealth&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates
                the Altuhealth mobile application, including the Android
                application with package name <strong>com.mostcharming.altuhealth</strong>,
                and our related website, healthcare coverage, member, support,
                payment, provider-network, and telemedicine services
                (collectively, the &quot;Services&quot;).
              </p>
              <p>
                This policy applies to information we handle through the
                Services. It also applies when an employer, plan sponsor,
                parent, guardian, or primary enrollee provides information to
                enrol another person or dependent.
              </p>
            </section>

            <section id="information-we-collect">
              <h2>2. Information we access or collect</h2>
              <p>
                The information we collect depends on the Services you use and
                may include:
              </p>
              <ul>
                <li>
                  <strong>Identity and contact information:</strong> name,
                  email address, phone number, date of birth, gender,
                  occupation, marital status, residential address, state, local
                  government area, country, profile photograph, and next-of-kin
                  or dependent details.
                </li>
                <li>
                  <strong>Account and coverage information:</strong> policy
                  number, account credentials, verification information,
                  employer or plan-sponsor details, selected plan, benefits,
                  eligibility, enrolment status, dependent relationships,
                  subscription dates, preferences, and account activity.
                </li>
                <li>
                  <strong>Health and medical information:</strong> pre-existing
                  conditions, symptoms or complaints, diagnoses, treatments,
                  prescriptions, medical history, provider visits, appointment
                  information, authorisations, claims, clinical notes,
                  attachments, service dates, and care-related communications.
                  If you choose to use women&apos;s health features, this also
                  includes period dates, cycle length, period duration,
                  predictions, and notes you enter.
                </li>
                <li>
                  <strong>Payment and transaction information:</strong> plan
                  price, currency, payment status, payment method, transaction
                  references, subscription and invoice history, and limited
                  details returned by a payment provider. Card or bank-account
                  details entered on a payment provider&apos;s checkout page are
                  handled by that provider; AltuHealth does not store complete
                  payment-card numbers or security codes.
                </li>
                <li>
                  <strong>Communications:</strong> support requests, messages,
                  feedback, call or email correspondence, appointment requests,
                  and other information you send to us or to participating
                  healthcare providers through the Services.
                </li>
                <li>
                  <strong>Device, network, and usage information:</strong> IP
                  address, approximate country derived from an IP address,
                  browser or device type, operating system, app version,
                  timestamps, requested pages or features, diagnostic logs,
                  and security events. We use this information to operate,
                  secure, troubleshoot, and tailor the Services, including
                  showing plans appropriate to a visitor&apos;s country.
                </li>
              </ul>
              <p>
                We receive information directly from you, from an authorised
                primary enrollee, parent, guardian, employer or plan sponsor,
                from healthcare providers involved in your care, from payment
                and service providers, and automatically when you use the
                Services.
              </p>
            </section>

            <section id="how-we-use-information">
              <h2>3. How we use information</h2>
              <p>We use information where necessary to:</p>
              <ul>
                <li>
                  create and administer accounts, confirm identity, determine
                  eligibility, issue policy details, and manage healthcare
                  coverage and benefits;
                </li>
                <li>
                  arrange care, appointments, provider access, telemedicine,
                  authorisations, claims, prescriptions, and care coordination;
                </li>
                <li>
                  maintain medical and service history and provide optional
                  health-tracking features selected by the user;
                </li>
                <li>
                  process subscriptions and payments, prevent duplicate or
                  fraudulent transactions, and maintain financial records;
                </li>
                <li>
                  send requested service, verification, security, appointment,
                  dependent-visit, payment, renewal, and support communications;
                </li>
                <li>
                  respond to enquiries, resolve complaints, improve service
                  reliability, troubleshoot errors, and protect users, providers,
                  our systems, and the public from misuse or fraud; and
                </li>
                <li>
                  meet legal, regulatory, audit, reporting, and public-health
                  obligations and establish, exercise, or defend legal claims.
                </li>
              </ul>
              <p>
                Depending on the circumstances and applicable law, we rely on
                performance of our agreement with you, your consent, compliance
                with legal obligations, protection of vital interests, and our
                legitimate interests in operating secure and effective
                healthcare Services. Where consent is required, you may withdraw
                it, but this will not affect processing already carried out.
              </p>
            </section>

            <section id="how-we-share-information">
              <h2>4. How and with whom we share information</h2>
              <p>
                We disclose only the information reasonably necessary for the
                relevant purpose. Recipients may include:
              </p>
              <ul>
                <li>
                  <strong>Healthcare participants:</strong> hospitals, clinics,
                  doctors, pharmacies, laboratories, diagnostic centres,
                  telemedicine partners, claims reviewers, and other providers
                  involved in eligibility checks, care, payment, or claims.
                </li>
                <li>
                  <strong>People responsible for your coverage:</strong> an
                  authorised primary enrollee, parent or guardian, employer, or
                  plan sponsor. We limit health-detail disclosures to what is
                  authorised or necessary for coverage administration and
                  applicable law.
                </li>
                <li>
                  <strong>Service providers:</strong> vendors that support
                  hosting, data storage, security, customer support, email, SMS,
                  payments, identity or account verification, document or image
                  storage, and technical operations. They may process
                  information only to provide contracted services and subject
                  to appropriate confidentiality and security duties.
                </li>
                <li>
                  <strong>Authorities and professional advisers:</strong>
                  regulators, law-enforcement bodies, courts, auditors, lawyers,
                  insurers, or other parties where disclosure is required by
                  law or reasonably necessary to protect rights, safety,
                  security, and the integrity of the Services.
                </li>
                <li>
                  <strong>Business transfers:</strong> a successor or relevant
                  adviser in connection with a proposed or completed merger,
                  financing, reorganisation, or transfer of all or part of our
                  operations, subject to confidentiality and applicable law.
                </li>
              </ul>
              <p>
                We may also share information when you direct us to or give us
                permission. We may use aggregated or de-identified information
                that cannot reasonably identify you for reporting, service
                planning, and analytics. We do not sell or rent personal or
                sensitive health information, and we do not share it for
                third-party behavioural advertising.
              </p>
            </section>

            <section id="permissions-and-device-features">
              <h2>5. App permissions and device features</h2>
              <ul>
                <li>
                  <strong>Photos and media:</strong> the app requests access
                  only when you choose to select a profile or dependent image.
                  We receive the image you select, not your entire photo library.
                  You can decline or revoke this permission in device settings.
                </li>
                <li>
                  <strong>Biometric authentication:</strong> if you enable
                  fingerprint or facial sign-in, authentication is performed by
                  your device. AltuHealth does not receive or store your
                  fingerprint, face image, or biometric template; the app
                  receives only the device&apos;s authentication result and keeps
                  the related sign-in information in secure device storage.
                </li>
                <li>
                  <strong>Camera and microphone on linked services:</strong>
                  a telemedicine provider opened from the app may separately
                  request camera or microphone access for a consultation. That
                  request and the consultation provider&apos;s handling of the data
                  are explained at the point of use and may also be governed by
                  the provider&apos;s privacy policy.
                </li>
              </ul>
              <p>
                The Altuhealth app does not request access to your contacts,
                call logs, SMS messages, or background location. If these
                practices change, we will update this policy and provide any
                disclosure or consent required before access begins.
              </p>
            </section>

            <section id="security">
              <h2>6. How we protect information</h2>
              <p>
                We use administrative, technical, and physical safeguards
                designed for the sensitivity of healthcare information. These
                include encrypted network connections, password hashing,
                authentication and access controls, secure device storage for
                app sessions, role-based access, logging and monitoring,
                backups, and confidentiality obligations for personnel and
                service providers. Access is limited to people and systems with
                a legitimate need.
              </p>
              <p>
                No storage or transmission method can be guaranteed to be
                completely secure. Please use a strong, unique password, protect
                your device, and contact us immediately if you suspect
                unauthorised access to your account.
              </p>
            </section>

            <section id="retention">
              <h2>7. Data retention</h2>
              <p>
                We keep account and service information while your account or
                coverage is active and for as long afterward as reasonably
                necessary to deliver the Services, resolve disputes, enforce
                agreements, maintain security, and satisfy legal, medical,
                insurance, tax, audit, and regulatory obligations. Retention
                periods vary by record type and the reason it was collected.
              </p>
              <p>
                When information is no longer required, we delete it, securely
                dispose of it, or anonymise it so it can no longer reasonably be
                linked to you. Deleted information may remain for a limited time
                in protected backups until those backups are overwritten in the
                ordinary cycle. Records that must be retained by law are kept
                only for the required period and are not used for unrelated
                purposes.
              </p>
            </section>

            <section id="account-deletion">
              <h2>8. Account and data deletion</h2>
              <p>
                You may request deletion of your Altuhealth account and
                associated data at any time by emailing us from the address
                linked to your account. Use the subject &quot;AltuHealth account
                deletion request&quot; and include your full name and policy number
                so we can locate and verify the account. Do not send your
                password or medical details by email.
              </p>
              <a
                className="privacy-action"
                href="mailto:support@altuhealth.com?subject=AltuHealth%20account%20deletion%20request"
              >
                Request account deletion
              </a>
              <p>
                After verifying the request, we will delete or anonymise the
                account and information that is not required for a lawful
                reason. Some medical, claims, transaction, fraud-prevention, or
                regulatory records may need to be retained for the applicable
                legal period. We will restrict retained information to that
                purpose and tell you if this affects your request. Deactivating
                an account is not treated as a completed deletion request.
              </p>
            </section>

            <section id="your-rights">
              <h2>9. Your choices and privacy rights</h2>
              <p>
                Subject to applicable law, you may ask to access, correct,
                update, obtain a copy of, restrict, object to the processing of,
                or delete your personal information. You may also withdraw
                consent and complain to the relevant data-protection authority.
                We may need to verify your identity or authority before acting
                on a request.
              </p>
              <p>
                You can update certain profile information and notification
                preferences in the app. Device permissions can be changed in
                your device settings. You may opt out of non-essential
                communications using the method in the message or by contacting
                us; service and security messages may still be sent while your
                account remains active.
              </p>
            </section>

            <section id="children-and-dependents">
              <h2>10. Children and dependents</h2>
              <p>
                The Services are not intended for children to create or manage
                accounts independently. A parent, guardian, authorised primary
                enrollee, employer, or plan sponsor may provide a child&apos;s or
                dependent&apos;s information where needed to arrange healthcare
                coverage or care. The person providing that information must
                have authority to do so. We handle dependent information with
                the same safeguards described in this policy.
              </p>
            </section>

            <section id="international-transfers">
              <h2>11. International data transfers</h2>
              <p>
                Some service providers may process information outside your
                state or country. Where information is transferred, we use
                contractual, organisational, and technical measures designed to
                provide an appropriate level of protection in accordance with
                applicable law.
              </p>
            </section>

            <section id="third-party-services">
              <h2>12. Third-party services and links</h2>
              <p>
                The Services may open provider, telemedicine, payment, or other
                third-party websites. Their own privacy policies apply when you
                interact directly with them. We encourage you to review those
                policies before providing information. This policy does not
                govern services that AltuHealth does not control.
              </p>
            </section>

            <section id="policy-changes">
              <h2>13. Changes to this policy</h2>
              <p>
                We may update this policy to reflect changes to the Services,
                our data practices, or legal requirements. We will publish the
                updated version at this URL and change the &quot;Last updated&quot; date.
                If a change materially affects your rights, we will provide
                additional notice where required.
              </p>
            </section>

            <section id="contact-us">
              <h2>14. Contact us</h2>
              <p>
                For privacy questions, complaints, requests, or concerns about
                this policy or our handling of your information, contact:
              </p>
              <address className="privacy-contact-card">
                <strong>AltuHealth Privacy Team</strong>
                <a href="mailto:support@altuhealth.com">
                  support@altuhealth.com
                </a>
                <a href="tel:+2348107599978">+234 810 759 9978</a>
                <span>
                  AltuHealth Place, 4 Irewole Street, Opp. New Apostolic
                  Church, Opebi, Ikeja, Lagos, Nigeria
                </span>
              </address>
            </section>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
