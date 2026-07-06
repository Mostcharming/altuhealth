import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TariffTable from "@/components/pages/tariff/TariffTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Provider Services",
  description: "View services created for your provider account.",
};

export default function Services() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Services" />
      <TariffTable type="services" />
    </div>
  );
}
