"use client";

import { Modal } from "@/components/ui/modal";
import React from "react";

interface Benefit {
  id: string;
  name: string;
  benefitCategory?: string;
  benefitCategoryId?: string;
  isCovered: boolean;
  description?: string;
  coverageType?:
    | "times_per_year"
    | "times_per_month"
    | "quarterly"
    | "unlimited"
    | "amount_based"
    | "limit_based";
  coverageValue?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface BenefitDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  benefit: Benefit | null;
}

const BenefitDetailModal: React.FC<BenefitDetailModalProps> = ({
  isOpen,
  onClose,
  benefit,
}) => {
  if (!benefit) return null;

  const getStatusColor = (isCovered: boolean) => {
    return isCovered
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        {/* Benefit Name and Coverage Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              Benefit Name
            </label>
            <p className="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              {benefit.name}
            </p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              Coverage Status
            </label>
            <div className="mt-2">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  benefit.isCovered
                )}`}
              >
                {benefit.isCovered ? "Covered" : "Not Covered"}
              </span>
            </div>
          </div>
        </div>

        {/* Benefit Category */}
        {benefit.benefitCategory && (
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              Category
            </label>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              {benefit.benefitCategory}
            </p>
          </div>
        )}

        {/* Description */}
        {benefit.description && (
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              Description
            </label>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              {benefit.description}
            </p>
          </div>
        )}

        {/* Coverage Information */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
          <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Coverage Details
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefit.coverageType && (
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Coverage Type
                </label>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  {benefit.coverageType.replace(/_/g, " ")}
                </p>
              </div>
            )}
            {benefit.coverageValue && (
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Coverage Value
                </label>
                <p className="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {benefit.coverageValue}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Details */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
          <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Additional Details
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Benefit ID
              </label>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 font-mono break-all">
                {benefit.id}
              </p>
            </div>
            {benefit.createdAt && (
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Created Date
                </label>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  {new Date(benefit.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}
            {benefit.updatedAt && (
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Updated Date
                </label>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  {new Date(benefit.updatedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BenefitDetailModal;
