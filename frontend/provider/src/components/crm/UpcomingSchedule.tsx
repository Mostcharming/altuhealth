"use client";
import { MoreDotIcon } from "@/icons";
import { useState } from "react";
import Checkbox from "../form/input/Checkbox";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

export default function UpcomingSchedule() {
  // Define the state with an index signature for dynamic string keys
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});

  const handleCheckboxChange = (id: string) => {
    setCheckedItems((prevState) => ({
      ...prevState,
      [id]: !prevState[id], // Toggle the checkbox state
    }));
  };

  const [isOpen, setIsOpen] = useState(false);

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
            {/* Appointment 1 */}
            <div className="flex cursor-pointer items-center gap-9 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-white/[0.03]">
              <div className="flex items-start gap-3">
                <div>
                  <Checkbox
                    className="w-5 h-5 rounded-md"
                    checked={checkedItems["apt-001"] || false}
                    onChange={() => handleCheckboxChange("apt-001")}
                  />
                </div>
                <div>
                  <span className="mb-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
                    Wed, 11 Jan • 09:20 AM
                  </span>
                  <span className="font-medium text-gray-700 text-theme-sm dark:text-gray-400">
                    Enrollee: John Doe
                  </span>
                </div>
              </div>
              <div>
                <span className="block mb-1 font-medium text-gray-700 text-theme-sm dark:text-gray-400">
                  Policy #: POL-2025-00123
                </span>
                <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                  Check-up appointment
                </span>
              </div>
            </div>

            {/* Appointment 2 */}
            <div className="flex cursor-pointer items-center gap-9 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-white/[0.03]">
              <div className="flex items-start gap-3">
                <div>
                  <Checkbox
                    className="w-5 h-5 rounded-md"
                    checked={checkedItems["apt-002"] || false}
                    onChange={() => handleCheckboxChange("apt-002")}
                  />
                </div>
                <div>
                  <span className="mb-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
                    Fri, 15 Feb • 10:35 AM
                  </span>
                  <span className="font-medium text-gray-700 text-theme-sm dark:text-gray-400">
                    Enrollee: Jane Smith
                  </span>
                </div>
              </div>
              <div>
                <span className="block mb-1 font-medium text-gray-700 text-theme-sm dark:text-gray-400">
                  Policy #: POL-2025-00456
                </span>
                <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                  Follow-up consultation
                </span>
              </div>
            </div>

            {/* Appointment 3 */}
            <div className="flex cursor-pointer items-center gap-9 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-white/[0.03]">
              <div className="flex items-start gap-3">
                <div>
                  <Checkbox
                    className="w-5 h-5 rounded-md"
                    checked={checkedItems["apt-003"] || false}
                    onChange={() => handleCheckboxChange("apt-003")}
                  />
                </div>
                <div>
                  <span className="mb-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
                    Thu, 18 Mar • 1:15 PM
                  </span>
                  <span className="font-medium text-gray-700 text-theme-sm dark:text-gray-400">
                    Enrollee: Michael Johnson
                  </span>
                </div>
              </div>
              <div>
                <span className="block mb-1 font-medium text-gray-700 text-theme-sm dark:text-gray-400">
                  Policy #: POL-2025-00789
                </span>
                <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                  Annual physical exam
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
