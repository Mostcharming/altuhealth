import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CompanyPlansTable from "@/components/pages/company/companyPlans/companyPlansTable";
import CompanyPlansPageMetrics from "@/components/pages/company/companyPlans/pageMetrics";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Company Plans",
  description: "Manage company plans within the AltuHealth admin panel.",
};

export default function CompanyPlans() {
  // Note: In a real scenario, you'd get companyId from URL params or context
  const companyId = ""; // This should come from the parent layout or URL params

  return (
    <div>
      <PageBreadcrumb pageTitle="Company Plans" />
      <div className="mt-6">
        <CompanyPlansPageMetrics companyId={companyId} />
        <div className="mt-6">
          <CompanyPlansTable companyId={companyId} />
        </div>
      </div>
    </div>
  );
}
