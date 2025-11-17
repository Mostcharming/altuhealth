import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth corporate Signin",
  description:
    "Sign in to your AltuHealth corporate account to manage your application.",
};

export default function SignIn() {
  return <SignInForm />;
}
