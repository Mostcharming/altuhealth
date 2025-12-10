import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BenefitsTable from "@/components/pages/benefitList/benefitsTable";
import BulkUploadBenefits from "@/components/pages/singlebenefit/bulkUploadBenefits";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Benefits Categories",
  description: "Manage Benefit Categories within the AltuHealth admin panel.",
};

export default function Units() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Benefits List" />
      {/* <div className="flex flex-col sm:flex-row gap-3"> */}
      {/* <CreateBenefitWithCategory buttonText="Create a benefit" /> */}
      <BulkUploadBenefits buttonText="Create a benefit" />
      {/* </div> */}
      <BenefitsTable />
    </div>
  );
}
