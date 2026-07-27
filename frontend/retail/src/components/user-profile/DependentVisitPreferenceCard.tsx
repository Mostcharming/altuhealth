"use client";

import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/lib/authStore";
import { useState } from "react";

export default function DependentVisitPreferenceCard() {
  const enabled = useAuthStore(
    (state) => state.user?.dependentVisitNotificationsEnabled,
  );
  const updateUser = useAuthStore((state) => state.updateUser);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const save = async (nextValue: boolean) => {
    try {
      setSaving(true);
      setMessage("");
      await apiClient("/enrollee/account/dependent-visit-preference", {
        method: "PUT",
        body: { enabled: nextValue },
      });
      updateUser({
        dependentVisitNotificationsEnabled: nextValue,
        requiresDependentVisitSetup: false,
      });
      setMessage("Preference saved.");
    } catch (requestError) {
      setMessage(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save your preference.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Dependent visit updates
          </h4>
          <p className="mt-1.5 text-sm leading-6 text-gray-500 dark:text-gray-400">
            Turn on provider-visit alerts and access to dependent medical
            history. Turning this off hides that history from your account.
          </p>
          {message && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {message}
            </p>
          )}
        </div>
        <div className="inline-flex shrink-0 rounded-lg border border-gray-200 p-1 dark:border-gray-700">
          <button
            type="button"
            disabled={saving}
            onClick={() => save(false)}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              enabled === false
                ? "bg-gray-800 text-white dark:bg-white dark:text-gray-900"
                : "text-gray-600 dark:text-gray-300"
            }`}
          >
            Off
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => save(true)}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              enabled === true
                ? "bg-brand-500 text-white"
                : "text-gray-600 dark:text-gray-300"
            }`}
          >
            {saving ? "Saving..." : "On"}
          </button>
        </div>
      </div>
    </section>
  );
}
