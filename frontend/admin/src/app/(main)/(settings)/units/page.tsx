import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMetrics from "@/components/pageTop/pageMetrics";
import Table from "@/components/table/List";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Units",
  description: "Manage measurement units in your AltuHealth admin panel.",
};

export default function UnitsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Units" />
      <PageMetrics buttonText="Create a Unit" />
      <Table />
    </div>
  );
}
