"use client";

import Input from "@/components/form/input/InputField";
import RichHtmlEditor from "@/components/form/input/RichHtmlEditor";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import Switch from "@/components/form/switch/Switch";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import Button from "@/components/ui/button/Button";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { apiClient } from "@/lib/apiClient";
import { useGeneralSettingsStore } from "@/lib/store/generalSettingsStore";
import React, { useEffect, useState } from "react";

// interface GeneralSettings {
//   id?: string;
//   emailFrom?: string;
//   smsFrom?: string;
//   emailTemplate?: string;
//   smsBody?: string;
//   emailNotification?: boolean;
//   smsNotification?: boolean;
//   createdAt?: string;
//   updatedAt?: string;
// }

const GlobalTemplate: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>("");

  // Modal states
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean }>({
    isOpen: false,
  });
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean }>({
    isOpen: false,
  });

  // Form state for editable fields
  const [emailFrom, setEmailFrom] = useState<string>("");
  const [smsFrom, setSmsFrom] = useState<string>("");
  const [emailTemplate, setEmailTemplate] = useState<string>("");
  const [smsBody, setSmsBody] = useState<string>("");
  const [emailNotification, setEmailNotification] = useState<boolean>(false);
  const [smsNotification, setSmsNotification] = useState<boolean>(false);

  const setCurrentSettings = useGeneralSettingsStore(
    (state) => state.setSettings
  );

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiClient(`/admin/general-settings`, {
          method: "GET",
          onLoading: (l: boolean) => setLoading(l),
        });

        const settingsData = data?.data || data;
        setCurrentSettings(settingsData);

        // Initialize form state
        setEmailFrom(settingsData.emailFrom || "");
        setSmsFrom(settingsData.smsFrom || "");
        setEmailTemplate(settingsData.emailTemplate || "");
        setSmsBody(settingsData.smsBody || "");
        setEmailNotification(settingsData.emailNotification || false);
        setSmsNotification(settingsData.smsNotification || false);
      } catch (err) {
        console.error("Failed to fetch settings", err);
        setError(
          err instanceof Error ? err.message : "Failed to load settings"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [setCurrentSettings]);

  const handleSubmit = async () => {
    try {
      setSubmitError("");
      setSubmitting(true);

      await apiClient(`/admin/general-settings`, {
        method: "PUT",
        body: {
          emailFrom,
          smsFrom,
          emailTemplate,
          smsBody,
          emailNotification,
          smsNotification,
        },
      });

      // Refresh settings data
      const data = await apiClient(`/admin/general-settings`, {
        method: "GET",
      });
      const settingsData = data?.data || data;
      setCurrentSettings(settingsData);

      // Open success modal
      setSuccessModal({ isOpen: true });
    } catch (err) {
      console.error("Failed to update settings", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update settings";
      setSubmitError(errorMessage);
      // Open error modal
      setErrorModal({ isOpen: true });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessModal({ isOpen: false });
  };

  const handleErrorClose = () => {
    setErrorModal({ isOpen: false });
  };

  if (loading) {
    return <SpinnerThree />;
  }

  if (error) {
    return (
      <div className="mt-7 rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-900/20">
        <p className="text-red-800 dark:text-red-200">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="mt-7 space-y-6">
      {/* Email Settings Section */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Email Settings
          </h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          {/* Email From */}
          <div>
            <Label htmlFor="emailFrom">Email From Address</Label>
            <Input
              id="emailFrom"
              type="email"
              placeholder="noreply@example.com"
              value={emailFrom}
              onChange={(e) => setEmailFrom(e.target.value)}
            />
          </div>

          {/* Email Enable/Disable Switch */}
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable Email Notifications
            </label>
            <Switch
              checked={emailNotification}
              onChange={setEmailNotification}
              color="blue"
            />
          </div>

          {/* Email Body Editor */}
          <div>
            <Label htmlFor="emailTemplate">Email Template</Label>
            <RichHtmlEditor value={emailTemplate} onChange={setEmailTemplate} />
          </div>
        </div>
      </div>

      {/* SMS Settings Section */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            SMS Settings
          </h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          {/* SMS From */}
          <div>
            <Label htmlFor="smsFrom">SMS From (Sender ID)</Label>
            <Input
              id="smsFrom"
              type="text"
              placeholder="AltuHealth"
              value={smsFrom}
              onChange={(e) => setSmsFrom(e.target.value)}
            />
          </div>

          {/* SMS Enable/Disable Switch */}
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable SMS Notifications
            </label>
            <Switch
              checked={smsNotification}
              onChange={setSmsNotification}
              color="blue"
            />
          </div>

          {/* SMS Body */}
          <div>
            <Label htmlFor="smsBody">SMS Template</Label>
            <TextArea
              // id="smsBody"
              placeholder="Enter SMS template (160 characters recommended for single message delivery)"
              value={smsBody}
              onChange={(value) => setSmsBody(value)}
              rows={4}
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Character count: {smsBody.length} / 160
            </p>
          </div>
        </div>
      </div>

      {/* Best Practices Section */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Best Practices
          </h2>
        </div>
        <div className="px-6 py-5">
          <ul className="space-y-2">
            <li className="text-sm text-gray-700 dark:text-gray-300">
              ✓ Keep email subject lines concise and descriptive
            </li>
            <li className="text-sm text-gray-700 dark:text-gray-300">
              ✓ Use personalization variables to increase engagement
            </li>
            <li className="text-sm text-gray-700 dark:text-gray-300">
              ✓ Ensure SMS templates are under 160 characters for single message
              delivery
            </li>
            <li className="text-sm text-gray-700 dark:text-gray-300">
              ✓ Always include a call-to-action in your templates
            </li>
          </ul>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          onClick={handleSubmit}
          loading={submitting}
          disabled={submitting}
          className="w-full"
          size="md"
        >
          {submitting ? "Saving Changes..." : "Save Global Settings"}
        </Button>
      </div>

      {/* Success Modal */}
      <SuccessModal
        successModal={successModal}
        handleSuccessClose={handleSuccessClose}
      />

      {/* Error Modal */}
      <ErrorModal
        errorModal={errorModal}
        handleErrorClose={handleErrorClose}
        message={submitError}
      />
    </div>
  );
};

export default GlobalTemplate;
