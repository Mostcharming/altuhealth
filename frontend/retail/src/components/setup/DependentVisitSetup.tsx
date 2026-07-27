"use client";

import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/lib/authStore";
import { useEffect, useState } from "react";

type Preference = {
  dependentVisitNotificationsEnabled: boolean | null;
  requiresDependentVisitSetup: boolean;
};

function unwrapPreference(response: unknown): Preference | null {
  if (!response || typeof response !== "object") return null;
  return (response as { data?: Preference }).data ?? (response as Preference);
}

export default function DependentVisitSetup() {
  const current = useAuthStore(
    (state) => state.user?.dependentVisitNotificationsEnabled,
  );
  const updateUser = useAuthStore((state) => state.updateUser);
  const [preference, setPreference] = useState<boolean | null | undefined>(
    current,
  );
  const [loading, setLoading] = useState(current === undefined);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    apiClient("/enrollee/account/dependent-visit-preference")
      .then((response) => {
        const payload = unwrapPreference(response);
        if (!active || !payload) return;
        setPreference(payload.dependentVisitNotificationsEnabled);
        updateUser(payload);
      })
      .catch((requestError) => {
        console.warn("Unable to load dependent visit preference", requestError);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [updateUser]);

  const save = async (enabled: boolean) => {
    try {
      setSaving(true);
      setError("");
      await apiClient("/enrollee/account/dependent-visit-preference", {
        method: "PUT",
        body: { enabled },
      });
      setPreference(enabled);
      updateUser({
        dependentVisitNotificationsEnabled: enabled,
        requiresDependentVisitSetup: false,
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save your choice.",
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
      aria-labelledby="dependent-visit-retail-title"
    >
      <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900 sm:p-8">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
          <svg
            aria-hidden="true"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
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
          id="dependent-visit-retail-title"
          className="text-2xl font-semibold text-gray-900 dark:text-white"
        >
          Dependent visit updates
        </h2>
        <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
          Would you like an alert when a provider records a visit for a
          dependent while requesting an authorization code?
        </p>
        <p className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-600 dark:border-gray-700 dark:bg-white/[0.03] dark:text-gray-300">
          Yes also enables dependent medical history in your sidebar. No keeps
          that medical history hidden from your account.
        </p>
        {error && <p className="mt-4 text-sm text-error-500">{error}</p>}
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={saving}
            onClick={() => save(false)}
            className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 disabled:opacity-60 dark:border-gray-700 dark:text-gray-300"
          >
            No, keep it private
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => save(true)}
            className="rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Yes, notify me"}
          </button>
        </div>
      </div>
    </div>
  );
}
