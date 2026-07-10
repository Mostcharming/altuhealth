"use client";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { referralAPI } from "@/lib/apis/referral";
import { FormEvent, useState } from "react";

type Feedback = {
  variant: "success" | "error";
  title: string;
  message: string;
};

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  visible: boolean;
  autoComplete: "current-password" | "new-password";
  disabled: boolean;
  onChange: (value: string) => void;
  onToggleVisibility: () => void;
};

export default function UserAddressCard() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setFeedback({
        variant: "error",
        title: "Complete all password fields",
        message: "Enter your current password, new password, and confirmation.",
      });
      return;
    }

    if (newPassword.length < 8) {
      setFeedback({
        variant: "error",
        title: "New password is too short",
        message: "Use at least 8 characters for your new password.",
      });
      return;
    }

    if (newPassword === oldPassword) {
      setFeedback({
        variant: "error",
        title: "Choose a different password",
        message: "Your new password must be different from your current password.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({
        variant: "error",
        title: "Passwords do not match",
        message: "Re-enter the same new password in the confirmation field.",
      });
      return;
    }

    try {
      setIsSaving(true);
      const response = await referralAPI.changePassword({
        oldPassword,
        newPassword,
      });

      if (response.error) {
        throw new Error(response.message || "The password could not be changed.");
      }

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowOldPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setFeedback({
        variant: "success",
        title: "Password changed",
        message:
          response.message || "Your account is now using the new password.",
      });
    } catch (error) {
      setFeedback({
        variant: "error",
        title: "Password not changed",
        message:
          error instanceof Error
            ? error.message
            : "Please verify your current password and try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800 lg:p-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Change password
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Confirm your current password before setting a new one.
        </p>
      </div>

      {feedback && (
        <div className="mt-5" role="status" aria-live="polite">
          <Alert
            variant={feedback.variant}
            title={feedback.title}
            message={feedback.message}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl">
        <div className="space-y-5">
          <PasswordField
            id="current-password"
            label="Current password"
            value={oldPassword}
            visible={showOldPassword}
            autoComplete="current-password"
            disabled={isSaving}
            onChange={setOldPassword}
            onToggleVisibility={() => setShowOldPassword((visible) => !visible)}
          />

          <PasswordField
            id="new-password"
            label="New password"
            value={newPassword}
            visible={showNewPassword}
            autoComplete="new-password"
            disabled={isSaving}
            onChange={setNewPassword}
            onToggleVisibility={() => setShowNewPassword((visible) => !visible)}
          />

          <PasswordField
            id="confirm-password"
            label="Confirm new password"
            value={confirmPassword}
            visible={showConfirmPassword}
            autoComplete="new-password"
            disabled={isSaving}
            onChange={setConfirmPassword}
            onToggleVisibility={() =>
              setShowConfirmPassword((visible) => !visible)
            }
          />
        </div>

        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Use at least 8 characters and avoid reusing your current password.
        </p>

        <div className="mt-6">
          <Button
            size="sm"
            loading={isSaving}
            disabled={isSaving}
            loadingClassName="text-white"
          >
            Change password
          </Button>
        </div>
      </form>
    </section>
  );
}

function PasswordField({
  id,
  label,
  value,
  visible,
  autoComplete,
  disabled,
  onChange,
  onToggleVisibility,
}: PasswordFieldProps) {
  return (
    <div>
      <Label htmlFor={id}>
        {label} <span className="text-error-500">*</span>
      </Label>
      <div className="relative">
        <Input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          className="pr-12"
          required
          disabled={disabled}
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          disabled={disabled}
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:text-gray-200"
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
        >
          {visible ? (
            <EyeIcon className="fill-current" />
          ) : (
            <EyeCloseIcon className="fill-current" />
          )}
        </button>
      </div>
    </div>
  );
}
