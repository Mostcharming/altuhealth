/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import PageBreadcrumbSub from "@/components/common/PageBreadCrumbSub";
import DefaultTab from "@/components/pages/enrollee/dependent/DefaultTab";
import EnrolleeDependentDetails from "@/components/pages/enrollee/dependent/details";
import EnrolleeDependentPHeader from "@/components/pages/enrollee/dependent/header";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { apiClient } from "@/lib/apiClient";
import capitalizeWords from "@/lib/capitalize";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SingleEnrolleeDependent() {
  const params = useParams();
  const id = params.id as string;
  const [dependent, setDependent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDependent = async () => {
      try {
        setLoading(true);
        const response = await apiClient(`/admin/enrollee-dependents/${id}`);

        if (response.data) {
          setDependent(response.data.dependent || response.data);
        }
      } catch (error) {
        console.error("Failed to fetch dependent:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDependent();
    }
  }, [id]);

  const pageTitle = dependent
    ? `${capitalizeWords(dependent?.firstName)} ${capitalizeWords(
        dependent?.lastName
      )}`
    : "Single Dependent";

  return (
    <div>
      {loading ? (
        <SpinnerThree />
      ) : (
        <>
          <PageBreadcrumbSub
            parentTitle="Dependents"
            parentHref="/enrollee-dependents"
            currentTitle={pageTitle}
          />
          <div className="space-y-6 mt-6">
            <EnrolleeDependentPHeader data={dependent} />
            <div>
              <EnrolleeDependentDetails data={dependent} />
            </div>

            <DefaultTab id={id} />
          </div>
        </>
      )}
    </div>
  );
}
