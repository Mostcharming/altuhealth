"use client";

import { useModal } from "@/hooks/useModal";
import { HorizontaLDots } from "@/icons";
import { ReactNode, useState } from "react";
import Switch from "../form/switch/Switch";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import IntegrationDeleteModal from "./IntegrationDeleteModal";
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
}

export default function IntegrationCard({
  title,
  icon,
  description,
  isConnected,
  integrationId = "",
  onRemove,
  onToggleConnection,
}: IntegrationCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [connected, setConnected] = useState(isConnected);
  const [isLoading, setIsLoading] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const deleteModal = useModal();

  const handleRemove = () => {
    if (onRemove) {
      onRemove(integrationId);
    }
    deleteModal.closeModal();
  };

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
          <div className="absolute top-5 right-5 h-fit">
            <button className="dropdown-toggle" onClick={toggleDropdown}>
              <HorizontaLDots className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
            </button>
            <Dropdown
              isOpen={isOpen}
              onClose={closeDropdown}
              className="w-40 p-2"
            >
              <DropdownItem
                onItemClick={() => {
                  deleteModal.openModal();
                  closeDropdown();
                }}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Remove
              </DropdownItem>
            </Dropdown>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 p-5 dark:border-gray-800">
          <div className="flex gap-3">
            <IntegrationSettingsModal integrationName={title} />
            <IntegrationDetailsModal
              integrationName={title}
              details={[
                {
                  label: "Integration Name",
                  value: title,
                },
                {
                  label: "Status",
                  value: connected ? "Connected" : "Disconnected",
                },
                {
                  label: "Connection Type",
                  value: "API",
                },
                {
                  label: "Last Updated",
                  value: new Date().toLocaleDateString(),
                },
              ]}
            />
          </div>
          <Switch
            defaultChecked={connected}
            onChange={handleToggleConnection}
            disabled={isLoading}
          />
        </div>
      </article>

      <IntegrationDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        integrationName={title}
        onConfirm={handleRemove}
      />
    </>
  );
}
