import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth referral - Sign Up",
  description: "This is the AltuHealth referral Sign Up Page",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
