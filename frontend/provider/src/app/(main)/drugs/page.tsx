import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Provider Drugs",
  description: "View drugs created for your provider account.",
};

export default function Drugs() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Drugs" />
      <SpinnerThree />
    </div>
  );
}
