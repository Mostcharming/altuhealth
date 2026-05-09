import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CompanyTable from "@/components/pages/compaanyUtilization/companyTable";
import PageMetricsCompanies from "@/components/pages/compaanyUtilization/pageMetrics";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Companies",
  description: "Manage companies within the AltuHealth admin panel.",
};

export default function Companies() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Companies Utilization" />
      <PageMetricsCompanies buttonText="Create a company" />
      <CompanyTable />
    </div>
  );
}
