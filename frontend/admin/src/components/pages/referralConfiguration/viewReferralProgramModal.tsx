"use client";

import { Modal } from "@/components/ui/modal";
import { formatDate } from "@/lib/formatDate";

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

interface ViewReferralProgramModalProps {
  isOpen: boolean;
  closeModal: () => void;
  program?: ReferralProgram | null;
}

export default function ViewReferralProgramModal({
  isOpen,
  closeModal,
  program,
}: ViewReferralProgramModalProps) {
  if (!program) return null;

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

  return (
    <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
      <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {program.name}
          </h4>
          {program.description && (
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              {program.description}
            </p>
          )}
        </div>

        <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 space-y-6 pb-3">
          {/* Status Badge */}
          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
              Status
            </p>
            <span
              className={`inline-block rounded-full px-3 py-1 text-sm font-semibold capitalize ${getStatusColor(
                program.status
              )}`}
            >
              {program.status}
            </span>
          </div>

          {/* Reward Configuration */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Reward Type
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90 capitalize">
                {program.rewardType}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                {program.rewardType === "fixed" ? "Fixed Rate" : "Percentage"}
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {program.rewardType === "fixed"
                  ? `₦${Number(program.fixedRate).toLocaleString()}`
                  : `${program.percentageRate}%`}
              </p>
            </div>
          </div>

          {/* Minimums and Caps */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Minimum Payout
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                ₦{Number(program.minimumPayout).toLocaleString()}
              </p>
            </div>
            {program.capAmount && (
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Cap Amount
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  ₦{Number(program.capAmount).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Duration */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Start Date
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formatDate(program.startDate)}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                End Date
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {program.endDate ? formatDate(program.endDate) : "Ongoing"}
              </p>
            </div>
          </div>

          {/* Limits */}
          {(program.maxReferralsPerReferrer || program.maxTotalPayout) && (
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              {program.maxReferralsPerReferrer && (
                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Max Referrals Per Referrer
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {program.maxReferralsPerReferrer}
                  </p>
                </div>
              )}
              {program.maxTotalPayout && (
                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Max Total Payout
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    ₦{Number(program.maxTotalPayout).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Metadata */}
          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
              Created Date
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {formatDate(program.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-2 mt-6 border-t border-gray-200 pt-6 dark:border-gray-800 lg:justify-end">
          <button
            onClick={closeModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
