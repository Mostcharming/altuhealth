"use client";

import { Modal } from "@/components/ui/modal";
import capitalizeWords from "@/lib/capitalize";
import { formatDate, formatPrice } from "@/lib/formatDate";
import React from "react";

interface Benefit {
  id: string;
  benefitName: string;
  benefitType: string;
  coverageAmount?: number;
  currency?: string;
  limitPerAnnum?: number;
  amountUtilized?: number;
  remainingBalance?: number;
  status: "active" | "inactive" | "pending" | "expired";
  startDate?: string;
  endDate?: string;
  provider?: string;
  description?: string;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "inactive":
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "expired":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const calculateUtilizationPercentage = () => {
    if (!benefit.coverageAmount || benefit.coverageAmount === 0) return 0;
    return Math.round(
      ((benefit.amountUtilized ?? 0) / benefit.coverageAmount) * 100
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        {/* Status and Benefit Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              Status
            </label>
            <div className="mt-2">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  benefit.status
                )}`}
              >
                {capitalizeWords(benefit.status)}
              </span>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              Benefit Type
            </label>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              {benefit.benefitType || "-"}
            </p>
          </div>
        </div>

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
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Coverage Amount
              </label>
              <p className="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                {formatPrice(benefit.coverageAmount ?? 0, benefit.currency)}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Limit Per Annum
              </label>
              <p className="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                {formatPrice(benefit.limitPerAnnum ?? 0, benefit.currency)}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Amount Utilized
              </label>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                {formatPrice(benefit.amountUtilized ?? 0, benefit.currency)}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Remaining Balance
              </label>
              <p className="mt-2 text-sm font-semibold text-green-600 dark:text-green-400">
                {formatPrice(benefit.remainingBalance ?? 0, benefit.currency)}
              </p>
            </div>
          </div>

          {/* Utilization Progress */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Coverage Utilization
              </label>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {calculateUtilizationPercentage()}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  calculateUtilizationPercentage() > 75
                    ? "bg-red-500"
                    : calculateUtilizationPercentage() > 50
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${calculateUtilizationPercentage()}%` }}
              />
            </div>
          </div>
        </div>

        {/* Period Information */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
          <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Period Information
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefit.startDate && (
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Start Date
                </label>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  {formatDate(benefit.startDate)}
                </p>
              </div>
            )}
            {benefit.endDate && (
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  End Date
                </label>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  {formatDate(benefit.endDate)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Provider Information */}
        {benefit.provider && (
          <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Provider Information
            </h5>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Provider
              </label>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                {benefit.provider}
              </p>
            </div>
          </div>
        )}

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
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 font-mono">
                {benefit.id}
              </p>
            </div>
            {benefit.createdAt && (
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Created Date
                </label>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  {formatDate(benefit.createdAt)}
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
