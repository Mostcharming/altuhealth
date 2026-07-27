"use client";

import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/lib/authStore";
import { useEffect, useState } from "react";

type PreferenceResponse = {
  dependentVisitNotificationsEnabled: boolean | null;
  requiresDependentVisitSetup: boolean;
};

function getPreferencePayload(response: unknown): PreferenceResponse | null {
  if (!response || typeof response !== "object") return null;

  const envelope = response as {
    data?: PreferenceResponse;
  };
  return envelope.data ?? (response as PreferenceResponse);
}

export default function DependentVisitSetup() {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [preference, setPreference] = useState<boolean | null | undefined>(
    user?.dependentVisitNotificationsEnabled,
  );
  const [loading, setLoading] = useState(
    user?.dependentVisitNotificationsEnabled === undefined,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPreference() {
      try {
        const response = await apiClient(
          "/enrollee/account/dependent-visit-preference",
        );
        const payload = getPreferencePayload(response);
        if (!active || !payload) return;

        setPreference(payload.dependentVisitNotificationsEnabled);
        updateUser(payload);
      } catch (requestError) {
        console.warn(
          "[DependentVisitSetup] failed to load preference",
          requestError,
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadPreference();
    return () => {
      active = false;
    };
  }, [updateUser]);

  const savePreference = async (enabled: boolean) => {
    try {
      setSaving(true);
      setError("");
      const response = await apiClient(
        "/enrollee/account/dependent-visit-preference",
        {
          method: "PUT",
          body: { enabled },
        },
      );
      const payload = getPreferencePayload(response);
      const resolved = payload?.dependentVisitNotificationsEnabled ?? enabled;

      setPreference(resolved);
      updateUser({
        dependentVisitNotificationsEnabled: resolved,
        requiresDependentVisitSetup: false,
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save your choice. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading || preference !== null) return null;

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-gray-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dependent-visit-setup-title"
    >
      <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900 sm:p-8">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
          <svg
            aria-hidden="true"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 21s8-3.5 8-10V5l-8-3-8 3v6c0 6.5 8 10 8 10Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path
              d="M9 12h6M12 9v6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <h2
          id="dependent-visit-setup-title"
          className="text-2xl font-semibold text-gray-900 dark:text-white"
        >
          Dependent visit updates
        </h2>
        <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
          Would you like to be notified when a provider records a visit for one
          of your dependents while requesting an authorization code?
        </p>

        <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-600 dark:border-gray-700 dark:bg-white/[0.03] dark:text-gray-300">
          Choosing <strong>Yes</strong> also gives you access to your
          dependents&apos; medical history. Choosing <strong>No</strong> keeps
          that history hidden from your account. You can review this choice
          later in your profile.
        </div>

        {error && (
          <p className="mt-4 text-sm text-error-600 dark:text-error-400">
            {error}
          </p>
        )}

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={saving}
            onClick={() => savePreference(false)}
            className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
          >
            No, keep it private
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => savePreference(true)}
            className="rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Yes, notify me"}
          </button>
        </div>
      </div>
    </div>
  );
}
