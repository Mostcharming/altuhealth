"use client";
import { MoreDotIcon } from "@/icons";
import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

interface Appointment {
  id: number;
  title: string;
  date: string;
  time: string;
  enrolleeName: string;
}

interface UpcomingScheduleProps {
  data?: Appointment[];
  isLoading?: boolean;
}

const defaultData: Appointment[] = [];

export default function UpcomingSchedule({
  data = defaultData,
  isLoading = false,
}: UpcomingScheduleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const appointments = data || defaultData;

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Upcoming Appointments
        </h3>

        <div className="relative h-fit">
          <button onClick={toggleDropdown} className="dropdown-toggle">
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
          <Dropdown
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
          </Dropdown>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[500px] xl:min-w-full">
          <div className="flex flex-col gap-2">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-theme-sm">
                Loading appointments...
              </div>
            ) : appointments.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-theme-sm">
                No upcoming appointments scheduled
              </div>
            ) : (
              appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-800 dark:text-white/90">
                        {appointment.title}
                      </h5>
                      <p className="text-theme-sm text-gray-500 dark:text-gray-400">
                        {appointment.enrolleeName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                        {new Date(appointment.date).toLocaleDateString()}
                      </p>
                      <p className="text-theme-xs text-gray-500 dark:text-gray-400">
                        {appointment.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
