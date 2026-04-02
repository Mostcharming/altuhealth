"use client";

import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { referrerAPI } from "@/lib/apis/referral";
import { capitalizeWords } from "@/lib/capitalize";
import { formatDate, formatPrice } from "@/lib/formatDate";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface RetailEnrollee {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
}

interface Plan {
  id: string;
  name: string;
}

interface Earning {
  id: string;
  retailEnrollee: RetailEnrollee;
  subscriptionAmount: number;
  rewardType: "fixed" | "percentage";
  rewardRate: number;
  earnedAmount: number;
  currency: string;
  status: "pending" | "confirmed" | "withdrawn";
  isWithdrawn: boolean;
  withdrawnAt: string | null;
  plan: Plan;
  subscriptionPeriod: {
    start: string;
    end: string;
  };
  createdAt: string;
}

interface Referrer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  referralCode: string;
  status: "active" | "inactive" | "suspended";
  bankName: string;
  accountName: string;
  accountNumber: string;
  totalEarning: number;
  availableBalance: number;
  totalWithdrawn: number;
  picture: string;
  createdAt: string;
}

interface ReferrerDetails {
  referrer: Referrer;
  summary: {
    totalEarned: number;
    confirmedEarnings: number;
    pendingWithdrawals: number;
  };
  earnings: Earning[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

const ReferrerDetailsPage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReferrerDetails | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchReferrerDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await referrerAPI.getSingleReferrerDetails(id as string, {
        page: currentPage,
        limit,
        status: statusFilter,
      });

      if (result?.success && result?.data) {
        setData(result.data);
      } else {
        setError("Failed to fetch referrer details");
      }
    } catch (err) {
      console.error("Error fetching referrer details:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch details");
    } finally {
      setLoading(false);
    }
  }, [id, currentPage, limit, statusFilter]);

  useEffect(() => {
    if (id) {
      fetchReferrerDetails();
    }
  }, [id, fetchReferrerDetails]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-500";
      case "inactive":
        return "bg-gray-50 dark:bg-gray-500/15 text-gray-700 dark:text-gray-500";
      case "suspended":
        return "bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-500";
      case "pending":
        return "bg-yellow-50 dark:bg-yellow-500/15 text-yellow-700 dark:text-yellow-500";
      case "confirmed":
        return "bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-500";
      case "withdrawn":
        return "bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-500";
      default:
        return "bg-gray-50 dark:bg-gray-500/15 text-gray-700 dark:text-gray-500";
    }
  };

  if (loading) {
    return <SpinnerThree />;
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-500/10 p-6">
        <p className="text-red-700 dark:text-red-400">
          {error || "Failed to load referrer details"}
        </p>
      </div>
    );
  }

  const { referrer, summary, earnings, pagination } = data;
  const visiblePages = Array.from(
    { length: Math.min(5, pagination.totalPages) },
    (_, i) => i + 1
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4">
            {referrer.picture && (
              <img
                src={referrer.picture}
                alt={`${referrer.firstName} ${referrer.lastName}`}
                className="h-20 w-20 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white/90">
                {capitalizeWords(`${referrer.firstName} ${referrer.lastName}`)}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Referral Code:{" "}
                <span className="font-mono font-semibold">
                  {referrer.referralCode}
                </span>
              </p>
              <div className="mt-3 flex gap-3">
                <span
                  className={`text-xs rounded-full px-3 py-1 font-medium ${getStatusBadgeColor(
                    referrer.status
                  )}`}
                >
                  {capitalizeWords(referrer.status)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
              Email
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
              {referrer.email || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
              Phone
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
              {referrer.phoneNumber}
            </p>
          </div>
          {referrer.bankName && (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
                Bank
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                {referrer.bankName}
              </p>
            </div>
          )}
          {referrer.accountNumber && (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
                Account
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                {referrer.accountNumber}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Earned"
          value={formatPrice(referrer.totalEarning)}
          bgColor="bg-green-50 dark:bg-green-500/10"
          textColor="text-green-700 dark:text-green-400"
        />
        <SummaryCard
          label="Available Balance"
          value={formatPrice(referrer.availableBalance)}
          bgColor="bg-blue-50 dark:bg-blue-500/10"
          textColor="text-blue-700 dark:text-blue-400"
        />
        <SummaryCard
          label="Total Withdrawn"
          value={formatPrice(referrer.totalWithdrawn)}
          bgColor="bg-purple-50 dark:bg-purple-500/10"
          textColor="text-purple-700 dark:text-purple-400"
        />
        <SummaryCard
          label="Total Referrals"
          value={pagination.total.toString()}
          bgColor="bg-orange-50 dark:bg-orange-500/10"
          textColor="text-orange-700 dark:text-orange-400"
        />
      </div>

      {/* Earnings Details Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
            Total Earned from Referrals
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white/90 mt-2">
            {formatPrice(summary.totalEarned)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
            Confirmed Earnings
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white/90 mt-2">
            {formatPrice(summary.confirmedEarnings)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
            Pending Withdrawals
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white/90 mt-2">
            {summary.pendingWithdrawals}
          </p>
        </div>
      </div>

      {/* Earnings Table */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Earnings Details
            </h2>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>
        </div>

        {earnings.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No earnings found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400">
                    Enrollee Name
                  </th>
                  <th className="p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400">
                    Plan
                  </th>
                  <th className="p-4 text-right text-xs font-medium text-gray-700 dark:text-gray-400">
                    Subscription Amount
                  </th>
                  <th className="p-4 text-center text-xs font-medium text-gray-700 dark:text-gray-400">
                    Reward Type
                  </th>
                  <th className="p-4 text-right text-xs font-medium text-gray-700 dark:text-gray-400">
                    Earned Amount
                  </th>
                  <th className="p-4 text-center text-xs font-medium text-gray-700 dark:text-gray-400">
                    Status
                  </th>
                  <th className="p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {earnings.map((earning) => (
                  <tr
                    key={earning.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900 transition"
                  >
                    <td className="p-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {earning.retailEnrollee.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {earning.retailEnrollee.email}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {earning.plan.name}
                      </p>
                    </td>
                    <td className="p-4 whitespace-nowrap text-right">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {formatPrice(earning.subscriptionAmount)}
                      </p>
                    </td>
                    <td className="p-4 whitespace-nowrap text-center">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {earning.rewardType === "percentage"
                          ? `${earning.rewardRate}%`
                          : formatPrice(earning.rewardRate)}
                      </p>
                    </td>
                    <td className="p-4 whitespace-nowrap text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white/90">
                        {formatPrice(earning.earnedAmount)}
                      </p>
                    </td>
                    <td className="p-4 whitespace-nowrap text-center">
                      <span
                        className={`text-xs rounded-full px-2 py-1 font-medium ${getStatusBadgeColor(
                          earning.status
                        )}`}
                      >
                        {capitalizeWords(earning.status)}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {formatDate(earning.createdAt)}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-800 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {(currentPage - 1) * limit + 1} to{" "}
              {Math.min(currentPage * limit, pagination.total)} of{" "}
              {pagination.total}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={!pagination.hasPreviousPage}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
              >
                Previous
              </button>
              {visiblePages.map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage(
                    Math.min(pagination.totalPages, currentPage + 1)
                  )
                }
                disabled={!pagination.hasNextPage}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface SummaryCardProps {
  label: string;
  value: string;
  bgColor: string;
  textColor: string;
}

const SummaryCard = ({
  label,
  value,
  bgColor,
  textColor,
}: SummaryCardProps) => (
  <div className={`${bgColor} rounded-xl p-6 border border-transparent`}>
    <p className={`text-xs ${textColor} uppercase font-semibold`}>{label}</p>
    <p className={`text-2xl font-bold ${textColor} mt-2`}>{value}</p>
  </div>
);

export default ReferrerDetailsPage;
