import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMetricsServices from "@/components/pages/services/pageMetrics";
import ServiceTable from "@/components/pages/services/serviceTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Services",
  description: "Manage Services within the AltuHealth admin panel.",
};

export default function Services() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Services setup" />
      <PageMetricsServices buttonText="Create a service" />
      <ServiceTable />
    </div>
  );
}
