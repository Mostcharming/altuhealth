"use client";

import Badge from "@/components/ui/badge/Badge";
import { ReferrerProfile } from "@/lib/apis/referral";
import { formatPrice } from "@/lib/formatDate";
import Image from "next/image";
import { useState } from "react";

type UserMetaCardProps = {
  profile: ReferrerProfile;
};

const statusColor = (status: ReferrerProfile["status"]) => {
  if (status === "active") return "success" as const;
  if (status === "suspended") return "error" as const;
  return "warning" as const;
};

export default function UserMetaCard({ profile }: UserMetaCardProps) {
  const [copied, setCopied] = useState(false);
  const fullName = `${profile.firstName} ${profile.lastName}`.trim();
  const initials = `${profile.firstName?.[0] || ""}${
    profile.lastName?.[0] || ""
  }`.toUpperCase();

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(profile.referralCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start xl:items-center">
          {profile.picture ? (
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border border-gray-200 dark:border-gray-800">
              <Image
                width={80}
                height={80}
                src={profile.picture}
                alt={`${fullName || "Referrer"} profile picture`}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xl font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400"
              aria-label={`${fullName || "Referrer"} initials`}
            >
              {initials || "R"}
            </div>
          )}

          <div className="text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                {fullName}
              </h2>
              <Badge color={statusColor(profile.status)} size="sm">
                {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Referrer
            </p>
            <button
              type="button"
              onClick={copyReferralCode}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
              aria-label="Copy referral code"
            >
              <span className="text-gray-500 dark:text-gray-400">
                Referral code
              </span>
              <span>{profile.referralCode}</span>
              <span className="text-xs text-brand-500">
                {copied ? "Copied" : "Copy"}
              </span>
            </button>
          </div>
        </div>

        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 xl:w-auto xl:min-w-[540px]">
          <SummaryItem label="Total earned" value={formatPrice(profile.totalEarning)} />
          <SummaryItem
            label="Available balance"
            value={formatPrice(profile.availableBalance)}
          />
          <SummaryItem
            label="Total withdrawn"
            value={formatPrice(profile.totalWithdrawn)}
          />
        </div>
      </div>
    </section>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-white/[0.03]">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-white/90">
        {value}
      </p>
    </div>
  );
}
