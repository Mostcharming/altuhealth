import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth provider Signin",
  description:
    "Sign in to your AltuHealth provider account to manage your application.",
};

export default function SignIn() {
  return <SignInForm />;
}
