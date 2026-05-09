"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import PageBreadcrumbSub from "@/components/common/PageBreadCrumbSub";
import PageMetricsUnits from "@/components/pages/singlebenefit/pageMetrics";
import UnitTable from "@/components/pages/singlebenefit/unitTable";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { apiClient } from "@/lib/apiClient";
import capitalizeWords from "@/lib/capitalize";
import { BenefitCategory } from "@/lib/store/benefitCategoryStore";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Units() {
  const params = useParams();
  const id = params.id as string;
  const [benefitCategory, setBenefitCategory] =
    useState<BenefitCategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBenefitCategory = async () => {
      try {
        setLoading(true);
        const response = await apiClient(`/admin/benefit-categories/${id}`);
        if (response && response.data) {
          setBenefitCategory(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch benefit category:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBenefitCategory();
    }
  }, [id]);

  useEffect(() => {
    document.title = "AltuHealth Admin single benefit";
  }, []);

  const pageTitle = benefitCategory
    ? capitalizeWords(benefitCategory.name)
    : "Benefit Category";

  return (
    <div>
      {loading ? (
        <SpinnerThree />
      ) : (
        <>
          <PageBreadcrumbSub
            parentTitle="Benefits"
            parentHref="/benefits"
            currentTitle={pageTitle}
          />
          <PageMetricsUnits
            {...({ id, buttonText: "Create a benefit" } as any)}
          />
          <UnitTable {...({ id } as any)} />
        </>
      )}
    </div>
  );
}
