"use client";

import { StripeIcon } from "@/components/integration/icon";
import IntegrationBreadcrumb from "@/components/integration/IntegrationBreadcrumb";
import IntegrationCard from "@/components/integration/IntegrationCard";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import {
  deleteIntegration,
  fetchIntegrations,
  toggleIntegrationStatus,
  type Integration,
} from "@/lib/apis/integration";
import React, { useEffect, useState } from "react";

interface IntegrationData {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isConnected: boolean;
}

const integrationDefaults = {
  "stripe-production": {
    title: "Stripe Production",
    description:
      "Connect your Stripe Production account to process live payments and manage transactions.",
    icon: <StripeIcon />,
  },
  "stripe-sandbox": {
    title: "Stripe Sandbox",
    description:
      "Connect your Stripe Sandbox account for testing payments and development purposes.",
    icon: <StripeIcon />,
  },
};

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [successModal, setSuccessModal] = useState({ isOpen: false });
  const [errorModal, setErrorModal] = useState({ isOpen: false });
  const [errorMessage, setErrorMessage] = useState("");

  const loadIntegrations = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchIntegrations({
        limit: 100,
        page: 1,
      });

      const integrationsList: Integration[] =
        response?.data?.integrations || response?.integrations || [];

      const formattedIntegrations: IntegrationData[] = integrationsList.map(
        (integration: Integration) => ({
          id: integration.id,
          title: integration.name,
          description: integration.description || "",
          icon: integrationDefaults[
            integration.name
              .toLowerCase()
              .replace(/\s+/g, "-") as keyof typeof integrationDefaults
          ]?.icon || <StripeIcon />,
          isConnected: integration.is_active,
        })
      );

      setIntegrations(formattedIntegrations);
    } catch (error) {
      console.error("Failed to load integrations:", error);
      setErrorMessage("Failed to load integrations");
      setErrorModal({ isOpen: true });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIntegrations();
  }, [loadIntegrations]);

  const handleSuccessClose = () => {
    setSuccessModal({ isOpen: false });
  };

  const handleErrorClose = () => {
    setErrorModal({ isOpen: false });
  };

  const handleRemove = async (id: string) => {
    try {
      await deleteIntegration(id);
      setIntegrations((prev) => prev.filter((item) => item.id !== id));
      setSuccessModal({ isOpen: true });
    } catch (error) {
      console.error("Failed to remove integration:", error);
      setErrorMessage("Failed to remove integration");
      setErrorModal({ isOpen: true });
    }
  };

  const handleToggleConnection = async (id: string, isConnected: boolean) => {
    try {
      await toggleIntegrationStatus(id, isConnected);
      setIntegrations((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isConnected } : item))
      );
      setSuccessModal({ isOpen: true });
    } catch (error) {
      console.error("Failed to update integration status:", error);
      setErrorMessage("Failed to update integration status");
      setErrorModal({ isOpen: true });
      // Revert the toggle
      setIntegrations((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isConnected: !isConnected } : item
        )
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading integrations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <IntegrationBreadcrumb pageTitle="Integrations" />
      {integrations.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-white/3">
          <p className="text-gray-600 dark:text-gray-400">
            No integrations found. Create your first integration.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {integrations.map((item) => (
            <IntegrationCard
              key={item.id}
              title={item.title}
              icon={item.icon}
              description={item.description}
              isConnected={item.isConnected}
              integrationId={item.id}
              onRemove={handleRemove}
              onToggleConnection={handleToggleConnection}
            />
          ))}
        </div>
      )}

      <SuccessModal
        successModal={successModal}
        handleSuccessClose={handleSuccessClose}
      />
      <ErrorModal
        errorModal={errorModal}
        handleErrorClose={handleErrorClose}
        message={errorMessage}
      />
    </div>
  );
}
