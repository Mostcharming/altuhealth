"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ReferralProgramsTable from "@/components/pages/referralConfiguration/referralProgramsTable";

export default function ReferralConfigurationPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Referral Configuration" />
      <ReferralProgramsTable />
    </div>
  );
}
