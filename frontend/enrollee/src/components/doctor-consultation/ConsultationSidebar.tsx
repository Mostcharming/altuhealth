"use client";
import { useState } from "react";
import ConsultationHeader from "./ConsultationHeader";
import ConsultationList from "./ConsultationList";

export default function ConsultationSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 transition-all duration-300 bg-gray-900/50 z-999999"
          onClick={toggleSidebar}
        ></div>
      )}
      <div className="flex-col rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] xl:flex xl:w-1/4">
        <ConsultationHeader onToggle={toggleSidebar} />
        <ConsultationList isOpen={isOpen} onToggle={toggleSidebar} />
      </div>
    </>
  );
}
