"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ReferrersTable from "@/components/pages/referrer/referrersTable";

export default function ReferrersPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Referrers" />
      <ReferrersTable />
    </div>
  );
}
