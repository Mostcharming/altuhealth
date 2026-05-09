"use client";

import PageBreadcrumbSub from "@/components/common/PageBreadCrumbSub";
import DependentDetailsHeader from "@/components/pages/dependent/DependentDetailsHeader";
import DependentDetailsInfo from "@/components/pages/dependent/DependentDetailsInfo";
import DependentMedicalHistoryTable from "@/components/pages/dependent/DependentMedicalHistoryTable";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { fetchDependentById } from "@/lib/apis/dependent";
import capitalizeWords from "@/lib/capitalize";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface DependentDetails {
  id: string;
  policyNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: string;
  relationshipToEnrollee: string;
  phoneNumber?: string;
  email?: string;
  occupation?: string;
  maritalStatus?: string;
  preexistingMedicalRecords?: string;
  notes?: string;
  isActive: boolean;
  enrollmentDate: string;
}

export default function SingleDependentPage() {
  const params = useParams();
  const id = params.id as string;
  const [dependent, setDependent] = useState<DependentDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDependent = async () => {
      try {
        setLoading(true);
        const response = await fetchDependentById(id);

        if (response?.data) {
          setDependent(response.data);
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
            parentHref="/dependents"
            currentTitle={pageTitle}
          />
          <div className="space-y-6 mt-6">
            <DependentDetailsHeader data={dependent} />
            <div>
              <DependentDetailsInfo data={dependent} />
            </div>

            <div>
              <DependentMedicalHistoryTable dependentId={id} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
