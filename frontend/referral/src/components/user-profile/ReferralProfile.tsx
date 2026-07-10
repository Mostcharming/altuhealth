"use client";

import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { referralAPI, ReferrerProfile as Profile } from "@/lib/apis/referral";
import { useAuthStore } from "@/lib/authStore";
import { useCallback, useEffect, useState } from "react";
import UserAddressCard from "./UserAddressCard";
import UserInfoCard from "./UserInfoCard";
import UserMetaCard from "./UserMetaCard";

export default function ReferralProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const updateUser = useAuthStore((state) => state.updateUser);

  const setAndSyncProfile = useCallback(
    (nextProfile: Profile) => {
      setProfile(nextProfile);
      updateUser({
        id: nextProfile.id,
        firstName: nextProfile.firstName,
        lastName: nextProfile.lastName,
        email: nextProfile.email,
        phoneNumber: nextProfile.phoneNumber,
        picture: nextProfile.picture || undefined,
        referralCode: nextProfile.referralCode,
        status: nextProfile.status,
        type: nextProfile.type || "Referrer",
        bankName: nextProfile.bankName,
        accountName: nextProfile.accountName,
        accountNumber: nextProfile.accountNumber,
        totalEarning: nextProfile.totalEarning,
        availableBalance: nextProfile.availableBalance,
        totalWithdrawn: nextProfile.totalWithdrawn,
      });
    },
    [updateUser]
  );

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError("");
      const response = await referralAPI.getProfile();
      const freshProfile = response.data?.user;

      if (response.error || !freshProfile) {
        throw new Error(response.message || "Your profile could not be loaded.");
      }

      setAndSyncProfile(freshProfile);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Your profile could not be loaded."
      );
    } finally {
      setIsLoading(false);
    }
  }, [setAndSyncProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (isLoading) {
    return (
      <div
        className="flex min-h-64 items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03]"
        aria-label="Loading profile"
      >
        <SpinnerThree />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <Alert
          variant="error"
          title="Profile unavailable"
          message={loadError || "Your profile could not be loaded."}
        />
        <div className="mt-4">
          <Button size="sm" onClick={fetchProfile}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UserMetaCard profile={profile} />
      <UserInfoCard
        profile={profile}
        onProfileUpdated={setAndSyncProfile}
      />
      <UserAddressCard />
    </div>
  );
}
