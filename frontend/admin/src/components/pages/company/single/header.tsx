/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import capitalizeWords from "@/lib/capitalize";
import { formatDate } from "@/lib/formatDate";

export default function SinglePHeader({ data }: { data: any }) {
  return (
    <>
      <div className="flex flex-col justify-between gap-6 rounded-2xl border border-gray-200 bg-white px-6 py-5 sm:flex-row sm:items-center dark:border-gray-800 dark:bg-white/3">
        <div className="flex flex-col gap-2.5 divide-gray-300 sm:flex-row sm:divide-x dark:divide-gray-700">
          <div className="flex items-center gap-2 sm:pr-3">
            <span className="text-base font-medium text-gray-700 dark:text-gray-400">
              Name: {capitalizeWords(data?.name)}
            </span>
            {/* <span className={getStatusClasses(data?.status)}>
              {capitalizeWords(data?.status)}
            </span> */}
          </div>
          <p className="text-sm text-gray-500 sm:pl-3 dark:text-gray-400">
            Created date: {formatDate(data?.createdAt)}
          </p>
        </div>
        <div className="flex gap-3">
          {/* <button
            onClick={handleStatusToggle}
            disabled={loading}
            className={getButtonClasses(data?.status)}
          >
            {loading ? "Processing..." : getButtonText()}
          </button> */}
        </div>
      </div>
    </>
  );
}
