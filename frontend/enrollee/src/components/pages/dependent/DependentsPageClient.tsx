"use client";

import DependentTable from "@/components/dependents/DependentTable";
import PageMetricsDependents from "@/components/pages/dependent/pageMetrics";
import { useRef } from "react";

export default function DependentsPageClient() {
  const fetchRef = useRef<(() => Promise<void>) | null>(null);

  const handleFetchRef = (fetch: () => Promise<void>) => {
    fetchRef.current = fetch;
  };

  const handleDependentCreated = async () => {
    if (fetchRef.current) {
      await fetchRef.current();
    }
  };

  return (
    <>
      <PageMetricsDependents
        buttonText="Add Dependent"
        onDependentCreated={handleDependentCreated}
      />
      <DependentTable onFetchRef={handleFetchRef} />
    </>
  );
}
