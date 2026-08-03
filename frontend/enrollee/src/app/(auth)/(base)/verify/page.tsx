import OtpForm from "@/components/auth/OtpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Enrollee Password Verification",
  description: "Verify your code to reset your AltuHealth enrollee password.",
  // other metadata
};

export default function OtpVerification() {
  return <OtpForm />;
}
