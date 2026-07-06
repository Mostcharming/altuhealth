"use client";

import RichHtmlEditor from "@/components/form/input/RichHtmlEditor";
import TextArea from "@/components/form/input/TextArea";
import Switch from "@/components/form/switch/Switch";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import Button from "@/components/ui/button/Button";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { apiClient } from "@/lib/apiClient";
import { useNotificationTemplateStore } from "@/lib/store/notificationTemplateStore";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

interface NotificationTemplate {
  id: string;
  act?: string;
  name: string;
  subject?: string;
  emailBody?: string;
  smsBody?: string;
  emailStatus?: boolean;
  smsStatus?: boolean;
  shortcodes?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

const NotificationTemplateDetail: React.FC = () => {
  const params = useParams();
  const templateId = params.id as string;

  const [loading, setLoading] = useState<boolean>(true);
  const [template, setTemplate] = useState<NotificationTemplate | null>(null);
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
  const [emailBody, setEmailBody] = useState<string>("");
  const [smsBody, setSmsBody] = useState<string>("");
  const [emailStatus, setEmailStatus] = useState<boolean>(false);
  const [smsStatus, setSmsStatus] = useState<boolean>(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentTemplate = useNotificationTemplateStore(
    (state: { currentTemplate: NotificationTemplate | null }) =>
      state.currentTemplate
  );
  const setCurrentTemplate = useNotificationTemplateStore(
    (state: {
      setCurrentTemplate: (template: NotificationTemplate | null) => void;
    }) => state.setCurrentTemplate
  );

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiClient(
          `/admin/notification-templates/${templateId}`,
          {
            method: "GET",
            onLoading: (l: boolean) => setLoading(l),
          }
        );

        const templateData = data?.data || data;
        setTemplate(templateData);
        setCurrentTemplate(templateData);

        // Initialize form state
        setEmailBody(templateData.emailBody || "");
        setSmsBody(templateData.smsBody || "");
        setEmailStatus(templateData.emailStatus || false);
        setSmsStatus(templateData.smsStatus || false);
      } catch (err) {
        console.error("Failed to fetch template", err);
        setError(
          err instanceof Error ? err.message : "Failed to load template"
        );
      } finally {
        setLoading(false);
      }
    };

    if (templateId) {
      fetchTemplate();
    }
  }, [templateId, setCurrentTemplate]);

  const handleSubmit = async () => {
    if (!template) return;

    try {
      setSubmitError("");
      setSubmitting(true);

      await apiClient(`/admin/notification-templates/${templateId}`, {
        method: "PUT",
        body: {
          emailBody,
          smsBody,
          emailStatus,
          smsStatus,
        },
      });

      // Refresh template data
      const data = await apiClient(
        `/admin/notification-templates/${templateId}`,
        {
          method: "GET",
        }
      );
      const templateData = data?.data || data;
      setTemplate(templateData);
      setCurrentTemplate(templateData);

      // Open success modal
      setSuccessModal({ isOpen: true });
    } catch (err) {
      console.error("Failed to update template", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update template";
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

  if (!template) {
    return (
      <div className="mt-7 rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-gray-600 dark:text-gray-400">
          Notification template not found
        </p>
      </div>
    );
  }

  return (
    <div className="mt-7 space-y-6">
      {/* Header */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-800">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            {template.name}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Action: <code className="font-mono">{template.act}</code>
          </p>
        </div>

        {/* Basic Info */}
        <div className="px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Subject
              </label>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {template.subject || "—"}
              </p>
            </div>

            {/* Status Badges */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <div className="mt-1 flex gap-2">
                {template.emailStatus && (
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                    Email Active
                  </span>
                )}
                {template.smsStatus && (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-200">
                    SMS Active
                  </span>
                )}
                {!template.emailStatus && !template.smsStatus && (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-gray-900/30 dark:text-gray-200">
                    Inactive
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shortcodes */}
      {template.shortcodes && Object.keys(template.shortcodes).length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Shortcodes
            </h2>
          </div>
          <div className="px-6 py-5">
            <div className="space-y-2">
              {Object.entries(template.shortcodes).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded bg-gray-50 p-3 dark:bg-gray-900/50"
                >
                  <code className="text-sm font-mono text-gray-700 dark:text-gray-300">
                    {`{{${key}}}`}
                  </code>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {typeof value === "string" ? value : JSON.stringify(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Email Template Section */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Email Template
          </h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          {/* Email Enable/Disable Switch */}
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable Email Notifications
            </label>
            <Switch
              checked={emailStatus}
              onChange={setEmailStatus}
              color="blue"
            />
          </div>

          {/* Email Body Editor */}
          {emailBody !== null && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Body (HTML)
              </label>
              <RichHtmlEditor
                value={emailBody}
                onChange={setEmailBody}
                // placeholder="Start typing your email content here..."
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Use the toolbar to format your content. You can also use
                shortcodes like {"{{"} key {"}}"} for dynamic content.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* SMS Template Section */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            SMS Template
          </h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          {/* SMS Enable/Disable Switch */}
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable SMS Notifications
            </label>
            <Switch checked={smsStatus} onChange={setSmsStatus} color="blue" />
          </div>

          {/* SMS Body Editor */}
          {smsBody !== null && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SMS Body
              </label>
              <TextArea
                value={smsBody}
                onChange={setSmsBody}
                rows={5}
                placeholder="Enter your SMS template here..."
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                You can use shortcodes like {"{{"} key {"}}"} for dynamic
                content
              </p>
            </div>
          )}
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
          {submitting ? "Saving Changes..." : "Save Template Changes"}
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

export default NotificationTemplateDetail;
