import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BenefitsTable from "@/components/pages/benefitList/benefitsTable";
import CreateBenefitWithCategory from "@/components/pages/singlebenefit/createBenefitWithCategory";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Benefits Categories",
  description: "Manage Benefit Categories within the AltuHealth admin panel.",
};

export default function Units() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Benefits List" />
      <CreateBenefitWithCategory buttonText="Create a benefit" />
      <BenefitsTable />
    </div>
  );
}
