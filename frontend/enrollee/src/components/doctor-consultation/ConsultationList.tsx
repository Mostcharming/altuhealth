"use client";
import Image from "next/image";

interface ConsultationListProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  profileImage: string;
  status: "online" | "offline";
  lastActive: string;
  isActive: boolean;
}

const doctors: Doctor[] = [
  {
    id: 1,
    name: "Dr. AltuHealth",
    specialty: "General Practitioner",
    profileImage: "/images/main/small.svg",
    status: "online",
    lastActive: "Active now",
    isActive: true,
  },
];

export default function ConsultationList({
  isOpen,
  onToggle,
}: ConsultationListProps) {
  return (
    <div
      className={`flex-col overflow-auto no-scrollbar transition-all duration-300 ${
        isOpen
          ? "fixed top-0 left-0 z-999999 h-screen bg-white dark:bg-gray-900"
          : "hidden xl:flex"
      }`}
    >
      <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800 xl:hidden">
        <div>
          <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            Consultations
          </h3>
        </div>
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-10 h-10 text-gray-700 transition border border-gray-300 rounded-full dark:border-gray-700 dark:text-gray-400 dark:hover:text-white/90"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
      <div className="flex flex-col max-h-full px-4 overflow-auto sm:px-5">
        <div className="max-h-full space-y-1 overflow-auto custom-scrollbar">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className={`flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors ${
                doctor.isActive
                  ? "bg-brand-50 dark:bg-brand-500/10"
                  : "hover:bg-gray-100 dark:hover:bg-white/[0.03]"
              }`}
              onClick={onToggle}
            >
              <div className="relative h-12 w-full max-w-[48px]">
                <Image
                  width={48}
                  height={48}
                  src={doctor.profileImage}
                  alt={doctor.name}
                  className="object-cover object-center w-full h-full overflow-hidden rounded-full"
                />
                <span
                  className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full border-[1.5px] ${
                    doctor.status === "online"
                      ? "border-white bg-success-500 dark:border-gray-900"
                      : "border-white bg-gray-400 dark:border-gray-900"
                  }`}
                ></span>
              </div>
              <div className="w-full min-w-0">
                <h5 className="text-sm font-medium text-gray-800 dark:text-white/90 truncate">
                  {doctor.name}
                </h5>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {doctor.specialty}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {doctor.lastActive}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
