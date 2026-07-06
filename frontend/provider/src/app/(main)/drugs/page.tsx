import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TariffTable from "@/components/pages/tariff/TariffTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Provider Drugs",
  description: "View drugs created for your provider account.",
};

export default function Drugs() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Drugs" />
      <TariffTable type="drugs" />
    </div>
  );
}
