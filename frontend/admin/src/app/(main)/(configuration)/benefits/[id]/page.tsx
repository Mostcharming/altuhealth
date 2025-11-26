/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMetricsUnits from "@/components/pages/singlebenefit/pageMetrics";
import UnitTable from "@/components/pages/singlebenefit/unitTable";
import capitalizeWords from "@/lib/capitalize";
import { useBenefitCategoryStore } from "@/lib/store/benefitCategoryStore";

export default function Units({ params }: { params: { id: string } }) {
  const { benefitCategories } = useBenefitCategoryStore();
  const benefitCategory = benefitCategories.find(
    (category) => category.id === params.id
  );
  const pageTitle = benefitCategory
    ? capitalizeWords(benefitCategory.name)
    : "Benefit Category";

  return (
    <div>
      <PageBreadcrumb pageTitle={`Selected Category: ` + pageTitle} />
      <PageMetricsUnits
        {...({ id: params.id, buttonText: "Create a benefit" } as any)}
      />
      <UnitTable {...({ id: params.id } as any)} />
    </div>
  );
}
