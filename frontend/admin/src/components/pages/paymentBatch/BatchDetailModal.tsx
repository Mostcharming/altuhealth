"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Modal } from "@/components/ui/modal";
import capitalizeWords from "@/lib/capitalize";
import { formatPrice } from "@/lib/formatDate";
import React, { useState } from "react";

interface ClaimsDetail {
  id: string;
  claimNumber?: string;
  amount?: number;
  status?: string;
  [key: string]: any;
}

interface ConflictDetail {
  id: string;
  type?: string;
  description?: string;
  severity?: string;
  [key: string]: any;
}

interface BatchDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  detail: any;
  claims?: ClaimsDetail[];
  conflicts?: ConflictDetail[];
}

const BatchDetailModal: React.FC<BatchDetailModalProps> = ({
  isOpen,
  onClose,
  detail,
  claims = [],
  conflicts = [],
}) => {
  const [activeTab, setActiveTab] = useState<"claims" | "conflicts">("claims");

  const tabs = [
    { key: "claims", label: "Claims Info" },
    { key: "conflicts", label: "Conflicts Info" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[900px] p-5 lg:p-10 m-4"
    >
      <div className="px-2">
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Batch Details -{" "}
          {capitalizeWords(detail?.provider?.name || detail?.providerId)}
        </h4>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
          Period: {detail?.period}
        </p>
      </div>

      {/* Tabs */}
      <div className="p-3 border border-gray-200 rounded-t-xl dark:border-gray-800">
        <nav className="flex overflow-x-auto rounded-lg bg-gray-100 p-1 dark:bg-gray-900 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-white dark:[&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as "claims" | "conflicts")}
              className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ease-in-out ${
                activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-theme-xs dark:bg-white/[0.03] dark:text-white"
                  : "bg-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6 pt-4 border border-t-0 border-gray-200 rounded-b-xl dark:border-gray-800 max-h-[70vh] overflow-y-auto custom-scrollbar">
        {/* Tab Content */}

        {tabs.map(
          (tab) =>
            activeTab === tab.key && (
              <div key={tab.key}>
                {tab.key === "claims" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Claims Count
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {detail?.claimsCount || 0}
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Claims Amount
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatPrice(detail?.claimsAmount) ?? "0.00"}
                        </p>
                      </div>
                    </div>

                    {claims && claims.length > 0 ? (
                      <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                              <th className="p-3 text-left text-xs font-medium text-gray-700 dark:text-gray-400">
                                Claim Number
                              </th>
                              <th className="p-3 text-left text-xs font-medium text-gray-700 dark:text-gray-400">
                                Amount
                              </th>
                              <th className="p-3 text-left text-xs font-medium text-gray-700 dark:text-gray-400">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {claims.map((claim) => (
                              <tr
                                key={claim.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800"
                              >
                                <td className="p-3 text-gray-700 dark:text-gray-400">
                                  {claim.claimNumber || "N/A"}
                                </td>
                                <td className="p-3 text-gray-700 dark:text-gray-400">
                                  {formatPrice(claim.amount || 0) ?? "0.00"}
                                </td>
                                <td className="p-3">
                                  <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                    {capitalizeWords(claim.status || "pending")}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400">
                          No claims data available
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {tab.key === "conflicts" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Reconciliation Count
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {detail?.reconciliationCount || 0}
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Reconciliation Amount
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatPrice(detail?.reconciliationAmount) ?? "0.00"}
                        </p>
                      </div>
                    </div>

                    {conflicts && conflicts.length > 0 ? (
                      <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                              <th className="p-3 text-left text-xs font-medium text-gray-700 dark:text-gray-400">
                                Type
                              </th>
                              <th className="p-3 text-left text-xs font-medium text-gray-700 dark:text-gray-400">
                                Description
                              </th>
                              <th className="p-3 text-left text-xs font-medium text-gray-700 dark:text-gray-400">
                                Severity
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {conflicts.map((conflict) => (
                              <tr
                                key={conflict.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800"
                              >
                                <td className="p-3 text-gray-700 dark:text-gray-400">
                                  {capitalizeWords(conflict.type || "unknown")}
                                </td>
                                <td className="p-3 text-gray-700 dark:text-gray-400">
                                  {conflict.description || "N/A"}
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                      conflict.severity === "high"
                                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                        : conflict.severity === "medium"
                                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                        : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    }`}
                                  >
                                    {capitalizeWords(
                                      conflict.severity || "low"
                                    )}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400">
                          No conflicts data available
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default BatchDetailModal;
