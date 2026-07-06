/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useAuthStore } from "@/lib/authStore";
import capitalizeWords from "@/lib/capitalize";
import { APP_CONFIG } from "@/lib/config";
import { formatDate } from "@/lib/formatDate";
import { DownloadIcon } from "@/icons";
import { useState } from "react";

export default function SinglePHeader({ data }: { data: any }) {
  const token = useAuthStore((s) => s.token);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadEnrollees = async () => {
    if (!data?.id) return;

    try {
      setDownloading(true);
      const response = await fetch(
        `${APP_CONFIG.API_BASE_URL}/admin/staffs/company/${data.id}/enrollees/download`,
        {
          method: "GET",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to download enrollee list");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeName = String(data?.name || "company")
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase();

      link.href = url;
      link.download = `${safeName || "company"}-enrollees.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download enrollee list:", error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col justify-between gap-6 rounded-2xl border border-gray-200 bg-white px-6 py-5 sm:flex-row sm:items-center dark:border-gray-800 dark:bg-white/3">
        <div className="flex flex-col gap-2.5 divide-gray-300 sm:flex-row sm:divide-x dark:divide-gray-700">
          <div className="flex items-center gap-2 sm:pr-3">
            <span className="text-base font-medium text-gray-700 dark:text-gray-400">
              Name: {capitalizeWords(data?.name)}
            </span>
            {/* <span className={getStatusClasses(data?.status)}>
              {capitalizeWords(data?.status)}
            </span> */}
          </div>
          <p className="text-sm text-gray-500 sm:pl-3 dark:text-gray-400">
            Created date: {formatDate(data?.createdAt)}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadEnrollees}
            disabled={downloading}
            className="shadow-theme-xs inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
          >
            <DownloadIcon />
            {downloading ? "Downloading..." : "Download Enrollee List"}
          </button>
        </div>
      </div>
    </>
  );
}
