import ReferralProfile from "@/components/user-profile/ReferralProfile";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth | Referrer Profile",
  description:
    "Manage your profile information and account security in the AltuHealth referral portal.",
};

export default function Profile() {
  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        <ReferralProfile />
      </div>
    </div>
  );
}
