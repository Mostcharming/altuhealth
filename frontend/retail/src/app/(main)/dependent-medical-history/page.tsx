import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DependentMedicalHistoryPageClient from "@/components/dependent-medical-history/DependentMedicalHistoryPageClient";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Dependent Medical History | AltuHealth",
  description: "View medical history recorded for your dependents.",
};

export default function DependentMedicalHistoryPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Dependent Medical History" />
      <Suspense fallback={<SpinnerThree />}>
        <DependentMedicalHistoryPageClient />
      </Suspense>
    </div>
  );
}
