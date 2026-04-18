"use client";

import BenefitsTable from "@/components/benefits/BenefitsTable";
import { useRef } from "react";

export default function EnrolleeBenefitsPageClient() {
  const fetchRef = useRef<(() => Promise<void>) | null>(null);

  const handleFetchRef = (fetch: () => Promise<void>) => {
    fetchRef.current = fetch;
  };

  return (
    <>
      <BenefitsTable onFetchRef={handleFetchRef} />
    </>
  );
}
