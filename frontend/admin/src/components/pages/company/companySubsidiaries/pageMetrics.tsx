"use client";

import { useModal } from "@/hooks/useModal";
import React from "react";
import EditCompanySubsidiary from "./editCompanySubsidiary";

interface CompanySubsidiariesPageMetricsProps {
  companyId: string;
  onSubsidiaryAdded?: () => void;
}

const CompanySubsidiariesPageMetrics: React.FC<
  CompanySubsidiariesPageMetricsProps
> = ({ companyId, onSubsidiaryAdded }) => {
  const { isOpen, openModal, closeModal } = useModal();

  const handleCloseModal = () => {
    closeModal();
    onSubsidiaryAdded?.();
  };

  return (
    <div className="p-4 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className=" flex items-center justify-between">
        <div></div>
        <div>
          <div
            onClick={openModal}
            className="cursor-pointer bg-brand-500 shadow-theme-xs hover:bg-brand-600 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M5 10.0002H15.0006M10.0002 5V15.0006"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Create Subsidiary
          </div>
        </div>
      </div>

      <EditCompanySubsidiary
        isOpen={isOpen}
        closeModal={handleCloseModal}
        subsidiary={null}
        companyId={companyId}
        onSuccess={onSubsidiaryAdded}
      />
    </div>
  );
};

export default CompanySubsidiariesPageMetrics;
