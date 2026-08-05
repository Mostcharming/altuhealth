/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import PlanBenefitSelectionModal from "@/components/pages/plan/planBenefitSelectionModal";
import { Modal } from "@/components/ui/modal";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { useModal } from "@/hooks/useModal";
import { apiClient } from "@/lib/apiClient";
import {
  addExclusion,
  addProvider,
  removeExclusion,
  removeProvider,
  syncPlanBenefitCategories,
} from "@/lib/apis/plan";
import { Plan } from "@/lib/store/planStore";
import React, { useCallback, useEffect, useState } from "react";

interface BenefitCategory {
  id: string;
  name: string;
}

interface Exclusion {
  id: string;
  description: string;
}

interface Provider {
  id: string;
  name: string;
}

interface ViewPlanModalProps {
  isOpen: boolean;
  closeModal: () => void;
  plan: Plan | null;
  onUpdated?: (plan: Plan) => void;
}

function groupPlanBenefitsByCategory(benefits: any[] = []) {
  return benefits.reduce<Record<string, string[]>>((groups, benefit) => {
    const categoryId = String(benefit?.benefitCategoryId || "");
    const benefitId = String(benefit?.id || "");
    if (!categoryId || !benefitId) return groups;

    groups[categoryId] = groups[categoryId] || [];
    groups[categoryId].push(benefitId);
    return groups;
  }, {});
}

