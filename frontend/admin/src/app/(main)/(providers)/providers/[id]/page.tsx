"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import PageBreadcrumbSub from "@/components/common/PageBreadCrumbSub";
import Details from "@/components/pages/provider/single/details";
import SinglePHeader from "@/components/pages/provider/single/header";
import Plans from "@/components/pages/provider/single/plans";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { apiClient } from "@/lib/apiClient";
import capitalizeWords from "@/lib/capitalize";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Units() {
  const params = useParams();
  const id = params.id as string;
  const [benefitCategory, setBenefitCategory] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBenefitCategory = async () => {
      try {
        setLoading(true);
        const response = await apiClient(`/admin/providers/${id}`);

        if (response.data) {
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
    document.title = "AltuHealth Admin single provider";
  }, []);

  const pageTitle = benefitCategory
    ? capitalizeWords(benefitCategory?.name)
    : "Single Provider";

  return (
    <div>
      {loading ? (
        <SpinnerThree />
      ) : (
        <>
          <PageBreadcrumbSub
            parentTitle="Proivers"
            parentHref="/providers"
            currentTitle={pageTitle}
          />
          <div className="space-y-6 mt-6">
            <SinglePHeader
              data={benefitCategory}
              setdata={setBenefitCategory}
            />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <Details data={benefitCategory} />
              </div>
              <div className="space-y-6">
                <Plans data={benefitCategory} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
