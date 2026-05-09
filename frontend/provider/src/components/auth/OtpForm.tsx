"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Notification from "@/components/ui/notification/Notification";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { apiClient } from "@/lib/apiClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

export default function OtpForm() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef<HTMLInputElement[]>([]);
  const [showPasswords, setShowPasswords] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{
    variant: "success" | "info" | "warning" | "error";
    title: string;
    description?: string;
  } | null>(null);
  const router = useRouter();

  const handleChange = (value: string, index: number) => {
    const sanitized = value.replace(/[^0-9a-zA-Z]/g, "");
    const updatedOtp = [...otp];
    updatedOtp[index] = sanitized.slice(0, 1);

    // Update the state with the new value
    setOtp(updatedOtp);

    // Automatically move to the next input if a value is entered
    if (sanitized && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (event.key === "Backspace") {
      const updatedOtp = [...otp];

      // If current input is empty, move focus to the previous input
      if (!otp[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }

      // Clear the current input
      updatedOtp[index] = "";
      setOtp(updatedOtp);
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    // Get the pasted text
    const pasteData = event.clipboardData
      .getData("text")
      .replace(/[^0-9a-zA-Z]/g, "")
      .slice(0, 6)
      .split("");

    // Update OTP with the pasted data
    const updatedOtp = [...otp];
    pasteData.forEach((char, idx) => {
      if (idx < updatedOtp.length) {
        updatedOtp[idx] = char;
      }
    });

    setOtp(updatedOtp);

    // Focus the last filled input
    const filledIndex = Math.min(
      pasteData.length - 1,
      inputsRef.current.length - 1
    );
    if (inputsRef.current[filledIndex]) {
      inputsRef.current[filledIndex].focus();
    }
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    // focus first otp input on mount
    inputsRef.current[0]?.focus();
  }, []);

  const handleVerifyClick = (event?: React.MouseEvent) => {
    event?.preventDefault();

    (async () => {
      if (!showPasswords) {
        // First step: ensure OTP is fully filled then reveal password fields with animation
        const token = otp.join("").trim();
        if (token.length < 6) {
          setToast({
            variant: "error",
            title: "Incomplete code",
            description: "Please enter the 6-digit code sent to you.",
          });
          return;
        }

        // reveal password fields
        setShowPasswords(true);

        // small timeout to wait for animation then focus password input by id
        setTimeout(() => {
          const el = document.getElementById(
            "new-password"
          ) as HTMLInputElement | null;
          el?.focus();
        }, 200);
        return;
      }

      // Second step: submit token + password to backend
      const token = otp.join("").trim();
      if (token.length < 6) {
        setToast({
          variant: "error",
          title: "Invalid token",
          description: "The verification token is invalid.",
        });
        return;
      }

      if (!password || !confirmPassword) {
        setToast({
          variant: "error",
          title: "Missing password",
          description: "Please provide and confirm your new password.",
        });
        return;
      }

      if (password.length < 8) {
        setToast({
          variant: "error",
          title: "Weak password",
          description: "Password must be at least 8 characters long.",
        });
        return;
      }

      if (password !== confirmPassword) {
        setToast({
          variant: "error",
          title: "Passwords do not match",
          description: "Please ensure both passwords match.",
        });
        return;
      }

      try {
        setIsLoading(true);
        const data = await apiClient("/provider/auth/reset", {
          method: "POST",
          body: { token, password },
          onLoading: setIsLoading,
        });

        const message =
          data && typeof data === "object" && "message" in data
            ? String((data as Record<string, unknown>).message)
            : "Your password has been reset.";

        setToast({
          variant: "success",
          title: "Password reset",
          description: message,
        });

        // redirect to sign in after a short delay
        setTimeout(() => router.push("/signin"), 1000);
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        setToast({
          variant: "error",
          title: "Reset failed",
          description: error.message || "Could not reset password.",
        });
        console.error("Reset error:", error);
      } finally {
        setIsLoading(false);
      }
    })();
  };

  const handleBackToOtp = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setShowPasswords(false);
    // put focus back to first otp input
    setTimeout(() => inputsRef.current[0]?.focus(), 200);
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Two Step Verification
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            A verification code has been sent to your mobile. Please enter it in
            the field below.
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

          <form>
            <div className="space-y-5">
              {/* OTP container */}
              <div>
                <Label>Type your 6 digits security code</Label>
                <div
                  className={`flex gap-2 sm:gap-4 transition-all duration-300 ${
                    showPasswords
                      ? "opacity-0 -translate-y-2 pointer-events-none h-0 overflow-hidden"
                      : "opacity-100 translate-y-0"
                  }`}
                  id="otp-container"
                >
                  {otp.map((_, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otp[index]}
                      onChange={(e) => handleChange(e.target.value, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onPaste={(e) => handlePaste(e)}
                      ref={(el) => {
                        if (el) {
                          inputsRef.current[index] = el;
                        }
                      }}
                      className="dark:bg-dark-900 otp-input h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-center text-xl font-semibold text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    />
                  ))}
                </div>
              </div>

              {/* Password container (hidden until OTP step complete) */}
              <div
                className={`transition-all duration-300 ${
                  showPasswords
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2 pointer-events-none h-0 overflow-hidden"
                }`}
              >
                <Label>Choose a new password</Label>
                <div className="space-y-3">
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="New password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span
                      onClick={() => setShowNewPassword((s) => !s)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showNewPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <span
                      onClick={() => setShowConfirmPassword((s) => !s)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Passwords must be at least 8 characters long.
                  </p>
                </div>
              </div>

              {/* Button */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleVerifyClick}
                  className="w-full"
                  size="sm"
                  loading={isLoading}
                >
                  {showPasswords ? "Reset Password" : "Continue"}
                </Button>

                {showPasswords && (
                  <button
                    type="button"
                    onClick={handleBackToOtp}
                    className="text-sm mt-0 underline text-center text-gray-600 dark:text-gray-400"
                  >
                    Back to code
                  </button>
                )}
              </div>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Didn’t get the code?{" "}
              <Link
                href="/reset-password"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Resend
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
