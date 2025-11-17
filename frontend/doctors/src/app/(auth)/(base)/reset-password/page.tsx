import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth | Reset Password",
  description:
    "Reset your AltuHealth account password to regain access to your account.",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
