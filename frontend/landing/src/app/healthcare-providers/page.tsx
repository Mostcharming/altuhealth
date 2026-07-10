"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { apiClient } from "@/lib/apiClient";
import { useCallback, useEffect, useMemo, useState } from "react";

type PublicProvider = {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  type: string;
  phoneNumber?: string;
  secondaryPhoneNumber?: string;
  website?: string;
  country?: string;
  state?: string;
  lga?: string;
  address?: string;
  providerArea?: string;
  currentLocation?: string;
};

type ProvidersResponse = {
  data?: {
    list?: PublicProvider[];
    count?: number;
    states?: string[];
    lgasByState?: Record<string, string[]>;
    summary?: {
      providerCount?: number;
      stateCount?: number;
      lgaCount?: number;
    };
  };
};

const ALL_STATES = "__all_states__";
const ALL_LGAS = "__all_lgas__";

function uniqueSorted(values: Array<string | undefined>) {
  return Array.from(
    new Set(values.map((value) => String(value || "").trim()).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b));
}

function compactLocation(values: Array<string | undefined>) {
  const seen = new Set<string>();
  return values
    .map((value) => String(value || "").trim())
    .filter((value) => {
      if (!value || seen.has(value.toLowerCase())) {
        return false;
      }
      seen.add(value.toLowerCase());
      return true;
    })
    .join(", ");
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en").format(value);
}

function getProviderLocation(provider: PublicProvider) {
  return compactLocation([
    provider.providerArea,
    provider.lga,
    provider.state,
    provider.country,
  ]);
}

function getWebsiteUrl(website: string) {
  return /^https?:\/\//i.test(website) ? website : `https://${website}`;
}

function getProviderAddress(provider: PublicProvider) {
  return (
    provider.address ||
    provider.currentLocation ||
    getProviderLocation(provider) ||
    "Location available from AltuHealth"
  );
}

function getResultsTitle(selectedState: string, selectedLga: string) {
  if (selectedState === ALL_STATES) {
    return "All provider locations";
  }

  if (selectedLga === ALL_LGAS) {
    return selectedState;
  }

  return `${selectedLga}, ${selectedState}`;
}

export default function HealthcareProvidersPage() {
  const [providers, setProviders] = useState<PublicProvider[]>([]);
  const [backendStates, setBackendStates] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState(ALL_STATES);
  const [selectedLga, setSelectedLga] = useState(ALL_LGAS);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);
  const [providersError, setProvidersError] = useState("");

  const states = useMemo(
    () =>
      backendStates.length
        ? backendStates
        : uniqueSorted(providers.map((provider) => provider.state)),
    [backendStates, providers],
  );

  const lgas = useMemo(() => {
    const scopedProviders =
      selectedState === ALL_STATES
        ? providers
        : providers.filter((provider) => provider.state === selectedState);

    return uniqueSorted(scopedProviders.map((provider) => provider.lga));
  }, [providers, selectedState]);

  const visibleProviders = useMemo(() => {
    return providers.filter((provider) => {
      const stateMatches =
        selectedState === ALL_STATES || provider.state === selectedState;
      const lgaMatches =
        selectedLga === ALL_LGAS || provider.lga === selectedLga;
      return stateMatches && lgaMatches;
    });
  }, [providers, selectedLga, selectedState]);

  const summary = useMemo(() => {
    return {
      providerCount: providers.length,
      stateCount: states.length,
      lgaCount: uniqueSorted(providers.map((provider) => provider.lga)).length,
    };
  }, [providers, states.length]);

  const fetchProviders = useCallback(async () => {
    try {
      setIsLoadingProviders(true);
      setProvidersError("");
      const payload = (await apiClient(
        "/public/providers",
      )) as ProvidersResponse;
      const list = payload.data?.list || [];
      setProviders(list);
      setBackendStates(payload.data?.states || []);
    } catch (err) {
      setProviders([]);
      setBackendStates([]);
      setProvidersError(
        err instanceof Error
          ? err.message
          : "Unable to load provider network.",
      );
    } finally {
      setIsLoadingProviders(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  useEffect(() => {
    if (selectedLga !== ALL_LGAS && !lgas.includes(selectedLga)) {
      setSelectedLga(ALL_LGAS);
    }
  }, [lgas, selectedLga]);

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setSelectedLga(ALL_LGAS);
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
                <strong>
                  {isLoadingProviders
                    ? "..."
                    : formatCount(summary.providerCount)}
                </strong>
                <span>Providers</span>
              </div>
              <div>
                <strong>
                  {isLoadingProviders ? "..." : formatCount(summary.stateCount)}
                </strong>
                <span>States</span>
              </div>
              <div>
                <strong>
                  {isLoadingProviders ? "..." : formatCount(summary.lgaCount)}
                </strong>
                <span>LGAs</span>
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
                  disabled={isLoadingProviders || states.length === 0}
                  id="state"
                  value={selectedState}
                  onChange={(event) => handleStateChange(event.target.value)}
                >
                  <option value={ALL_STATES}>All states</option>
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
                  disabled={isLoadingProviders || lgas.length === 0}
                  id="lga"
                  value={selectedLga}
                  onChange={(event) => setSelectedLga(event.target.value)}
                >
                  <option value={ALL_LGAS}>All LGAs</option>
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
                {isLoadingProviders
                  ? "Loading providers"
                  : `Showing ${visibleProviders.length} provider${
                      visibleProviders.length === 1 ? "" : "s"
                    }`}
              </span>
              <h2>{getResultsTitle(selectedState, selectedLga)}</h2>
            </div>

            {isLoadingProviders ? (
              <div className="provider-grid" aria-label="Loading providers">
                {Array.from({ length: 3 }).map((_, index) => (
                  <article className="provider-card provider-loading-card" key={index}>
                    <span />
                    <h3 />
                    <p />
                    <div className="provider-meta">
                      <strong />
                      <span />
                    </div>
                  </article>
                ))}
              </div>
            ) : providersError ? (
              <div className="provider-empty-state">
                <h3>Unable to load providers</h3>
                <p>{providersError}</p>
                <button type="button" onClick={fetchProviders}>
                  Retry
                </button>
              </div>
            ) : visibleProviders.length === 0 ? (
              <div className="provider-empty-state">
                <h3>No providers found</h3>
                <p>
                  There are no active providers for the selected location yet.
                </p>
              </div>
            ) : (
              <div className="provider-grid">
                {visibleProviders.map((provider) => (
                  <article className="provider-card" key={provider.id}>
                    <span>{provider.type || provider.categoryLabel}</span>
                    <h3>{provider.name}</h3>
                    <p>{getProviderAddress(provider)}</p>
                    <div className="provider-meta">
                      <strong>{getProviderLocation(provider)}</strong>
                      <div className="provider-card-actions">
                        {provider.phoneNumber ? (
                          <a
                            href={`tel:${provider.phoneNumber.replaceAll(" ", "")}`}
                          >
                            {provider.phoneNumber}
                          </a>
                        ) : null}
                        {provider.website ? (
                          <a
                            href={getWebsiteUrl(provider.website)}
                            rel="noreferrer"
                            target="_blank"
                          >
                            Website
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
