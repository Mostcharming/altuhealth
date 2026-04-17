"use client";

import MedicalHistoryTable from "@/components/medicalHistory/MedicalHistoryTable";
import { useRef } from "react";

export default function MedicalHistoryPageClient() {
  const fetchRef = useRef<(() => Promise<void>) | null>(null);

  const handleFetchRef = (fetch: () => Promise<void>) => {
    fetchRef.current = fetch;
  };

  return (
    <>
      <MedicalHistoryTable onFetchRef={handleFetchRef} />
    </>
  );
}
