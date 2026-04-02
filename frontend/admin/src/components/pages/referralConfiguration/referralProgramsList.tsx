"use client";

import { referralProgramAPI } from "@/lib/apis/referral";
import { useState } from "react";

interface ReferralProgram {
  id: string;
  name: string;
  description?: string;
  status: "active" | "inactive" | "paused";
  rewardType: "fixed" | "percentage";
  fixedRate?: number;
  percentageRate?: number;
  capAmount?: number;
  minimumPayout: number;
  startDate: string;
  endDate?: string;
  maxReferralsPerReferrer?: number;
  maxTotalPayout?: number;
  picture?: string;
  createdAt: string;
}

const ReferralProgramsList = () => {
  const [programs, setPrograms] = useState<ReferralProgram[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProgram, setSelectedProgram] =
    useState<ReferralProgram | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const data = await referralProgramAPI.listPrograms();
      if (data.success) {
        setPrograms(data.data.programs);
      }
    } catch (error) {
      console.error("Error fetching programs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (programId: string, newStatus: string) => {
    try {
      const data = await referralProgramAPI.updateProgramStatus(
        programId,
        newStatus
      );
      if (data.success) {
        setPrograms((prev) =>
          prev.map((p) =>
            p.id === programId
              ? { ...p, status: newStatus as "active" | "inactive" | "paused" }
              : p
          )
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      case "paused":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  useState(() => {
    fetchPrograms();
  });

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : programs.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-gray-200 dark:border-gray-800">
          <p className="text-gray-600 dark:text-gray-400">
            No referral programs found
          </p>
        </div>
      ) : (
        programs.map((program) => (
          <div
            key={program.id}
            className="p-6 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {program.name}
                </h3>
                {program.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {program.description}
                  </p>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <select
                  value={program.status}
                  onChange={(e) =>
                    handleStatusChange(program.id, e.target.value)
                  }
                  className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${getStatusColor(
                    program.status
                  )}`}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="paused">Paused</option>
                </select>
                <button
                  onClick={() => {
                    setSelectedProgram(program);
                    setIsEditing(true);
                  }}
                  className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm hover:bg-brand-600"
                >
                  Edit
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Reward Type
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                  {program.rewardType}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {program.rewardType === "fixed" ? "Fixed Rate" : "Percentage"}
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {program.rewardType === "fixed"
                    ? `₦${Number(program.fixedRate).toLocaleString()}`
                    : `${program.percentageRate}%`}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Minimum Payout
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  ₦{Number(program.minimumPayout).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Active Period
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {new Date(program.startDate).toLocaleDateString()} -{" "}
                  {program.endDate
                    ? new Date(program.endDate).toLocaleDateString()
                    : "Ongoing"}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ReferralProgramsList;
