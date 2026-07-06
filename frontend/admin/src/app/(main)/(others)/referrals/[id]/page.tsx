"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ReferrerDetailsPage from "@/components/pages/referrer/referrerDetailsPage";

export default function ReferrerDetailsRoute() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Referrer Details" />
      <ReferrerDetailsPage />
    </div>
  );
}
