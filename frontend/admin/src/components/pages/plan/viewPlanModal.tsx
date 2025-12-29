/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import { Modal } from "@/components/ui/modal";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { useModal } from "@/hooks/useModal";
import { apiClient } from "@/lib/apiClient";
import {
  addBenefitCategory,
  addExclusion,
  addProvider,
  removeBenefitCategory,
  removeExclusion,
  removeProvider,
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
}

const CheckboxItem: React.FC<{
  id: string;
  label: string;
  checked: boolean;
  onChange: (id: string) => void;
}> = ({ id, label, checked, onChange }) => (
  <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm dark:border-gray-800 dark:bg-white/5">
    <label
      htmlFor={`item${id}`}
      className="flex items-center w-full cursor-pointer gap-3"
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
      <p className="text-base text-gray-800 dark:text-white/90">{label}</p>
    </label>
  </div>
);

const ViewPlanModal: React.FC<ViewPlanModalProps> = ({
  isOpen,
  closeModal,
  plan,
}) => {
  const [activeTab, setActiveTab] = useState<string>("benefitCategories");
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const errorModal = useModal();
  const successModal = useModal();

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
        }
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
        `/admin/plans/${plan.id}?include=benefitCategories,exclusions,providers`,
        {
          method: "GET",
        }
      );

      const planData = response?.data;

      if (
        planData?.benefitCategories &&
        Array.isArray(planData.benefitCategories)
      ) {
        const benefitCategoryIds = planData.benefitCategories.map((bc: any) =>
          String(bc.id)
        );
        setSelectedBenefitCategories(benefitCategoryIds);
        setInitialBenefitCategories(benefitCategoryIds);
      }

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

  const toggleBenefitCategory = (categoryId: string) => {
    setSelectedBenefitCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleExclusion = (exclusionId: string) => {
    setSelectedExclusions((prev) =>
      prev.includes(exclusionId)
        ? prev.filter((id) => id !== exclusionId)
        : [...prev, exclusionId]
    );
  };

  const toggleProvider = (providerId: string) => {
    setSelectedProviders((prev) =>
      prev.includes(providerId)
        ? prev.filter((id) => id !== providerId)
        : [...prev, providerId]
    );
  };

  const handleUpdateBenefitCategories = async () => {
    if (!plan) return;
    try {
      setUpdating(true);

      // Remove items that were deselected
      for (const categoryId of initialBenefitCategories) {
        if (!selectedBenefitCategories.includes(categoryId)) {
          try {
            await removeBenefitCategory(plan.id, categoryId);
          } catch (err) {
            console.warn(
              `Failed to remove benefit category ${categoryId}`,
              err
            );
          }
        }
      }

      // Add items that were newly selected
      for (const categoryId of selectedBenefitCategories) {
        if (!initialBenefitCategories.includes(categoryId)) {
          try {
            await addBenefitCategory(plan.id, categoryId);
          } catch (err) {
            console.warn(`Failed to add benefit category ${categoryId}`, err);
          }
        }
      }

      setInitialBenefitCategories(selectedBenefitCategories);
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
        err instanceof Error ? err.message : "An unexpected error occurred."
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
        err instanceof Error ? err.message : "An unexpected error occurred."
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
        setSelectedBenefitCategories([]);
      } else if (activeTab === "exclusions") {
        setSelectedExclusions([]);
      } else {
        setSelectedProviders([]);
      }
    } else {
      // Select all
      if (activeTab === "benefitCategories") {
        setSelectedBenefitCategories(
          allBenefitCategories.map((bc) => String(bc.id))
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
        bc.name.toLowerCase().includes(lower)
      );
    } else if (activeTab === "exclusions") {
      return allExclusions.filter((e) =>
        e.description.toLowerCase().includes(lower)
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

        {/* Tab Content */}

        <div></div>

        <div className="mb-6">
          {loading ? (
            <SpinnerThree />
          ) : allItems.length === 0 ? (
            <p className="text-sm text-gray-500">{getEmptyMessage()}</p>
          ) : (
            <>
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
                    checked={selectedIds.includes(String(item.id))}
                    onChange={() => getToggleHandler(String(item.id))()}
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
            disabled={updating}
            className="flex justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 sm:w-auto"
          >
            {updating ? "Saving..." : "Save Changes"}
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
    </>
  );
};

export default ViewPlanModal;
