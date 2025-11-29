/* eslint-disable @typescript-eslint/no-explicit-any */
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { useModal } from "@/hooks/useModal";
import { apiClient } from "@/lib/apiClient";
import { Plan, usePlanStore } from "@/lib/store/planStore";
import React, { useCallback, useEffect, useState } from "react";

export default function Plans({ data }: { data: any }) {
  const [loading, setLoading] = React.useState(false);
  const [updating, setUpdating] = React.useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const setUsers = usePlanStore((s) => s.setPlans);
  const users = usePlanStore((s) => s.plans);
  const successModal = useModal();
  const errorModal = useModal();

  // Get existing plan IDs from provider data
  const existingPlanIds = React.useMemo(() => {
    return data?.Plans && Array.isArray(data.Plans)
      ? data.Plans.map((p: any) => String(p.id))
      : [];
  }, [data?.Plans]);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);

      const url = `/admin/plans/list?limit=all`;

      const response = await apiClient(url, {
        method: "GET",
        onLoading: (l) => setLoading(l),
      });

      const items: Plan[] =
        response?.data?.list && Array.isArray(response.data.list)
          ? response.data.list
          : Array.isArray(response)
          ? response
          : [];

      setUsers(items);
      // Initialize selected IDs from existing provider plans
      setSelectedIds(existingPlanIds);
    } catch (err) {
      console.warn("Role fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [existingPlanIds, setUsers]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const togglePlan = (planId: string) => {
    setSelectedIds((prev) =>
      prev.includes(planId)
        ? prev.filter((id) => id !== planId)
        : [...prev, planId]
    );
  };

  const handleUpdatePlans = async () => {
    if (!data?.id) return;
    try {
      setUpdating(true);
      await apiClient(`/admin/providers/${data.id}/plans`, {
        method: "POST",
        body: { planIds: selectedIds },
      });
      successModal.openModal();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
      errorModal.openModal();
    } finally {
      setUpdating(false);
    }
  };

  const handleAddAllPlans = async () => {
    if (!users || users.length === 0) return;
    const allPlanIds = users.map((p) => String(p.id));
    setSelectedIds(allPlanIds);
  };
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Plans
        </h2>
        {!loading && users && users.length > 0 && (
          <button
            onClick={handleAddAllPlans}
            type="button"
            className="flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
          >
            Select All
          </button>
        )}
      </div>
      {loading ? (
        <SpinnerThree />
      ) : (
        <>
          {users && users.length ? (
            <>
              <div className="space-y-3 mb-6">
                {users.map((p) => {
                  const isChecked = selectedIds.includes(String(p.id));
                  return (
                    <div
                      key={p.id}
                      className="p-5 bg-white border border-gray-200 rounded-xl shadow-theme-sm dark:border-gray-800 dark:bg-white/5"
                    >
                      <div className="flex items-start gap-4">
                        <label
                          htmlFor={`taskCheckbox${p.id}`}
                          className="flex items-center w-full cursor-pointer gap-3"
                        >
                          <div className="relative flex items-center flex-shrink-0">
                            <input
                              type="checkbox"
                              id={`taskCheckbox${p.id}`}
                              className="sr-only taskCheckbox"
                              value={p.id}
                              checked={isChecked}
                              onChange={() => togglePlan(String(p.id))}
                            />
                            <div className="flex items-center justify-center w-full h-5 mr-3 border border-gray-300 rounded-md box max-w-5 dark:border-gray-700">
                              <span>
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 14 14"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M11.6668 3.5L5.25016 9.91667L2.3335 7"
                                    stroke="white"
                                    strokeWidth="1.94437"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </span>
                            </div>
                            <p className="-mt-0.5 text-base text-gray-800 dark:text-white/90">
                              {p.description ?? p.name ?? String(p.id)}
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleUpdatePlans}
                  disabled={updating}
                  type="button"
                  className="flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                >
                  {updating ? "Updating..." : "Update Plans"}
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">No Plans found.</p>
          )}
        </>
      )}

      <SuccessModal
        successModal={successModal}
        handleSuccessClose={() => {
          successModal.closeModal();
        }}
      />

      <ErrorModal
        message={errorMessage}
        errorModal={errorModal}
        handleErrorClose={() => {
          errorModal.closeModal();
        }}
      />
    </div>
  );
}
