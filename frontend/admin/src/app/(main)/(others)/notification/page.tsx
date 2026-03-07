import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Notification Logs",
  description: "View notification logs within the AltuHealth admin panel.",
};

export default function NotificationLogs() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
        Notification Logs
      </h3>
      {/* Content goes here */}
    </div>
  );
}
