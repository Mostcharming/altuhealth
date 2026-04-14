"use client";

import { useModal } from "@/hooks/useModal";
import { Integration, updateIntegration } from "@/lib/apis/integration";
import { useEffect, useState } from "react";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import ErrorModal from "../modals/error";
import SuccessModal from "../modals/success";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";

interface IntegrationSettingsModalProps {
  integrationName?: string;
  integrationId?: string;
  integrationData?: Integration | null;
  onSave?: () => void;
}

export default function IntegrationSettingsModal({
  integrationName = "Integration",
  integrationId = "",
  integrationData,
  onSave,
}: IntegrationSettingsModalProps) {
  const settingsModal = useModal();
  const [isSaving, setIsSaving] = useState(false);
  const [successModal, setSuccessModal] = useState({ isOpen: false });
  const [errorModal, setErrorModal] = useState({ isOpen: false });
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    description: "",
    base_url: "",
    secret_key: "",
    public_key: "",
    api_key: "",
    api_secret: "",
    webhook_url: "",
    webhook_secret: "",
  });

  useEffect(() => {
    if (integrationData) {
      setFormData({
        description: integrationData.description || "",
        base_url: integrationData.base_url || "",
        secret_key: integrationData.secret_key || "",
        public_key: integrationData.public_key || "",
        api_key: integrationData.api_key || "",
        api_secret: integrationData.api_secret || "",
        webhook_url: integrationData.webhook_url || "",
        webhook_secret: integrationData.webhook_secret || "",
      });
    }
  }, [integrationData]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!integrationId) {
      setErrorMessage("Integration ID is missing");
      setErrorModal({ isOpen: true });
      return;
    }

    setIsSaving(true);
    try {
      await updateIntegration(integrationId, formData);
      setSuccessModal({ isOpen: true });
      setTimeout(() => {
        settingsModal.closeModal();
        if (onSave) {
          onSave();
        }
      }, 1500);
    } catch (error) {
      console.error("Failed to save integration settings:", error);
      setErrorMessage("Failed to save integration settings");
      setErrorModal({ isOpen: true });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={settingsModal.openModal}
        className="shadow-theme-xs inline-flex h-11 w-11 items-center justify-center rounded-lg border border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-400"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M5.64615 4.59906C5.05459 4.25752 4.29808 4.46015 3.95654 5.05171L2.69321 7.23986C2.35175 7.83128 2.5544 8.58754 3.14582 8.92899C3.97016 9.40493 3.97017 10.5948 3.14583 11.0707C2.55441 11.4122 2.35178 12.1684 2.69323 12.7598L3.95657 14.948C4.2981 15.5395 5.05461 15.7422 5.64617 15.4006C6.4706 14.9247 7.50129 15.5196 7.50129 16.4715C7.50129 17.1545 8.05496 17.7082 8.73794 17.7082H11.2649C11.9478 17.7082 12.5013 17.1545 12.5013 16.4717C12.5013 15.5201 13.5315 14.9251 14.3556 15.401C14.9469 15.7423 15.7029 15.5397 16.0443 14.9485L17.3079 12.7598C17.6494 12.1684 17.4467 11.4121 16.8553 11.0707C16.031 10.5948 16.031 9.40494 16.8554 8.92902C17.4468 8.58757 17.6494 7.83133 17.3079 7.23992L16.0443 5.05123C15.7029 4.45996 14.9469 4.25737 14.3556 4.59874C13.5315 5.07456 12.5013 4.47961 12.5013 3.52798C12.5013 2.84515 11.9477 2.2915 11.2649 2.2915L8.73795 2.2915C8.05496 2.2915 7.50129 2.84518 7.50129 3.52816C7.50129 4.48015 6.47059 5.07505 5.64615 4.59906Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12.5714 9.99977C12.5714 11.4196 11.4204 12.5706 10.0005 12.5706C8.58069 12.5706 7.42969 11.4196 7.42969 9.99977C7.42969 8.57994 8.58069 7.42894 10.0005 7.42894C11.4204 7.42894 12.5714 8.57994 12.5714 9.99977Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Modal
        isOpen={settingsModal.isOpen}
        onClose={settingsModal.closeModal}
        className="relative w-full max-w-[558px] rounded-3xl m-5 sm:m-0 bg-white p-6 lg:p-10 dark:bg-gray-900 max-h-[90vh] overflow-y-auto"
      >
        <div>
          <h4 className="text-title-xs mb-1 font-semibold text-gray-800 dark:text-white/90">
            {integrationName} settings
          </h4>
          <p className="mb-7 text-sm leading-6 text-gray-500 dark:text-gray-400">
            Manage and configure your connected apps and services
          </p>
          <form action="#">
            <div className="space-y-4">
              <div>
                <Label>Description</Label>
                <Input
                  type="text"
                  placeholder="Integration description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                />
              </div>
              <div>
                <Label>Base URL</Label>
                <Input
                  type="text"
                  placeholder="https://api.example.com"
                  value={formData.base_url}
                  onChange={(e) =>
                    handleInputChange("base_url", e.target.value)
                  }
                />
              </div>
              <div>
                <Label>Public Key</Label>
                <Input
                  type="text"
                  placeholder="Your public key"
                  value={formData.public_key}
                  onChange={(e) =>
                    handleInputChange("public_key", e.target.value)
                  }
                />
              </div>
              <div>
                <Label>Secret Key</Label>
                <Input
                  type="password"
                  placeholder="Your secret key"
                  value={formData.secret_key}
                  onChange={(e) =>
                    handleInputChange("secret_key", e.target.value)
                  }
                />
              </div>
              <div>
                <Label>API Key</Label>
                <Input
                  type="text"
                  placeholder="Your API key"
                  value={formData.api_key}
                  onChange={(e) => handleInputChange("api_key", e.target.value)}
                />
              </div>
              <div>
                <Label>API Secret</Label>
                <Input
                  type="password"
                  placeholder="Your API secret"
                  value={formData.api_secret}
                  onChange={(e) =>
                    handleInputChange("api_secret", e.target.value)
                  }
                />
              </div>
              <div>
                <Label>Webhook URL</Label>
                <Input
                  type="text"
                  placeholder="https://example.com/webhook"
                  value={formData.webhook_url}
                  onChange={(e) =>
                    handleInputChange("webhook_url", e.target.value)
                  }
                />
              </div>
              <div>
                <Label>Webhook Secret</Label>
                <Input
                  type="password"
                  placeholder="Your webhook secret"
                  value={formData.webhook_secret}
                  onChange={(e) =>
                    handleInputChange("webhook_secret", e.target.value)
                  }
                />
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Save your changes by clicking &quot;Save Changes&quot;
            </p>
          </form>
          <div className="mt-8 flex w-full flex-col sm:flex-row items-center justify-between gap-3">
            <Button
              onClick={settingsModal.closeModal}
              className="w-full"
              variant="outline"
              disabled={isSaving}
            >
              Close
            </Button>
            <Button onClick={handleSave} className="w-full" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </Modal>

      <SuccessModal
        successModal={successModal}
        handleSuccessClose={() => setSuccessModal({ isOpen: false })}
      />
      <ErrorModal
        errorModal={errorModal}
        handleErrorClose={() => setErrorModal({ isOpen: false })}
        message={errorMessage}
      />
    </>
  );
}
