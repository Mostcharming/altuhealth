import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CompanyTable from "@/components/pages/company/companyTable";
import PageMetricsCompanies from "@/components/pages/company/pageMetrics";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Companies",
  description: "Manage companies within the AltuHealth admin panel.",
};

export default function Companies() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Companies" />
      <PageMetricsCompanies buttonText="Create a company" />
      <CompanyTable />
    </div>
  );
}
