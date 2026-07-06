"use client";

import { ActivityData } from "@/hooks/useFinanceDashboardData";
import { useState } from "react";
import { MoreDotIcon } from "../../icons";

interface ActivitiesCardProps {
  data?: ActivityData[];
  isLoading?: boolean;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "claim":
      return "📋";
    case "invoice":
      return "🧾";
    case "payment":
      return "💳";
    case "system":
      return "⚙️";
    default:
      return "📌";
  }
};

export default function ActivitiesCard({
  data = [],
  isLoading = false,
}: ActivitiesCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
        <div className="mb-6 flex justify-between">
          <div className="h-6 bg-gray-200 rounded dark:bg-gray-700 w-28" />
          <div className="w-8 h-8 bg-gray-200 rounded dark:bg-gray-700" />
        </div>
        <div className="space-y-3">
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-full mb-2" />
            <div className="h-3 bg-gray-200 rounded dark:bg-gray-700 w-20" />
          </div>
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-full mb-2" />
            <div className="h-3 bg-gray-200 rounded dark:bg-gray-700 w-20" />
          </div>
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-full mb-2" />
            <div className="h-3 bg-gray-200 rounded dark:bg-gray-700 w-20" />
          </div>
        </div>
      </div>
    );
  }

  // ...existing code...
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Activities
          </h3>
        </div>
        <div className="relative inline-block">
          <button className="dropdown-toggle" onClick={toggleDropdown}>
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
          </button>
          {/* <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-40 p-2"
          >
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              View More
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Delete
            </DropdownItem>
          </Dropdown> */}
        </div>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        {data.length > 0 ? (
          data.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50"
            >
              <span className="text-lg">{getActivityIcon(activity.type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {activity.timestamp}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="relative py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No activities yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
