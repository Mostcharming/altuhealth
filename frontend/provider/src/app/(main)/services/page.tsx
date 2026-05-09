import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Provider Services",
  description: "View services created for your provider account.",
};

export default function Services() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Services" />
      <SpinnerThree />
    </div>
  );
}
