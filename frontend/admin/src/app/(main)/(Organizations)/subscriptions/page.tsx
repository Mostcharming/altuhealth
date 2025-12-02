import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMetricsSubscriptions from "@/components/pages/subscriptions/pageMetrics";
import SubscriptionTable from "@/components/pages/subscriptions/subscriptionTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Subscriptions",
  description: "Manage Subscriptions within the AltuHealth admin panel.",
};

export default function Subscriptions() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Subscriptions setup" />
      <PageMetricsSubscriptions buttonText="Create a subscription" />
      <SubscriptionTable />
    </div>
  );
}
