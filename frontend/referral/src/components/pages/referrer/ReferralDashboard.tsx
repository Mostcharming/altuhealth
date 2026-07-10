"use client";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Notification from "@/components/ui/notification/Notification";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import {
  CheckCircleIcon,
  CopyIcon,
  DollarLineIcon,
  GroupIcon,
  PaperPlaneIcon,
  PieChartIcon,
} from "@/icons";
import { APP_CONFIG } from "@/lib/config";
import {
  BankDetails,
  EarningStatus,
  referralAPI,
  ReferralDashboardData,
  ReferralEarning,
} from "@/lib/apis/referral";
import { useAuthStore } from "@/lib/authStore";
import { formatDate, formatPrice } from "@/lib/formatDate";
import Image from "next/image";
import { FormEvent, ReactNode, useCallback, useEffect, useRef, useState } from "react";

type ToastState = {
  variant: "success" | "info" | "warning" | "error";
  title: string;
  description?: string;
};

const PAGE_SIZE = 10;

const emptyBankDetails: BankDetails = {
  bankName: "",
  accountName: "",
  accountNumber: "",
};

const capitalize = (value: string) =>
  value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : "";

const statusClasses: Record<string, string> = {
  active:
    "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400",
  inactive:
    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  suspended:
    "bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-400",
  pending:
    "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-400",
  confirmed:
    "bg-blue-light-50 text-blue-light-700 dark:bg-blue-light-500/15 dark:text-blue-light-400",
  withdrawn:
    "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400",
};

