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

async function getCoordinates(timeoutMs = 8000): Promise<{
  lat: number;
  lon: number;
} | null> {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) return resolve(null);

    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(null);
      }
    }, timeoutMs);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timer);
        const { latitude, longitude } = pos.coords;
        resolve({ lat: latitude, lon: longitude });
      },
      (err) => {
        console.warn("Geolocation error:", err);
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve(null);
        }
      },
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: timeoutMs }
    );
  });
}

async function getLocationName(
  lat: number,
  lon: number
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const state =
      data.address?.state || data.address?.region || data.address?.county || "";
    const country = data.address?.country || "";
    return [state, country].filter(Boolean).join(", ") || null;
  } catch (err) {
    console.warn("Reverse geocoding failed:", err);
    return null;
  }
}

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [identifier, setIdentifier] = useState("");
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
    setIsLoading(true);

    if (!identifier || !password) {
      setToast({
        variant: "error",
        title: "Missing Fields",
        description: "Please fill in both email and password.",
      });
      return;
    }

    try {
      const coords = await getCoordinates();
      let currentLocation = null;

      if (coords) {
        currentLocation = await getLocationName(coords.lat, coords.lon);
      }

      const isEmail = /\S+@\S+\.\S+/.test(identifier);

      const bodyPayload: any = {
        password,
        remember: isChecked,
        location: {
          lat: coords?.lat || null,
          lon: coords?.lon || null,
          currentLocation: currentLocation || null,
        },
      };

      if (isEmail) {
        bodyPayload.email = identifier;
      } else {
        bodyPayload.policyNumber = identifier;
      }

      const data = await apiClient("/admin/auth/login", {
        method: "POST",
        body: bodyPayload,
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
        title: "Signed in successfully! ✅",
        description: `Welcome back! ${
          (user as any).firstName ?? (user as any).email
        }`,
      });

      setIdentifier("");
      setPassword("");
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      setToast({
        variant: "error",
        title: "Sign in failed",
        description: err.message || "An unexpected error occurred",
      });
      console.error("Sign in error:", err);
    }
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Admin Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
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

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <Label>
                  Email or Policy Number{" "}
                  <span className="text-error-500">*</span>
                </Label>
                <Input
                  placeholder="Email or Policy Number"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>

              <div>
                <Label>
                  Password <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
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

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox checked={isChecked} onChange={setIsChecked} />
                  <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                    Keep me logged in
                  </span>
                </div>
                <Link
                  href="/reset-password"
                  className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Forgot password?
                </Link>
              </div>

              <div>
                <Button
                  className="w-full"
                  size="sm"
                  loading={isLoading}
                  loadingSize={20}
                  loadingClassName="text-white"
                >
                  Sign in
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
