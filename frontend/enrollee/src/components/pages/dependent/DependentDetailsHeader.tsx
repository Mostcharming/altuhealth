"use client";

interface DependentDetailsHeaderProps {
  data: {
    firstName?: string;
    lastName?: string;
    policyNumber?: string;
    isActive?: boolean;
  } | null;
}

export default function DependentDetailsHeader({
  data,
}: DependentDetailsHeaderProps) {
  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
  };

  return (
    <div className="flex flex-col justify-between gap-6 rounded-2xl border border-gray-200 bg-white px-6 py-5 sm:flex-row sm:items-center dark:border-gray-800 dark:bg-white/3">
      <div className="flex flex-col gap-2">
        <h4 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          {data?.firstName} {data?.lastName}
        </h4>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Policy Number:{" "}
            <span className="font-semibold">{data?.policyNumber}</span>
          </span>
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
              data?.isActive ?? true
            )}`}
          >
            {data?.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <div className="flex gap-3"></div>
    </div>
  );
}
