import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export const metadata: Metadata = {
  title: "AltuHealth Email Settings",
  description:
    "Manage email notification settings within the AltuHealth admin panel.",
};

export default function EmailSetting() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Email Setting" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Email Configuration
        </h3>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Configure email settings for notification delivery.
        </p>

        <div className="grid grid-cols-1 gap-6">
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <h4 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">
              SMTP Configuration
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SMTP Server
                </label>
                <input
                  type="text"
                  placeholder="smtp.gmail.com"
                  disabled
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    placeholder="587"
                    disabled
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Encryption
                  </label>
                  <input
                    type="text"
                    placeholder="TLS"
                    disabled
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  From Email Address
                </label>
                <input
                  type="email"
                  placeholder="noreply@altuhealth.com"
                  disabled
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  From Name
                </label>
                <input
                  type="text"
                  placeholder="AltuHealth"
                  disabled
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                />
              </div>
            </div>
          </div>

          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <h4 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">
              Email Features
            </h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  disabled
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Enable HTML Emails
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  disabled
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Enable Email Templates
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  disabled
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Send Test Email
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  disabled
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Track Email Opens
                </span>
              </label>
            </div>
          </div>

          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
            <h4 className="text-base font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Email Status
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              ✓ Email service is properly configured and ready to send
              notifications
            </p>
          </div>

          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <h4 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">
              Email Statistics
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Total Sent
                </p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white/90">
                  1,250
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Opened
                </p>
                <p className="text-2xl font-bold text-green-600">856 (68%)</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Failed
                </p>
                <p className="text-2xl font-bold text-red-600">12 (1%)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
