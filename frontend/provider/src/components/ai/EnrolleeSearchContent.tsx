"use client";

import Loading from "@/app/loading";

interface EnrolleeData {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  policyNumber?: string;
}

interface EnrolleeSearchContentProps {
  selectedEnrollee?: EnrolleeData | null;
  isLoading?: boolean;
}

export default function EnrolleeSearchContent({
  selectedEnrollee,
  isLoading = false,
}: EnrolleeSearchContentProps) {
  if (isLoading || selectedEnrollee) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
      <div className="relative">
        <div className="flex flex-col items-center">
          <div
            className="mb-4"
            style={{ animation: "pulse-horizontal 2s ease-in-out infinite" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-brand-500"
            >
              <polyline points="9 6 15 12 9 18"></polyline>
            </svg>
            <style>{`
              @keyframes pulse-horizontal {
                0%, 100% { transform: translateX(0); }
                50% { transform: translateX(8px); }
              }
            `}</style>
          </div>

          <h3 className="text-2xl font-bold text-gray-800 dark:text-white/90 mb-2">
            Search for an Enrollee
          </h3>

          <p className="text-gray-600 dark:text-gray-400 max-w-sm mb-4">
            Use the search box by the right to find an enrollee/dependent by
            their policy number or email address. Their details will appear
            here.
          </p>

          <div className="grid grid-cols-2 gap-4 mt-8 max-w-sm text-left">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start space-x-3">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                    By Policy Number
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    e.g., AHL-123456
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-start space-x-3">
                <svg
                  className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                    By Email
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    e.g., john@example.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
