"use client";

import { apiClient } from "@/lib/apiClient";
import { Account, useAccountStore } from "@/lib/store/accountStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";

export default function MissingProfilePictureModal() {
  const router = useRouter();
  const setAccount = useAccountStore((state) => state.setAccount);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkProfilePicture = async () => {
      try {
        const response = await apiClient("/enrollee/account/profile", {
          method: "GET",
        });
        const profile = response?.data?.user as Account | undefined;

        if (!isMounted || !profile) return;

        setAccount(profile);
        const hasProfilePicture =
          typeof profile.picture === "string" &&
          profile.picture.trim().length > 0;

        setIsOpen(!hasProfilePicture);
      } catch (error) {
        console.warn("Unable to check enrollee profile picture", error);
      }
    };

    checkProfilePicture();

    return () => {
      isMounted = false;
    };
  }, [setAccount]);

  const handleUploadNow = () => {
    setIsOpen(false);
    router.push("/profile#profile-picture");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      className="max-w-[520px] p-6 sm:p-8"
    >
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
          <svg
            aria-hidden="true"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.5 7.5L9.4 5.9C9.58 5.57 9.93 5.37 10.31 5.37H13.69C14.07 5.37 14.42 5.57 14.6 5.9L15.5 7.5H18C19.1 7.5 20 8.4 20 9.5V17.5C20 18.6 19.1 19.5 18 19.5H6C4.9 19.5 4 18.6 4 17.5V9.5C4 8.4 4.9 7.5 6 7.5H8.5Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 16.5C13.66 16.5 15 15.16 15 13.5C15 11.84 13.66 10.5 12 10.5C10.34 10.5 9 11.84 9 13.5C9 15.16 10.34 16.5 12 16.5Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        <h2 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Add a profile picture
        </h2>
        <p className="mx-auto max-w-[400px] text-sm leading-6 text-gray-500 dark:text-gray-400">
          Complete your profile by uploading a clear picture of yourself.
        </p>

        <div className="mt-8 flex flex-col-reverse justify-center gap-3 sm:flex-row">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Maybe later
          </Button>
          <Button size="sm" onClick={handleUploadNow}>
            Upload now
          </Button>
        </div>
      </div>
    </Modal>
  );
}
