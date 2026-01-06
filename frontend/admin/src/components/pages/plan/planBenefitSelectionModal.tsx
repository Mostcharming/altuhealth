"use client";

import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import { Modal } from "@/components/ui/modal";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { useModal } from "@/hooks/useModal";
import {
  addBenefitToPlan,
  Benefit,
  fetchBenefitsByCategory,
  removeBenefitFromPlan,
} from "@/lib/apis/benefit";
import React, { useCallback, useEffect, useState } from "react";

interface BenefitSelectionModalProps {
  isOpen: boolean;
  closeModal: () => void;
  planId: string | null;
  benefitCategoryId: string | null;
  benefitCategoryName?: string;
  onSuccess?: () => void;
}

const BenefitCheckboxItem: React.FC<{
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (id: string) => void;
}> = ({ id, label, description, checked, onChange }) => (
  <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-800 dark:bg-white/5">
    <label
      htmlFor={`benefit${id}`}
      className="flex items-start w-full cursor-pointer gap-3"
    >
      <input
        type="checkbox"
        id={`benefit${id}`}
        className="sr-only"
        checked={checked}
        onChange={() => onChange(id)}
      />
      <div
        className={`flex items-center justify-center w-5 h-5 border rounded-md transition-colors duration-200 mt-1 flex-shrink-0 ${
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
      <div className="flex-1 min-w-0">
        <p className="text-base font-medium text-gray-800 dark:text-white/90">
          {label}
        </p>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </label>
  </div>
);

const PlanBenefitSelectionModal: React.FC<BenefitSelectionModalProps> = ({
  isOpen,
  closeModal,
  planId,
  benefitCategoryId,
  benefitCategoryName = "Benefit Category",
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const errorModal = useModal();
  const successModal = useModal();

  const [allBenefits, setAllBenefits] = useState<Benefit[]>([]);
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const [initialBenefits, setInitialBenefits] = useState<string[]>([]);

  const fetchBenefits = useCallback(async () => {
    if (!benefitCategoryId) return;

    try {
      setLoading(true);
      const response = await fetchBenefitsByCategory(benefitCategoryId);
      const items =
        response?.data?.list && Array.isArray(response.data.list)
          ? response.data.list
          : Array.isArray(response)
          ? response
          : [];
      setAllBenefits(items);
    } catch (err) {
      console.warn("Failed to fetch benefits", err);
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to fetch benefits"
      );
      errorModal.openModal();
    } finally {
      setLoading(false);
    }
  }, [benefitCategoryId, errorModal]);

  useEffect(() => {
    if (isOpen && benefitCategoryId) {
      fetchBenefits();
    }
  }, [benefitCategoryId]);

  const toggleBenefit = (benefitId: string) => {
    setSelectedBenefits((prev) =>
      prev.includes(benefitId)
        ? prev.filter((id) => id !== benefitId)
        : [...prev, benefitId]
    );
  };

  const handleSaveBenefits = async () => {
    if (!planId) return;

    try {
      setUpdating(true);

      // Remove benefits that were deselected
      for (const benefitId of initialBenefits) {
        if (!selectedBenefits.includes(benefitId)) {
          try {
            await removeBenefitFromPlan(planId, benefitId);
          } catch (err) {
            console.warn(`Failed to remove benefit ${benefitId}`, err);
          }
        }
      }

      // Add benefits that were newly selected
      for (const benefitId of selectedBenefits) {
        if (!initialBenefits.includes(benefitId)) {
          try {
            await addBenefitToPlan(planId, benefitId);
          } catch (err) {
            console.warn(`Failed to add benefit ${benefitId}`, err);
          }
        }
      }

      setInitialBenefits(selectedBenefits);
      successModal.openModal();
      if (onSuccess) {
        onSuccess();
      }
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
      selectedBenefits.length === allBenefits.length && allBenefits.length > 0;

    if (isAllSelected) {
      setSelectedBenefits([]);
    } else {
      setSelectedBenefits(allBenefits.map((b) => String(b.id)));
    }
  };

  const filteredBenefits = allBenefits.filter((benefit) =>
    benefit.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAllSelected =
    selectedBenefits.length === allBenefits.length && allBenefits.length > 0;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[600px] p-4 lg:p-6 m-4"
      >
        <div className="px-2 mb-6">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Select Benefits
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Choose which benefits from <strong>{benefitCategoryName}</strong>{" "}
            category to add to this plan.
          </p>
        </div>

        <div className="mb-6">
          {loading ? (
            <SpinnerThree />
          ) : allBenefits.length === 0 ? (
            <p className="text-sm text-gray-500">
              No benefits available in this category.
            </p>
          ) : (
            <>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search benefits..."
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
                {filteredBenefits.map((benefit) => (
                  <BenefitCheckboxItem
                    key={benefit.id}
                    id={String(benefit.id)}
                    label={benefit.name}
                    description={benefit.description}
                    checked={selectedBenefits.includes(String(benefit.id))}
                    onChange={() => toggleBenefit(String(benefit.id))}
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
            onClick={handleSaveBenefits}
            disabled={updating}
            className="flex justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 sm:w-auto"
          >
            {updating ? "Saving..." : "Save Benefits"}
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

export default PlanBenefitSelectionModal;
