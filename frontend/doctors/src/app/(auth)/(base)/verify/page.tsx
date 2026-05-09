import OtpForm from "@/components/auth/OtpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin OTP Verification",
  description: "Verify your OTP to access your AltuHealth admin account.",
  // other metadata
};

export default function OtpVerification() {
  return <OtpForm />;
}
