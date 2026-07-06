"use client";

import { getIntegration, type Integration } from "@/lib/apis/integration";
import { ReactNode, useEffect, useState } from "react";
import Switch from "../form/switch/Switch";
import IntegrationDetailsModal from "./IntegrationDetailsModal";
import IntegrationSettingsModal from "./IntegrationSettingsModal";

interface IntegrationCardProps {
  title: string;
  icon: ReactNode;
  description: string;
  isConnected: boolean;
  integrationId?: string;
  onRemove?: (id: string) => void;
  onToggleConnection?: (id: string, connected: boolean) => Promise<void> | void;
  onUpdate?: () => void;
}

export default function IntegrationCard({
  title,
  icon,
  description,
  isConnected,
  integrationId = "",
  onToggleConnection,
  onUpdate,
}: IntegrationCardProps) {
  const [connected, setConnected] = useState(isConnected);
  const [isLoading, setIsLoading] = useState(false);
  const [integrationData, setIntegrationData] = useState<Integration | null>(
    null
  );
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (integrationId) {
        try {
          setLoadingDetails(true);
          const response = await getIntegration(integrationId);
          const data = response?.data?.integration || response?.integration;
          setIntegrationData(data);
        } catch (error) {
          console.error("Failed to fetch integration details:", error);
        } finally {
          setLoadingDetails(false);
        }
      }
    };
    fetchDetails();
  }, [integrationId]);

  const handleToggleConnection = async (newState: boolean) => {
    setIsLoading(true);
    try {
      setConnected(newState);
      if (onToggleConnection) {
        await onToggleConnection(integrationId, newState);
      }
    } catch (error) {
      // Revert state on error
      setConnected(!newState);
      console.error("Failed to toggle integration:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsSave = () => {
    // Refresh integration data after settings save
    if (onUpdate) {
      onUpdate();
    }
  };

  return (
    <>
      <article className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
        <div className="relative p-5 pb-9">
          <div className="mb-5 inline-flex h-10 w-10 items-center justify-center">
            {icon}
          </div>
          <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-white/90">
            {title}
          </h3>
          <p className="max-w-xs text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 p-5 dark:border-gray-800">
          <div className="flex gap-3">
            <IntegrationSettingsModal
              integrationName={title}
              integrationId={integrationId}
              integrationData={integrationData}
              onSave={handleSettingsSave}
            />
            <IntegrationDetailsModal
              integrationName={title}
              integrationData={integrationData}
              isLoading={loadingDetails}
            />
          </div>
          <Switch
            defaultChecked={connected}
            onChange={handleToggleConnection}
            disabled={isLoading}
          />
        </div>
      </article>
    </>
  );
}
