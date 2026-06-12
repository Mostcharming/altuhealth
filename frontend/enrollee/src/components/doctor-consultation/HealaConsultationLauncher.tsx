"use client";

import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { apiClient } from "@/lib/apiClient";
import { useEffect, useState } from "react";

type HealaConfig = {
  name: string;
  webLink: string;
  providerId?: string | null;
  dashboardUrl?: string | null;
  developerDocsUrl?: string | null;
  environment?: string;
  launchMode?: string;
};

export default function HealaConsultationLauncher() {
  const [heala, setHeala] = useState<HealaConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const response = await apiClient("/enrollee/integrations/heala");
        setHeala(response?.data?.heala || null);
        setIsOpen(true);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Heala consultation is not available.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const openHeala = () => {
    if (!heala?.webLink) return;
    window.open(heala.webLink, "heala-consultation", "noopener,noreferrer");
  };

  if (loading) return <SpinnerThree />;

  if (errorMessage || !heala?.webLink) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
        {errorMessage || "Heala consultation is not configured."}
      </div>
    );
  }

  return (
    <div className="h-full rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex h-full flex-col items-center justify-center text-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Consult a Doctor
        </h2>
        <p className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
          Continue to Heala to start a virtual doctor consultation.
        </p>
        <button
          onClick={() => {
            setIsOpen(true);
            openHeala();
          }}
          className="mt-5 rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white hover:bg-brand-600"
        >
          Open Heala Consultation
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
          <div className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-xl dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
                  Heala Consultation
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {heala.environment || "staging"} environment
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={openHeala}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Open in new tab
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
            <iframe
              src={heala.webLink}
              title="Heala consultation"
              className="h-full w-full flex-1"
              allow="camera; microphone; fullscreen; clipboard-read; clipboard-write"
            />
          </div>
        </div>
      )}
    </div>
  );
}
