import { StripeIcon } from "@/components/integration/icon";
import IntegrationBreadcrumb from "@/components/integration/IntegrationBreadcrumb";
import IntegrationCard from "@/components/integration/IntegrationCard";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "AltuHealth Admin Integrations | Manage Your Integrations",
  description:
    "Manage and configure integrations for your AltuHealth admin panel. Connect with Stripe and other third-party services.",
};

const integrationData = [
  {
    id: "stripe-production",
    title: "Stripe Production",
    description:
      "Connect your Stripe Production account to process live payments and manage transactions.",
    icon: <StripeIcon />,
    isConnected: true,
  },
  {
    id: "stripe-sandbox",
    title: "Stripe Sandbox",
    description:
      "Connect your Stripe Sandbox account for testing payments and development purposes.",
    icon: <StripeIcon />,
    isConnected: false,
  },
];

export default function IntegrationsPage() {
  return (
    <div>
      <IntegrationBreadcrumb pageTitle="Integrations" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {integrationData.map((item) => (
          <IntegrationCard
            key={item.id}
            title={item.title}
            icon={item.icon}
            description={item.description}
            isConnected={item.isConnected}
            integrationId={item.id}
          />
        ))}
      </div>
    </div>
  );
}
