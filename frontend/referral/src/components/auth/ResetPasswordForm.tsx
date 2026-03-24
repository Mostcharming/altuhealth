"use client";

import Input from "@/components/form/input/InputField";
import Notification from "@/components/ui/notification/Notification";
import { apiClient } from "@/lib/apiClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Label from "../form/Label";
import Button from "../ui/button/Button";

export default function ResetPasswordForm() {
  const [identifier, setIdentifier] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{
    variant: "success" | "info" | "warning" | "error";
    title: string;
    description?: string;
  } | null>(null);
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier.trim()) {
      setToast({
        variant: "error",
        title: "Missing field",
        description: "Please enter an email or policy number.",
      });
      return;
    }

    try {
      const isEmail = /\S+@\S+\.\S+/.test(identifier);
      const bodyPayload: Record<string, unknown> = {};

      if (isEmail) {
        (bodyPayload as Record<string, unknown>)["email"] = identifier.trim();
      } else {
        (bodyPayload as Record<string, unknown>)["policyNumber"] =
          identifier.trim();
      }

      const data = await apiClient("/admin/auth/forgot", {
        method: "POST",
        body: bodyPayload,
        onLoading: setIsLoading,
      });

      const resp = data && typeof data === "object" ? data : {};

      let message =
        "If an account exists we sent a reset link to the provided contact.";
      if (resp && typeof resp === "object") {
        const r = resp as Record<string, unknown>;
        if (typeof r.message === "string") {
          message = r.message;
        } else if (r.data && typeof r.data === "object") {
          const d = r.data as Record<string, unknown>;
          if (typeof d.message === "string") message = d.message;
        }
      }

      setToast({
        variant: "success",
        title: "Reset link sent",
        description: String(message),
      });

      setIdentifier("");
      router.push("/verify");
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      setToast({
        variant: "error",
        title: "Failed to send reset link",
        description: "Invalid Credentials",
      });
      console.error("Reset password error:", error);
    }
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Forgot Your Password?
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter the email address linked to your account, and we’ll send you a
            link to reset your password.
          </p>
        </div>
        <div>
          {toast && (
            <div className="fixed top-4 right-4 z-50 animate-slide-in">
              <Notification
                variant={toast.variant}
                title={toast.title}
                description={toast.description}
              />
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <Label>
                  Email or Policy Number
                  <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  id="identifier"
                  name="identifier"
                  placeholder="Enter your email or policy number"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Provide the email associated with your account or your policy
                  number.
                </p>
              </div>

              <div>
                <Button className="w-full" size="sm" loading={isLoading}>
                  Send Reset Link
                </Button>
              </div>
            </div>
          </form>
          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Wait, I remember my password...
              <Link
                href="/signin"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Click here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
