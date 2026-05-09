"use client";

import AppointmentTable from "@/components/appointments/AppointmentTable";
import PageMetricsAppointments from "@/components/pages/appointment/pageMetrics";
import { useRef } from "react";

export default function AppointmentsPageClient() {
  const fetchRef = useRef<(() => Promise<void>) | null>(null);

  const handleFetchRef = (fetch: () => Promise<void>) => {
    fetchRef.current = fetch;
  };

  const handleAppointmentCreated = async () => {
    if (fetchRef.current) {
      await fetchRef.current();
    }
  };

  return (
    <>
      <PageMetricsAppointments
        buttonText="Book an Appointment"
        onAppointmentCreated={handleAppointmentCreated}
      />
      <AppointmentTable onFetchRef={handleFetchRef} />
    </>
  );
}