const CheckboxItem: React.FC<{
  id: string;
  label: string;
  helperText?: string;
  checked: boolean;
  onChange: (id: string) => void;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
}> = ({
  id,
  label,
  helperText,
  checked,
  onChange,
  actionLabel,
  onAction,
  actionDisabled = false,
}) => (
  <div className="flex items-center gap-3 p-5 bg-white border border-gray-200 rounded-xl shadow-sm dark:border-gray-800 dark:bg-white/5">
    <label
      htmlFor={`item${id}`}
      className="flex flex-1 items-center min-w-0 cursor-pointer gap-3"
    >
      <input
        type="checkbox"
        id={`item${id}`}
        className="sr-only"
        checked={checked}
        onChange={() => onChange(id)}
      />
      <div
        className={`flex items-center justify-center w-5 h-5 border rounded-md transition-colors duration-200 ${
          checked
            ? "bg-brand-500 border-brand-500 dark:bg-brand-500 dark:border-brand-500"
            : "border-gray-300 dark:border-gray-700"
        }`}
      >
        {checked && (
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
        )}
      </div>
      <div className="min-w-0">
        <p className="text-base text-gray-800 dark:text-white/90">{label}</p>
        {helperText && (
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    </label>
    {actionLabel && onAction && (
      <button
        type="button"
        onClick={onAction}
        disabled={actionDisabled}
        className="shrink-0 rounded-lg border border-brand-300 px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 dark:border-brand-700 dark:text-brand-400 dark:hover:bg-brand-500/10 dark:disabled:border-gray-700 dark:disabled:text-gray-600"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

const ViewPlanModal: React.FC<ViewPlanModalProps> = ({
  isOpen,
  closeModal,
  plan,
  onUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<string>("benefitCategories");
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [benefitFlowMessage, setBenefitFlowMessage] = useState<{
    title: string;
    description: string;
  } | null>(null);

  const errorModal = useModal();
  const successModal = useModal();

  // Benefit selection modal state
  const [showBenefitSelectionModal, setShowBenefitSelectionModal] =
    useState(false);
  const [selectedCategoryForBenefits, setSelectedCategoryForBenefits] =
    useState<{
      id: string;
      name: string;
    } | null>(null);

  const [allBenefitCategories, setAllBenefitCategories] = useState<
    BenefitCategory[]
  >([]);
  const [selectedBenefitCategories, setSelectedBenefitCategories] = useState<
    string[]
  >([]);
  const [initialBenefitCategories, setInitialBenefitCategories] = useState<
    string[]
  >([]);

  const [allExclusions, setAllExclusions] = useState<Exclusion[]>([]);
  const [selectedExclusions, setSelectedExclusions] = useState<string[]>([]);
  const [initialExclusions, setInitialExclusions] = useState<string[]>([]);

  const [allProviders, setAllProviders] = useState<Provider[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [initialProviders, setInitialProviders] = useState<string[]>([]);

  // Track benefits for each benefit category in the plan
  const [planBenefitsByCategory, setPlanBenefitsByCategory] = useState<
    Record<string, string[]>
  >({});
  const [planBenefits, setPlanBenefits] = useState<any[]>([]);

  const tabs = [
    { key: "benefitCategories", title: "Benefit Categories" },
    { key: "exclusions", title: "Exclusions" },
    { key: "providers", title: "Providers" },
  ];

  const fetchBenefitCategories = useCallback(async () => {
    try {
      const response = await apiClient(
        "/admin/benefit-categories/list?limit=all",
        {
          method: "GET",
        },
      );
      const items =
        response?.data?.list && Array.isArray(response.data.list)
          ? response.data.list
          : Array.isArray(response)
            ? response
            : [];
      setAllBenefitCategories(items);
    } catch (err) {
      console.warn("Failed to fetch benefit categories", err);
    }
  }, []);

  const fetchExclusions = useCallback(async () => {
    try {
      const response = await apiClient("/admin/exclusions/list?limit=all", {
        method: "GET",
      });
      const items =
        response?.data?.list && Array.isArray(response.data.list)
          ? response.data.list
          : Array.isArray(response)
            ? response
            : [];
      setAllExclusions(items);
    } catch (err) {
      console.warn("Failed to fetch exclusions", err);
    }
  }, []);

  const fetchProviders = useCallback(async () => {
    try {
      const response = await apiClient("/admin/providers/list?limit=all", {
        method: "GET",
      });
      const items =
        response?.data?.list && Array.isArray(response.data.list)
          ? response.data.list
          : Array.isArray(response)
            ? response
            : [];
      setAllProviders(items);
    } catch (err) {
      console.warn("Failed to fetch providers", err);
    }
  }, []);

  const fetchSelectedItems = useCallback(async () => {
    if (!plan) return;

    try {
      setLoading(true);

      const response = await apiClient(
        `/admin/plans/${plan.id}?include=benefitCategories,benefits,exclusions,providers`,
        {
          method: "GET",
        },
      );

      const planData = response?.data;

      const benefitCategoryIds = Array.isArray(planData?.benefitCategories)
        ? planData.benefitCategories.map((bc: any) => String(bc.id))
        : [];
      setSelectedBenefitCategories(benefitCategoryIds);
      setInitialBenefitCategories(benefitCategoryIds);
      const benefits = Array.isArray(planData?.benefits)
        ? planData.benefits
        : [];
      setPlanBenefits(benefits);
      setPlanBenefitsByCategory(groupPlanBenefitsByCategory(benefits));

      if (planData?.exclusions && Array.isArray(planData.exclusions)) {
        const exclusionIds = planData.exclusions.map((e: any) => String(e.id));
        setSelectedExclusions(exclusionIds);
        setInitialExclusions(exclusionIds);
      }

      if (planData?.providers && Array.isArray(planData.providers)) {
        const providerIds = planData.providers.map((p: any) => String(p.id));
        setSelectedProviders(providerIds);
        setInitialProviders(providerIds);
      }
    } catch (err) {
      console.warn("Failed to fetch selected items", err);
    } finally {
      setLoading(false);
    }
  }, [plan]);

  useEffect(() => {
    if (isOpen) {
      fetchBenefitCategories();
      fetchExclusions();
      fetchProviders();
      fetchSelectedItems();
    }
  }, [
    isOpen,
    fetchBenefitCategories,
    fetchExclusions,
    fetchProviders,
    fetchSelectedItems,
  ]);

  useEffect(() => {
    if (isOpen) {
      setBenefitFlowMessage(null);
    }
  }, [isOpen, plan?.id]);

  const toggleBenefitCategory = (categoryId: string) => {
    setBenefitFlowMessage(null);
    setSelectedBenefitCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const openBenefitSelection = (categoryId: string) => {
    const category = allBenefitCategories.find(
      (benefitCategory) => String(benefitCategory.id) === categoryId,
    );
    if (!category) return;

    setSelectedCategoryForBenefits({ id: categoryId, name: category.name });
    setShowBenefitSelectionModal(true);
  };

  const toggleExclusion = (exclusionId: string) => {
    setSelectedExclusions((prev) =>
      prev.includes(exclusionId)
        ? prev.filter((id) => id !== exclusionId)
        : [...prev, exclusionId],
    );
  };

  const toggleProvider = (providerId: string) => {
    setSelectedProviders((prev) =>
      prev.includes(providerId)
        ? prev.filter((id) => id !== providerId)
        : [...prev, providerId],
    );
  };

  const handleUpdateBenefitCategories = async () => {
    if (!plan) return;
    try {
      setUpdating(true);
      const previouslySavedCategoryIds = initialBenefitCategories;
      const response = await syncPlanBenefitCategories(
        plan.id,
        selectedBenefitCategories,
      );
      const updatedPlan = response?.data?.plan;
      if (!updatedPlan) {
        throw new Error(
          "The plan was updated, but the latest data was not returned.",
        );
      }

      const canonicalCategoryIds = Array.isArray(updatedPlan.benefitCategories)
        ? updatedPlan.benefitCategories.map((category: any) =>
            String(category.id),
          )
        : [];
      const newlyAddedCategoryIds = canonicalCategoryIds.filter(
        (categoryId: string) =>
          !previouslySavedCategoryIds.includes(categoryId),
      );
      setSelectedBenefitCategories(canonicalCategoryIds);
      setInitialBenefitCategories(canonicalCategoryIds);
      const benefits = Array.isArray(updatedPlan.benefits)
        ? updatedPlan.benefits
        : [];
      setPlanBenefits(benefits);
      setPlanBenefitsByCategory(groupPlanBenefitsByCategory(benefits));
      onUpdated?.({ ...plan, ...updatedPlan });

      if (newlyAddedCategoryIds.length > 0) {
        setBenefitFlowMessage({
          title: "Categories saved. Now choose their benefits.",
          description:
            newlyAddedCategoryIds.length === 1
              ? "Choose the benefits covered by this category."
              : `Start with the category opened for you, then choose benefits for the other ${
                  newlyAddedCategoryIds.length - 1
                } new categor${
                  newlyAddedCategoryIds.length - 1 === 1 ? "y" : "ies"
                }.`,
        });
        openBenefitSelection(newlyAddedCategoryIds[0]);
      } else if (canonicalCategoryIds.length > 0) {
        setBenefitFlowMessage({
          title: "Categories saved.",
          description:
            "Use Choose benefits or Edit benefits beside a saved category to manage what the plan covers.",
        });
      } else {
        setBenefitFlowMessage({
          title: "No benefit categories are selected.",
          description:
            "Select at least one category and save it before choosing benefits.",
        });
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
      errorModal.openModal();
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateExclusions = async () => {
    if (!plan) return;
    try {
      setUpdating(true);

      // Remove items that were deselected
      for (const exclusionId of initialExclusions) {
        if (!selectedExclusions.includes(exclusionId)) {
          try {
            await removeExclusion(plan.id, exclusionId);
          } catch (err) {
            console.warn(`Failed to remove exclusion ${exclusionId}`, err);
          }
        }
      }

      // Add items that were newly selected
      for (const exclusionId of selectedExclusions) {
        if (!initialExclusions.includes(exclusionId)) {
          try {
            await addExclusion(plan.id, exclusionId);
          } catch (err) {
            console.warn(`Failed to add exclusion ${exclusionId}`, err);
          }
        }
      }

      setInitialExclusions(selectedExclusions);
      successModal.openModal();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
      errorModal.openModal();
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateProviders = async () => {
    if (!plan) return;
    try {
      setUpdating(true);

      // Remove items that were deselected
      for (const providerId of initialProviders) {
        if (!selectedProviders.includes(providerId)) {
          try {
            await removeProvider(plan.id, providerId);
          } catch (err) {
            console.warn(`Failed to remove provider ${providerId}`, err);
          }
        }
      }

      // Add items that were newly selected
      for (const providerId of selectedProviders) {
        if (!initialProviders.includes(providerId)) {
          try {
            await addProvider(plan.id, providerId);
          } catch (err) {
            console.warn(`Failed to add provider ${providerId}`, err);
          }
        }
      }

      setInitialProviders(selectedProviders);
      successModal.openModal();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
      errorModal.openModal();
    } finally {
      setUpdating(false);
    }
  };

  const handleSelectAll = () => {
    const isAllSelected =
      activeTab === "benefitCategories"
        ? selectedBenefitCategories.length === allBenefitCategories.length &&
          allBenefitCategories.length > 0
        : activeTab === "exclusions"
          ? selectedExclusions.length === allExclusions.length &&
            allExclusions.length > 0
          : selectedProviders.length === allProviders.length &&
            allProviders.length > 0;

    if (isAllSelected) {
      // Deselect all
      if (activeTab === "benefitCategories") {
        setBenefitFlowMessage(null);
        setSelectedBenefitCategories([]);
      } else if (activeTab === "exclusions") {
        setSelectedExclusions([]);
      } else {
        setSelectedProviders([]);
      }
    } else {
      // Select all
      if (activeTab === "benefitCategories") {
        setBenefitFlowMessage(null);
        setSelectedBenefitCategories(
          allBenefitCategories.map((bc) => String(bc.id)),
        );
      } else if (activeTab === "exclusions") {
        setSelectedExclusions(allExclusions.map((e) => String(e.id)));
      } else {
        setSelectedProviders(allProviders.map((p) => String(p.id)));
      }
    }
  };

  const getFilteredItems = () => {
    const lower = searchTerm.toLowerCase();
    if (activeTab === "benefitCategories") {
      return allBenefitCategories.filter((bc) =>
        bc.name.toLowerCase().includes(lower),
      );
    } else if (activeTab === "exclusions") {
      return allExclusions.filter((e) =>
        e.description.toLowerCase().includes(lower),
      );
    } else {
      return allProviders.filter((p) => p.name.toLowerCase().includes(lower));
    }
  };

  const getSelectedIds = () => {
    if (activeTab === "benefitCategories") return selectedBenefitCategories;
    if (activeTab === "exclusions") return selectedExclusions;
    return selectedProviders;
  };

  const getToggleHandler = (id: string) => {
    if (activeTab === "benefitCategories") {
      return () => toggleBenefitCategory(id);
    } else if (activeTab === "exclusions") {
      return () => toggleExclusion(id);
    } else {
      return () => toggleProvider(id);
    }
  };

  const getItemLabel = (item: any) => {
    if (activeTab === "benefitCategories") return item.name;
    if (activeTab === "exclusions") return item.description;
    return item.name;
  };

  const getAllItems = () => {
    if (activeTab === "benefitCategories") return allBenefitCategories;
    if (activeTab === "exclusions") return allExclusions;
    return allProviders;
  };

  const getUpdateHandler = () => {
    if (activeTab === "benefitCategories") return handleUpdateBenefitCategories;
    if (activeTab === "exclusions") return handleUpdateExclusions;
    return handleUpdateProviders;
  };

  const getEmptyMessage = () => {
    if (activeTab === "benefitCategories")
      return "No benefit categories available.";
    if (activeTab === "exclusions") return "No exclusions available.";
    return "No providers available.";
  };

  const isAllSelected =
    activeTab === "benefitCategories"
      ? selectedBenefitCategories.length === allBenefitCategories.length &&
        allBenefitCategories.length > 0
      : activeTab === "exclusions"
        ? selectedExclusions.length === allExclusions.length &&
          allExclusions.length > 0
        : selectedProviders.length === allProviders.length &&
          allProviders.length > 0;

  const filteredItems = getFilteredItems();
  const selectedIds = getSelectedIds();
  const allItems = getAllItems();
  const hasBenefitCategoryChanges =
    [...selectedBenefitCategories].sort().join(",") !==
    [...initialBenefitCategories].sort().join(",");

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[600px] p-4 lg:p-6 m-4"
      >
        <div className="px-2 mb-6 ">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {plan?.name || "Plan"} - Manage Resources
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select benefit categories, exclusions, and providers for this plan.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border border-gray-200 rounded-t-lg dark:border-gray-800 p-3">
          <nav className="flex overflow-x-auto rounded-lg bg-gray-100 p-1 dark:bg-gray-900">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setSearchTerm("");
                }}
                className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ease-in-out ${
                  activeTab === tab.key
                    ? "bg-white text-gray-900 shadow-sm dark:bg-white/[0.03] dark:text-white"
                    : "bg-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {tab.title}
              </button>
            ))}
          </nav>
        </div>

        <div className="mb-6">
          {loading ? (
            <SpinnerThree />
          ) : allItems.length === 0 ? (
            <p className="text-sm text-gray-500">{getEmptyMessage()}</p>
          ) : (
            <>
              {activeTab === "benefitCategories" && (
                <div className="mb-5 space-y-3">
                  <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-500/30 dark:bg-brand-500/10">
                    <p className="mb-3 text-sm font-semibold text-gray-800 dark:text-white/90">
                      Set up plan benefits in two steps
                    </p>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white">
                          1
                        </span>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Select the benefit categories this plan should
                          include, then click <strong>Save Categories</strong>.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white">
                          2
                        </span>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Choose the individual benefits covered under each
                          saved category.
                        </p>
                      </div>
                    </div>
                  </div>

                  {benefitFlowMessage && (
                    <div
                      aria-live="polite"
                      className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-500/30 dark:bg-green-500/10"
                    >
                      <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                        {benefitFlowMessage.title}
                      </p>
                      <p className="mt-1 text-sm text-green-700 dark:text-green-400">
                        {benefitFlowMessage.description}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="mb-4">
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-white/5 dark:text-white/90 dark:placeholder-gray-400"
                />
              </div>

              <div className="flex justify-end mb-4">
                <button
                  onClick={handleSelectAll}
                  type="button"
                  className="flex justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                >
                  {isAllSelected ? "Deselect All" : "Select All"}
                </button>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {filteredItems.map((item) => (
                  <CheckboxItem
                    key={item.id}
                    id={String(item.id)}
                    label={getItemLabel(item)}
                    helperText={
                      activeTab === "benefitCategories"
                        ? initialBenefitCategories.includes(String(item.id))
                          ? selectedBenefitCategories.includes(String(item.id))
                            ? (planBenefitsByCategory[String(item.id)]
                                ?.length || 0) > 0
                              ? `${
                                  planBenefitsByCategory[String(item.id)]
                                    ?.length || 0
                                } benefits selected`
                              : "Next: choose benefits in this category"
                            : "This category will be removed when you save"
                          : selectedBenefitCategories.includes(String(item.id))
                            ? "Save categories to unlock benefit selection"
                            : undefined
                        : undefined
                    }
                    checked={selectedIds.includes(String(item.id))}
                    onChange={() => getToggleHandler(String(item.id))()}
                    actionLabel={
                      activeTab === "benefitCategories" &&
                      selectedBenefitCategories.includes(String(item.id))
                        ? initialBenefitCategories.includes(String(item.id))
                          ? (planBenefitsByCategory[String(item.id)]?.length ||
                              0) > 0
                            ? `Edit benefits (${
                                planBenefitsByCategory[String(item.id)]
                                  ?.length || 0
                              })`
                            : "Choose benefits"
                          : "Save category first"
                        : undefined
                    }
                    onAction={
                      activeTab === "benefitCategories" &&
                      selectedBenefitCategories.includes(String(item.id))
                        ? () => openBenefitSelection(String(item.id))
                        : undefined
                    }
                    actionDisabled={
                      updating ||
                      !initialBenefitCategories.includes(String(item.id))
                    }
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-800">
          <button
            type="button"
            onClick={closeModal}
            className="flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
          >
            Close
          </button>
          <button
            type="button"
            onClick={getUpdateHandler()}
            disabled={
              updating ||
              (activeTab === "benefitCategories" && !hasBenefitCategoryChanges)
            }
            className="flex justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 sm:w-auto"
          >
            {updating
              ? "Saving..."
              : activeTab === "benefitCategories"
                ? "Save Categories"
                : "Save Changes"}
          </button>
        </div>
      </Modal>

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

      <PlanBenefitSelectionModal
        isOpen={showBenefitSelectionModal}
        closeModal={() => {
          setShowBenefitSelectionModal(false);
          setSelectedCategoryForBenefits(null);
        }}
        planId={plan?.id || null}
        benefitCategoryId={selectedCategoryForBenefits?.id || null}
        benefitCategoryName={selectedCategoryForBenefits?.name}
        initialBenefitIds={
          selectedCategoryForBenefits?.id
            ? planBenefitsByCategory[selectedCategoryForBenefits.id] || []
            : []
        }
        onSuccess={(benefitIds, benefits) => {
          const categoryId = selectedCategoryForBenefits?.id;
          const categoryName = selectedCategoryForBenefits?.name;
          if (categoryId) {
            const updatedBenefits = [
              ...planBenefits.filter(
                (benefit) => String(benefit.benefitCategoryId) !== categoryId,
              ),
              ...benefits,
            ];
            setPlanBenefits(updatedBenefits);
            setPlanBenefitsByCategory((current) => ({
              ...current,
              [categoryId]: benefitIds,
            }));
            if (plan) {
              onUpdated?.({ ...plan, benefits: updatedBenefits });
            }
            setBenefitFlowMessage({
              title: `Benefits saved${
                categoryName ? ` for ${categoryName}` : ""
              }.`,
              description:
                "Continue by choosing benefits for another saved category, or close when you are finished.",
            });
          }
          setShowBenefitSelectionModal(false);
          setSelectedCategoryForBenefits(null);
        }}
      />
    </>
  );
};

export default ViewPlanModal;