export default function ReferralDashboard() {
  const [dashboard, setDashboard] = useState<ReferralDashboardData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<EarningStatus | "">("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [bankDetails, setBankDetails] =
    useState<BankDetails>(emptyBankDetails);
  const [isSavingBankDetails, setIsSavingBankDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const bankDetailsInitialized = useRef(false);
  const updateUser = useAuthStore((state) => state.updateUser);

  const fetchDashboard = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setLoadError("");

      const response = await referralAPI.getDashboard({
        page: currentPage,
        limit: PAGE_SIZE,
        status: statusFilter,
      });

      if (response.error || !response.data) {
        throw new Error(response.message || "Unable to load your dashboard");
      }

      setDashboard(response.data);

      if (!bankDetailsInitialized.current) {
        const { bankName, accountName, accountNumber } = response.data.referrer;
        setBankDetails({
          bankName: bankName || "",
          accountName: accountName || "",
          accountNumber: accountNumber || "",
        });
        bankDetailsInitialized.current = true;
      }
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Unable to load your dashboard"
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = (nextToast: ToastState) => {
    setToast(null);
    window.setTimeout(() => setToast(nextToast), 0);
  };

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = value;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      textArea.remove();
    }
  };

  const handleCopyCode = async () => {
    if (!dashboard?.referrer.referralCode) return;
    await copyToClipboard(dashboard.referrer.referralCode);
    setCopied(true);
    showToast({
      variant: "success",
      title: "Referral code copied",
      description: "Your code is ready to paste.",
    });
    window.setTimeout(() => setCopied(false), 2000);
  };

  const referralCode = dashboard?.referrer.referralCode || "";
  const referralUrl = `${APP_CONFIG.REFERRAL_TARGET_URL}${
    APP_CONFIG.REFERRAL_TARGET_URL.includes("?") ? "&" : "?"
  }referralCode=${encodeURIComponent(referralCode)}`;
  const shareText = `Use my AltuHealth referral code ${referralCode} when selecting a health plan.`;
  const fullShareText = `${shareText} ${referralUrl}`;

  const handleNativeShare = async () => {
    if (!referralCode) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "AltuHealth referral",
          text: shareText,
          url: referralUrl,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    await copyToClipboard(fullShareText);
    showToast({
      variant: "info",
      title: "Share message copied",
      description: "Paste it into any app to share your referral.",
    });
  };

  const handleSaveBankDetails = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedDetails = {
      bankName: bankDetails.bankName.trim(),
      accountName: bankDetails.accountName.trim(),
      accountNumber: bankDetails.accountNumber.replace(/\s/g, ""),
    };

    if (
      !normalizedDetails.bankName ||
      !normalizedDetails.accountName ||
      !normalizedDetails.accountNumber
    ) {
      showToast({
        variant: "error",
        title: "Bank details incomplete",
        description: "Complete all three fields before saving.",
      });
      return;
    }

    if (!/^\d{6,20}$/.test(normalizedDetails.accountNumber)) {
      showToast({
        variant: "error",
        title: "Check the account number",
        description: "Enter an account number containing 6 to 20 digits.",
      });
      return;
    }

    try {
      setIsSavingBankDetails(true);
      const response = await referralAPI.updateBankDetails(normalizedDetails);

      if (response.error || !response.data) {
        throw new Error(response.message || "Unable to save bank details");
      }

      setBankDetails(response.data);
      setDashboard((current) =>
        current
          ? {
              ...current,
              referrer: { ...current.referrer, ...response.data },
            }
          : current
      );
      updateUser(response.data);
      showToast({
        variant: "success",
        title: "Bank details saved",
        description: "Your payout account has been updated.",
      });
    } catch (error) {
      showToast({
        variant: "error",
        title: "Bank details not saved",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsSavingBankDetails(false);
    }
  };

  if (isLoading) return <SpinnerThree />;

  if (!dashboard) {
    return (
      <div className="rounded-lg border border-error-200 bg-error-50 p-6 dark:border-error-800 dark:bg-error-500/10">
        <h1 className="text-lg font-semibold text-error-800 dark:text-error-300">
          Dashboard unavailable
        </h1>
        <p className="mt-1 text-sm text-error-700 dark:text-error-400">
          {loadError || "We could not load your referral information."}
        </p>
        <Button className="mt-4" size="sm" onClick={fetchDashboard}>
          Try again
        </Button>
      </div>
    );
  }

  const { referrer, summary, earnings, pagination } = dashboard;
  const initials = `${referrer.firstName?.[0] || ""}${
    referrer.lastName?.[0] || ""
  }`.toUpperCase();
  const bankDetailsSaved = Boolean(
    referrer.bankName && referrer.accountName && referrer.accountNumber
  );
  const firstVisiblePage = Math.max(
    1,
    Math.min(currentPage - 2, Math.max(1, pagination.totalPages - 4))
  );
  const visiblePages = Array.from(
    { length: Math.min(5, pagination.totalPages) },
    (_, index) => firstVisiblePage + index
  );

  const socialLinks = [
    {
      name: "WhatsApp",
      shortName: "WA",
      href: `https://wa.me/?text=${encodeURIComponent(fullShareText)}`,
      className:
        "border-success-200 text-success-700 hover:bg-success-50 dark:border-success-800 dark:text-success-400 dark:hover:bg-success-500/10",
    },
    {
      name: "Facebook",
      shortName: "f",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        referralUrl
      )}&quote=${encodeURIComponent(shareText)}`,
      className:
        "border-brand-200 text-brand-700 hover:bg-brand-50 dark:border-brand-800 dark:text-brand-300 dark:hover:bg-brand-500/10",
    },
    {
      name: "X",
      shortName: "X",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        fullShareText
      )}`,
      className:
        "border-gray-300 text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800",
    },
    {
      name: "LinkedIn",
      shortName: "in",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        referralUrl
      )}`,
      className:
        "border-blue-light-200 text-blue-light-700 hover:bg-blue-light-50 dark:border-blue-light-800 dark:text-blue-light-300 dark:hover:bg-blue-light-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed right-4 top-4 z-999999">
          <Notification {...toast} />
        </div>
      )}

      <section className="flex flex-col gap-5 border-b border-gray-200 pb-6 dark:border-gray-800 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          {referrer.picture ? (
            <Image
              src={referrer.picture}
              alt={`${referrer.firstName} ${referrer.lastName}`}
              width={64}
              height={64}
              className="h-16 w-16 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-xl font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
              {initials || "AR"}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-semibold text-gray-900 dark:text-white/90">
                {referrer.firstName} {referrer.lastName}
              </h1>
              <StatusBadge status={referrer.status} />
            </div>
            <p className="mt-1 truncate text-sm text-gray-500 dark:text-gray-400">
              {referrer.email || "No email added"} · {referrer.phoneNumber}
            </p>
          </div>
        </div>
        <div className="lg:text-right">
          <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
            Available balance
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white/90">
            {formatPrice(referrer.availableBalance)}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-brand-700 dark:text-brand-300">
                Your referral code
              </p>
              <h2 className="mt-1 text-lg font-semibold text-gray-900 dark:text-white/90">
                Share and earn
              </h2>
            </div>
            <button
              type="button"
              onClick={handleNativeShare}
              title="Share referral code"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-500 px-3 text-sm font-medium text-white transition hover:bg-brand-600"
            >
              <PaperPlaneIcon className="h-4 w-4" />
              Share
            </button>
          </div>

          <div className="mt-5 flex min-w-0 items-center rounded-lg border border-brand-200 bg-brand-25 p-2 dark:border-brand-800 dark:bg-brand-500/10">
            <span className="min-w-0 flex-1 truncate px-3 font-mono text-xl font-semibold text-gray-900 dark:text-white/90 sm:text-2xl">
              {referralCode}
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              title={copied ? "Copied" : "Copy referral code"}
              aria-label={copied ? "Referral code copied" : "Copy referral code"}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-brand-200 bg-white text-brand-700 transition hover:bg-brand-50 dark:border-brand-700 dark:bg-gray-900 dark:text-brand-300 dark:hover:bg-gray-800"
            >
              {copied ? (
                <CheckCircleIcon className="h-5 w-5" />
              ) : (
                <CopyIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="mt-5">
            <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              Share on social media
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Share on ${social.name}`}
                  className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition ${social.className}`}
                >
                  <span className="flex h-5 min-w-5 items-center justify-center text-xs font-bold">
                    {social.shortName}
                  </span>
                  {social.name}
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white/90">
                Bank details
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Payout account
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                bankDetailsSaved
                  ? "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400"
                  : "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-400"
              }`}
            >
              {bankDetailsSaved ? "Saved" : "Required"}
            </span>
          </div>

          <form className="mt-5 space-y-4" onSubmit={handleSaveBankDetails}>
            <div>
              <Label htmlFor="bankName">Bank name</Label>
              <Input
                id="bankName"
                name="bankName"
                value={bankDetails.bankName}
                placeholder="Enter bank name"
                onChange={(event) =>
                  setBankDetails((current) => ({
                    ...current,
                    bankName: event.target.value,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="accountName">Account name</Label>
                <Input
                  id="accountName"
                  name="accountName"
                  value={bankDetails.accountName}
                  placeholder="Enter account name"
                  onChange={(event) =>
                    setBankDetails((current) => ({
                      ...current,
                      accountName: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="accountNumber">Account number</Label>
                <Input
                  id="accountNumber"
                  name="accountNumber"
                  value={bankDetails.accountNumber}
                  placeholder="Enter account number"
                  onChange={(event) =>
                    setBankDetails((current) => ({
                      ...current,
                      accountNumber: event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 20),
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <Button
                size="sm"
                className="w-full sm:w-auto"
                loading={isSavingBankDetails}
              >
                Save bank details
              </Button>
            </div>
          </form>
        </section>
      </div>

      <section aria-labelledby="performance-heading">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2
              id="performance-heading"
              className="text-lg font-semibold text-gray-900 dark:text-white/90"
            >
              Performance
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Referral earnings at a glance
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total earned"
            value={formatPrice(referrer.totalEarning)}
            icon={<DollarLineIcon className="h-6 w-6" />}
            iconClassName="bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400"
          />
          <MetricCard
            label="Available balance"
            value={formatPrice(referrer.availableBalance)}
            icon={<PieChartIcon className="h-6 w-6" />}
            iconClassName="bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
          />
          <MetricCard
            label="Total withdrawn"
            value={formatPrice(referrer.totalWithdrawn)}
            icon={<CheckCircleIcon className="h-6 w-6" />}
            iconClassName="bg-blue-light-50 text-blue-light-700 dark:bg-blue-light-500/15 dark:text-blue-light-400"
          />
          <MetricCard
            label="Total referrals"
            value={summary.totalReferrals.toLocaleString()}
            icon={<GroupIcon className="h-6 w-6" />}
            iconClassName="bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-400"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3" aria-label="Earnings breakdown">
        <BreakdownMetric
          label="Recorded earnings"
          value={formatPrice(summary.totalEarned)}
        />
        <BreakdownMetric
          label="Confirmed earnings"
          value={formatPrice(summary.confirmedEarnings)}
          valueClassName="text-success-700 dark:text-success-400"
        />
        <BreakdownMetric
          label="Pending earnings"
          value={formatPrice(summary.pendingEarnings)}
          valueClassName="text-warning-700 dark:text-warning-400"
        />
      </section>

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white/90">
              Referral earnings
            </h2>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              {pagination.total.toLocaleString()} record
              {pagination.total === 1 ? "" : "s"}
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as EarningStatus | "");
                setCurrentPage(1);
              }}
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-hidden focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </label>
        </div>

        {loadError && (
          <div className="border-b border-error-200 bg-error-50 px-5 py-3 text-sm text-error-700 dark:border-error-800 dark:bg-error-500/10 dark:text-error-400">
            {loadError}
          </div>
        )}

        <div className={isRefreshing ? "opacity-60" : "opacity-100"}>
          {earnings.length ? (
            <EarningsTable earnings={earnings} />
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                <GroupIcon className="h-6 w-6" />
              </div>
              <p className="mt-3 font-medium text-gray-800 dark:text-white/90">
                No referral earnings found
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {statusFilter
                  ? "There are no records with this status."
                  : "Your referral activity will appear here."}
              </p>
            </div>
          )}
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {(currentPage - 1) * PAGE_SIZE + 1} to {" "}
              {Math.min(currentPage * PAGE_SIZE, pagination.total)} of {" "}
              {pagination.total}
            </p>
            <div className="flex items-center gap-1.5">
              <PaginationButton
                label="Previous page"
                disabled={!pagination.hasPreviousPage || isRefreshing}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                Prev
              </PaginationButton>
              {visiblePages.map((page) => (
                <PaginationButton
                  key={page}
                  label={`Page ${page}`}
                  active={page === currentPage}
                  disabled={isRefreshing}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </PaginationButton>
              ))}
              <PaginationButton
                label="Next page"
                disabled={!pagination.hasNextPage || isRefreshing}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(pagination.totalPages, page + 1)
                  )
                }
              >
                Next
              </PaginationButton>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        statusClasses[status] || statusClasses.inactive
      }`}
    >
      {capitalize(status)}
    </span>
  );
}

function MetricCard({
  label,
  value,
  icon,
  iconClassName,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  iconClassName: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
      <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${iconClassName}`}>
        {icon}
      </div>
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 break-words text-xl font-semibold text-gray-900 dark:text-white/90">
        {value}
      </p>
    </div>
  );
}

function BreakdownMetric({
  label,
  value,
  valueClassName = "text-gray-900 dark:text-white/90",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="border-l-2 border-gray-200 py-1 pl-4 dark:border-gray-700">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${valueClassName}`}>{value}</p>
    </div>
  );
}

function EarningsTable({ earnings }: { earnings: ReferralEarning[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] table-fixed">
        <thead className="bg-gray-50 dark:bg-gray-900/50">
          <tr>
            <TableHeading className="w-[24%]">Referred person</TableHeading>
            <TableHeading className="w-[15%]">Plan</TableHeading>
            <TableHeading className="w-[16%] text-right">Subscription</TableHeading>
            <TableHeading className="w-[14%] text-center">Reward</TableHeading>
            <TableHeading className="w-[14%] text-right">Earned</TableHeading>
            <TableHeading className="w-[10%] text-center">Status</TableHeading>
            <TableHeading className="w-[17%]">Date</TableHeading>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {earnings.map((earning) => (
            <tr
              key={earning.id}
              className="transition hover:bg-gray-50 dark:hover:bg-gray-900/40"
            >
              <td className="px-5 py-4 align-top sm:px-6">
                <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                  {earning.referredUser?.name || "Referred enrollee"}
                </p>
                <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                  {earning.referredUser?.email ||
                    earning.referredUser?.phoneNumber ||
                    "Contact unavailable"}
                </p>
                {earning.referredUser?.policyNumber && (
                  <p className="mt-1 truncate font-mono text-xs text-gray-500 dark:text-gray-400">
                    {earning.referredUser.policyNumber}
                  </p>
                )}
              </td>
              <td className="px-5 py-4 align-top text-sm text-gray-700 dark:text-gray-300 sm:px-6">
                <span className="line-clamp-2">{earning.plan?.name || "-"}</span>
              </td>
              <td className="px-5 py-4 text-right align-top text-sm font-medium text-gray-700 dark:text-gray-300 sm:px-6">
                {formatPrice(earning.subscriptionAmount, earning.currency)}
              </td>
              <td className="px-5 py-4 text-center align-top sm:px-6">
                <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  {earning.rewardType === "percentage"
                    ? `${earning.rewardRate}%`
                    : formatPrice(earning.rewardRate, earning.currency)}
                </p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {capitalize(earning.rewardType)}
                </p>
              </td>
              <td className="px-5 py-4 text-right align-top text-sm font-semibold text-gray-900 dark:text-white/90 sm:px-6">
                {formatPrice(earning.earnedAmount, earning.currency)}
              </td>
              <td className="px-5 py-4 text-center align-top sm:px-6">
                <StatusBadge status={earning.status} />
              </td>
              <td className="px-5 py-4 align-top text-sm text-gray-600 dark:text-gray-400 sm:px-6">
                {formatDate(earning.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableHeading({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400 sm:px-6 ${className}`}
    >
      {children}
    </th>
  );
}

function PaginationButton({
  children,
  label,
  active = false,
  disabled = false,
  onClick,
}: {
  children: ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? "page" : undefined}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
        active
          ? "bg-brand-500 text-white"
          : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
      }`}
    >
      {children}
    </button>
  );
}
