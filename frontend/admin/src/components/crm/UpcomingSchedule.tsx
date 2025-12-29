"use client";
import { UpcomingSessionData } from "@/hooks/useAnalyticsDashboardData";
import { MoreDotIcon } from "@/icons";
import { useState } from "react";
import Badge from "../ui/badge/Badge";

interface UpcomingScheduleProps {
  data?: UpcomingSessionData[];
  isLoading?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Scheduled":
      return "warning";
    case "Confirmed":
      return "success";
    case "Completed":
      return "success";
    case "Cancelled":
      return "error";
    default:
      return "warning";
  }
};

export default function UpcomingSchedule({
  data = [],
  isLoading = false,
}: UpcomingScheduleProps) {
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  // ...existing code...
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Upcoming Session with Doctors
        </h3>

        <div className="relative h-fit">
          <button onClick={toggleDropdown} className="dropdown-toggle">
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
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

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[500px] xl:min-w-full">
          <div className="flex flex-col gap-2">
            {isLoading ? (
              <p className="text-center text-gray-500 py-4">
                Loading sessions...
              </p>
            ) : data.length > 0 ? (
              data.map((session) => (
                <div
                  key={session.id}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {session.doctorName}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {session.specialty}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
                        {session.sessionDate} at {session.sessionTime}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Patient: {session.patientName}
                      </p>
                    </div>
                    <Badge size="sm" color={getStatusColor(session.status)}>
                      {session.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">
                No upcoming sessions
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
