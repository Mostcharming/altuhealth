"use client";
import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/lib/authStore";
import { Account, useAccountStore } from "@/lib/store/accountStore";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import SpinnerThree from "../ui/spinner/SpinnerThree";

export default function UserMetaCard() {
  const account = useAccountStore((s) => s.account);
  const setAccount = useAccountStore((s) => s.setAccount);
  const [loading, setLoading] = useState(true);

  const user = useAuthStore((s) => s.user);

  const fetchAccount = useCallback(async () => {
    try {
      setLoading(true);

      const url = `/admin/account/profile`;

      const data = await apiClient(url, {
        method: "GET",
        onLoading: (l) => setLoading(l),
      });

      const items: Account = data.data.user;

      setAccount(items);
    } catch (err) {
      console.warn("Role fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [setAccount]);

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          {loading ? (
            <SpinnerThree />
          ) : (
            <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
              <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                <Image
                  width={80}
                  height={80}
                  src={account?.picture || "/images/main/small.svg"}
                  alt="user"
                />
              </div>
              <div className="order-3 xl:order-2">
                <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                  {account?.firstName || "John"} {account?.lastName || "Doe"}
                </h4>
                <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user?.role}
                  </p>
                  <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {account?.currentLocation || "Unknown Location"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
