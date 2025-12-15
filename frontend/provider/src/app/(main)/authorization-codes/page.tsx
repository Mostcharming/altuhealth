import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AuthorizationCodesTable from "@/components/pages/authorizationCodes/authorizationCodesTable";
import PageMetricsAuthorizationCodes from "@/components/pages/authorizationCodes/pageMetrics";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Authorization Codes Management",
  description:
    "Manage authorization codes and their details within the AltuHealth admin panel.",
};

export default function AuthorizationCodes() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Authorization Codes Management" />
      <PageMetricsAuthorizationCodes buttonText="Create Authorization Code" />
      <AuthorizationCodesTable />
    </div>
  );
}
