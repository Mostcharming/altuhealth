"use client";

import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";
import FileInput from "@/components/form/input/FileInput";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { referralAPI, ReferrerProfile } from "@/lib/apis/referral";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

type UserInfoCardProps = {
  profile: ReferrerProfile;
  onProfileUpdated: (profile: ReferrerProfile) => void;
};

type Feedback = {
  variant: "success" | "error";
  title: string;
  message: string;
};

const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_PROFILE_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

export default function UserInfoCard({
  profile,
  onProfileUpdated,
}: UserInfoCardProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [picture, setPicture] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    setFirstName(profile.firstName || "");
    setLastName(profile.lastName || "");
    setEmail(profile.email || "");
    setPhoneNumber(profile.phoneNumber || "");
  }, [profile]);

  const handlePictureChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextPicture = event.target.files?.[0] || null;
    setFeedback(null);

    if (!nextPicture) {
      setPicture(null);
      return;
    }

    if (!ALLOWED_PROFILE_IMAGE_TYPES.has(nextPicture.type)) {
      setPicture(null);
      setFileInputKey((key) => key + 1);
      setFeedback({
        variant: "error",
        title: "Unsupported profile picture",
        message: "Choose a JPEG, PNG, GIF, or WebP image.",
      });
      return;
    }

    if (nextPicture.size > MAX_PROFILE_IMAGE_BYTES) {
      setPicture(null);
      setFileInputKey((key) => key + 1);
      setFeedback({
        variant: "error",
        title: "Profile picture is too large",
        message: "Choose an image smaller than 5 MB.",
      });
      return;
    }

    setPicture(nextPicture);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    const normalizedFirstName = firstName.trim();
    const normalizedLastName = lastName.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhoneNumber = phoneNumber.trim();

    if (!normalizedFirstName || !normalizedLastName || !normalizedPhoneNumber) {
      setFeedback({
        variant: "error",
        title: "Complete the required fields",
        message: "First name, last name, and phone number are required.",
      });
      return;
    }

    if (
      normalizedEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      setFeedback({
        variant: "error",
        title: "Check your email address",
        message: "Enter a valid email address or leave the field empty.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("firstName", normalizedFirstName);
    formData.append("lastName", normalizedLastName);
    formData.append("email", normalizedEmail);
    formData.append("phoneNumber", normalizedPhoneNumber);
    if (picture) formData.append("picture", picture);

    try {
      setIsSaving(true);
      const response = await referralAPI.updateProfile(formData);
      const updatedProfile = response.data?.user;

      if (response.error || !updatedProfile) {
        throw new Error(response.message || "The profile could not be updated.");
      }

      onProfileUpdated(updatedProfile);
      setPicture(null);
      setFileInputKey((key) => key + 1);
      setFeedback({
        variant: "success",
        title: "Profile updated",
        message: response.message || "Your account information is up to date.",
      });
    } catch (error) {
      setFeedback({
        variant: "error",
        title: "Profile not updated",
        message:
          error instanceof Error
            ? error.message
            : "Please check your details and try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const payoutAccount = profile.bankName
    ? `${profile.bankName}${
        profile.accountNumber
          ? ` •••• ${profile.accountNumber.slice(-4)}`
          : ""
      }`
    : "Not configured";

  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-NG", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Not available";

  return (
    <section className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800 lg:p-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Account information
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          These details come directly from your referrer account.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DetailItem label="Email" value={profile.email || "Not provided"} />
        <DetailItem label="Phone number" value={profile.phoneNumber} />
        <DetailItem label="Payout account" value={payoutAccount} />
        <DetailItem label="Member since" value={memberSince} />
      </div>

      <div className="my-7 border-t border-gray-200 dark:border-gray-800" />

      <div>
        <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">
          Edit personal information
        </h4>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Update the contact information attached to your referral account.
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

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <Label htmlFor="profile-first-name">
              First name <span className="text-error-500">*</span>
            </Label>
            <Input
              id="profile-first-name"
              name="firstName"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              autoComplete="given-name"
              required
              disabled={isSaving}
            />
          </div>

          <div>
            <Label htmlFor="profile-last-name">
              Last name <span className="text-error-500">*</span>
            </Label>
            <Input
              id="profile-last-name"
              name="lastName"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              autoComplete="family-name"
              required
              disabled={isSaving}
            />
          </div>

          <div>
            <Label htmlFor="profile-email">Email</Label>
            <Input
              id="profile-email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              disabled={isSaving}
            />
          </div>

          <div>
            <Label htmlFor="profile-phone-number">
              Phone number <span className="text-error-500">*</span>
            </Label>
            <Input
              id="profile-phone-number"
              name="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              autoComplete="tel"
              required
              disabled={isSaving}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="profile-picture">Profile picture</Label>
            <FileInput
              key={fileInputKey}
              id="profile-picture"
              name="picture"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handlePictureChange}
              disabled={isSaving}
            />
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              JPEG, PNG, GIF, or WebP. Maximum size 5 MB.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            size="sm"
            loading={isSaving}
            disabled={isSaving}
            loadingClassName="text-white"
          >
            Save changes
          </Button>
        </div>
      </form>
    </section>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 p-4 dark:bg-white/[0.03]">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-gray-800 dark:text-white/90">
        {value}
      </p>
    </div>
  );
}
