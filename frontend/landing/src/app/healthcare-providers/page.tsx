"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useMemo, useState } from "react";

type Provider = {
  name: string;
  type: string;
  address: string;
  phone: string;
  hours: string;
};

type LgaProviders = Record<string, Provider[]>;

const providersByState: Record<string, LgaProviders> = {
  Lagos: {
    Ikeja: [
      {
        name: "AltuHealth Partner Clinic Ikeja",
        type: "General Hospital",
        address: "12 Medical Road, Ikeja, Lagos",
        phone: "+234 810 759 9978",
        hours: "24 hours",
      },
      {
        name: "Opebi Family Medical Centre",
        type: "Primary Care",
        address: "4 Irewole Street, Opebi, Ikeja",
        phone: "+234 906 123 4567",
        hours: "Mon - Sat, 8am - 6pm",
      },
    ],
    "Lagos Mainland": [
      {
        name: "Mainland Specialist Hospital",
        type: "Specialist Hospital",
        address: "25 Herbert Macaulay Way, Yaba",
        phone: "+234 809 555 1030",
        hours: "24 hours",
      },
    ],
    "Eti-Osa": [
      {
        name: "Lekki Wellness Clinic",
        type: "Primary Care",
        address: "Admiralty Way, Lekki Phase 1",
        phone: "+234 802 455 8821",
        hours: "Mon - Sun, 8am - 8pm",
      },
    ],
  },
  Abuja: {
    "Abuja Municipal": [
      {
        name: "Central Care Hospital Abuja",
        type: "General Hospital",
        address: "Garki Area 11, Abuja",
        phone: "+234 803 221 4088",
        hours: "24 hours",
      },
      {
        name: "Wuse Family Health Centre",
        type: "Primary Care",
        address: "Wuse 2, Abuja",
        phone: "+234 807 990 1142",
        hours: "Mon - Sat, 8am - 7pm",
      },
    ],
    Gwagwalada: [
      {
        name: "Gwagwalada Medical Partners",
        type: "General Hospital",
        address: "University Road, Gwagwalada",
        phone: "+234 806 734 8182",
        hours: "24 hours",
      },
    ],
  },
  "Rivers": {
    "Port Harcourt": [
      {
        name: "Port Harcourt Premier Hospital",
        type: "Specialist Hospital",
        address: "Aba Road, Port Harcourt",
        phone: "+234 805 118 7724",
        hours: "24 hours",
      },
      {
        name: "D-Line Medical Centre",
        type: "Primary Care",
        address: "D-Line, Port Harcourt",
        phone: "+234 809 400 6541",
        hours: "Mon - Sat, 8am - 6pm",
      },
    ],
    "Obio-Akpor": [
      {
        name: "Obio-Akpor Family Clinic",
        type: "Primary Care",
        address: "Rumuodara, Obio-Akpor",
        phone: "+234 803 600 2411",
        hours: "Mon - Sun, 8am - 8pm",
      },
    ],
  },
};

export default function HealthcareProvidersPage() {
  const states = Object.keys(providersByState);
  const [selectedState, setSelectedState] = useState(states[0]);
  const lgas = useMemo(
    () => Object.keys(providersByState[selectedState] ?? {}),
    [selectedState],
  );
  const [selectedLga, setSelectedLga] = useState(lgas[0]);

  const providers = providersByState[selectedState]?.[selectedLga] ?? [];

  const handleStateChange = (state: string) => {
    const nextLgas = Object.keys(providersByState[state] ?? {});
    setSelectedState(state);
    setSelectedLga(nextLgas[0] ?? "");
  };

  return (
    <>
      <Header />

      <main className="providers-page">
        <section className="providers-hero">
          <div className="container providers-hero-grid">
            <div>
              <div className="badge">Healthcare provider network</div>
              <h1>Find AltuHealth Providers Near Your Family.</h1>
              <p>
                Search our growing provider network by state and local
                government area to find hospitals, clinics, and primary care
                partners available to AltuHealth members.
              </p>
            </div>

            <div className="providers-summary">
              <div>
                <strong>1,500+</strong>
                <span>Hospitals</span>
              </div>
              <div>
                <strong>2,500+</strong>
                <span>Pharmacies</span>
              </div>
              <div>
                <strong>24/7</strong>
                <span>Support</span>
              </div>
            </div>
          </div>
        </section>

        <section className="provider-finder">
          <div className="container">
            <div className="provider-finder-panel">
              <div className="provider-filter">
                <label htmlFor="state">State</label>
                <select
                  id="state"
                  value={selectedState}
                  onChange={(event) => handleStateChange(event.target.value)}
                >
                  {states.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div className="provider-filter">
                <label htmlFor="lga">Local Government Area</label>
                <select
                  id="lga"
                  value={selectedLga}
                  onChange={(event) => setSelectedLga(event.target.value)}
                >
                  {lgas.map((lga) => (
                    <option key={lga} value={lga}>
                      {lga}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="provider-results-heading">
              <span>
                Showing {providers.length} provider
                {providers.length === 1 ? "" : "s"}
              </span>
              <h2>
                {selectedLga}, {selectedState}
              </h2>
            </div>

            <div className="provider-grid">
              {providers.map((provider) => (
                <article className="provider-card" key={provider.name}>
                  <span>{provider.type}</span>
                  <h3>{provider.name}</h3>
                  <p>{provider.address}</p>
                  <div className="provider-meta">
                    <strong>{provider.hours}</strong>
                    <a href={`tel:${provider.phone.replaceAll(" ", "")}`}>
                      {provider.phone}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
