/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import PageBreadcrumbSub from "@/components/common/PageBreadCrumbSub";
import DefaultTab from "@/components/pages/enrollee/single/DefaultTab";
import EnrolleeDetails from "@/components/pages/enrollee/single/details";
import EnrolleePHeader from "@/components/pages/enrollee/single/header";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { apiClient } from "@/lib/apiClient";
import capitalizeWords from "@/lib/capitalize";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SingleEnrollee() {
  const params = useParams();
  const id = params.id as string;
  const [enrollee, setEnrollee] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollee = async () => {
      try {
        setLoading(true);
        const response = await apiClient(`/admin/enrollees/${id}`);

        if (response.data) {
          setEnrollee(response.data.enrollee);
        }
      } catch (error) {
        console.error("Failed to fetch enrollee:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEnrollee();
    }
  }, [id]);

  const pageTitle = enrollee
    ? `${capitalizeWords(enrollee?.firstName)} ${capitalizeWords(
        enrollee?.lastName
      )}`
    : "Single Enrollee";

  return (
    <div>
      {loading ? (
        <SpinnerThree />
      ) : (
        <>
          <PageBreadcrumbSub
            parentTitle="Enrollees"
            parentHref="/enrollees"
            currentTitle={pageTitle}
          />
          <div className="space-y-6 mt-6">
            <EnrolleePHeader data={enrollee} />
            <div>
              <EnrolleeDetails data={enrollee} />
            </div>

            <DefaultTab id={id} />
          </div>
        </>
      )}
    </div>
  );
}
