"use client";
import React, { useState } from "react";
import EnrolleeAuthorizationCodesTable from "./enrolleeAuthorizationCodesTable";
import EnrolleeBenefitsTable from "./enrolleeBenefitsTable";
import EnrolleeMedicalHistoryTable from "./enrolleeMedicalHistoryTable";

interface TabItem {
  key: string;
  title: string;
}

const DefaultTab: React.FC<{ id: string }> = ({ id }) => {
  const [activeTab, setActiveTab] = useState<string>("benefit");

  const tabs: TabItem[] = [
    {
      key: "benefit",
      title: "Benefits details",
    },
    {
      key: "medical",
      title: "Medical History",
    },
    // { key: "authorization", title: "Authorization Codes" },
  ];

  return (
    <div>
      <div className="p-3 border border-gray-200 rounded-t-xl dark:border-gray-800">
        <nav className="flex overflow-x-auto rounded-lg bg-gray-100 p-1 dark:bg-gray-900 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-white dark:[&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ease-in-out ${
                activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-theme-xs dark:bg-white/[0.03] dark:text-white"
                  : "bg-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              {tab.title}
            </button>
          ))}
        </nav>
      </div>
      <div className="p-6 pt-4 border border-t-0 border-gray-200 rounded-b-xl dark:border-gray-800">
        {/* Tab Content */}

        {tabs.map(
          (tab) =>
            activeTab === tab.key && (
              <div key={tab.key}>
                {tab.key === "benefit" && (
                  <div>
                    <EnrolleeBenefitsTable enrolleeId={id} />
                  </div>
                )}
                {tab.key === "medical" && (
                  <div>
                    <EnrolleeMedicalHistoryTable enrolleeId={id} />
                  </div>
                )}
                {tab.key === "authorization" && (
                  <div>
                    <EnrolleeAuthorizationCodesTable enrolleeId={id} />
                  </div>
                )}
              </div>
            )
        )}
      </div>
    </div>
  );
};

export default DefaultTab;
