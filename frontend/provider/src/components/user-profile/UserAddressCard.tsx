/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { useModal } from "@/hooks/useModal";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { apiClient } from "@/lib/apiClient";
import { useState } from "react";
import ErrorModal from "../modals/error";
import SuccessModal from "../modals/success";

export default function UserAddressCard() {
  const { closeModal } = useModal();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const errorModal = useModal();
  const successModal = useModal();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const bodyPayload: any = {
        newPassword: password,
        oldPassword,
      };

      const data = await apiClient("/admin/account/password", {
        method: "POST",
        body: bodyPayload,
        onLoading: setIsLoading,
      });
      if (!data?.error) {
        successModal.openModal();
      }
      setOldPassword("");
      setPassword("");
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      errorModal.openModal();
      console.error("Sign in error:", err);
    }
  };
  const handleSuccessClose = () => {
    successModal.closeModal();
    closeModal();
  };

  const handleErrorClose = () => {
    errorModal.closeModal();
    closeModal();
  };
  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Change Password
            </h4>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <Label>
                Old Password <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showOldPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
                <span
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showOldPassword ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                  )}
                </span>
              </div>
            </div>

            <div>
              <Label>
                New Password <span className="text-error-500">*</span>
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

            <div>
              <Button
                className="w-full"
                size="sm"
                loading={isLoading}
                loadingSize={20}
                loadingClassName="text-white"
              >
                Submit
              </Button>
            </div>
          </div>
        </form>
      </div>
      <SuccessModal
        successModal={successModal}
        handleSuccessClose={handleSuccessClose}
      />

      <ErrorModal
        message=""
        errorModal={errorModal}
        handleErrorClose={handleErrorClose}
      />
    </>
  );
}
