import ReferralDashboard from "@/components/pages/referrer/ReferralDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Referral Overview | AltuHealth",
  description: "Track your AltuHealth referrals and earnings.",
};

export default function OverviewPage() {
  return <ReferralDashboard />;
}
