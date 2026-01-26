import AiLayout from "@/components/ai/AiLayout";
import AiPageBreadcrumb from "@/components/ai/AiPageBreadcrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Provider Enrollees/Dependents",
  description: "View Enrollee/Dependents details",
};

export default function Enrollees() {
  return (
    <div>
      <AiPageBreadcrumb pageTitle="View Enrollee/Dependent" />
      <AiLayout />
    </div>
  );
}
