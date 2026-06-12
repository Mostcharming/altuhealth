import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CurrencyRatesPage from "@/components/pages/currencyRates/CurrencyRatesPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Rates",
  description: "Manage currency rates against Nigerian Naira.",
};

export default function Rates() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Rates" />
      <CurrencyRatesPage />
    </div>
  );
}
