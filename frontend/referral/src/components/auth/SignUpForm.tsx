/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Notification from "@/components/ui/notification/Notification";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/lib/authStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{
    variant: "success" | "info" | "warning" | "error";
    title: string;
    description?: string;
  } | null>(null);

  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName || !email || !phoneNumber || !password) {
      setToast({
        variant: "error",
        title: "Missing Fields",
        description: "Please fill in all required fields.",
      });
      return;
    }

    if (!isChecked) {
      setToast({
        variant: "error",
        title: "Terms Required",
        description: "Please agree to the terms and privacy policy.",
      });
      return;
    }

    try {
      const data = await apiClient("/referrer/auth/signup", {
        method: "POST",
        body: {
          firstName,
          lastName,
          email,
          phoneNumber,
          password,
        },
        onLoading: setIsLoading,
      });

      const resp = data && typeof data === "object" ? data : {};
      const user = (resp as any).user ?? (resp as any).data?.user ?? null;
      const token =
        (resp as any).token ??
        (resp as any).data?.token ??
        (resp as any).accessToken ??
        null;

      if (!user || !token) {
        throw new Error("Invalid response from server");
      }

      login(user, token);
      router.push("/overview");

      setToast({
        variant: "success",
        title: "Account created successfully",
        description: `Your referral code is ${(user as any).referralCode}.`,
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      setToast({
        variant: "error",
        title: "Sign up failed",
        description: err.message || "Please check your details and try again.",
      });
      console.error("Sign up error:", err);
    }
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign Up
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign up!
            </p>
          </div>

          {toast && (
            <div className="fixed top-4 right-4 z-50 animate-slide-in">
              <Notification
                variant={toast.variant}
                title={toast.title}
                description={toast.description}
              />
            </div>
          )}

          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* <!-- First Name --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      First Name<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="fname"
                      name="fname"
                      placeholder="Enter your first name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  {/* <!-- Last Name --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      Last Name<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="lname"
                      name="lname"
                      placeholder="Enter your last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
                {/* <!-- Email --> */}
                <div>
                  <Label>
                    Email<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label>
                    Phone Number<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                {/* <!-- Password --> */}
                <div>
                  <Label>
                    Password<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
                {/* <!-- Checkbox --> */}
                <div className="flex items-center gap-3">
                  <Checkbox
                    className="w-5 h-5"
                    checked={isChecked}
                    onChange={setIsChecked}
                  />
                  <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                    By creating an account means you agree to the{" "}
                    <span className="text-gray-800 dark:text-white/90">
                      Terms and Conditions,
                    </span>{" "}
                    and our{" "}
                    <span className="text-gray-800 dark:text-white">
                      Privacy Policy
                    </span>
                  </p>
                </div>
                {/* <!-- Button --> */}
                <div>
                  <Button
                    className="w-full"
                    size="sm"
                    loading={isLoading}
                    loadingSize={20}
                    loadingClassName="text-white"
                  >
                    Sign Up
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Already have an account?
                <Link
                  href="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
