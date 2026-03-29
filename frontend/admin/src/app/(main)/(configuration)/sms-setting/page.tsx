import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export const metadata: Metadata = {
  title: "AltuHealth SMS Settings",
  description:
    "Manage SMS notification settings within the AltuHealth admin panel.",
};

export default function SmsSetting() {
  return (
    <div>
      <PageBreadcrumb pageTitle="SMS Setting" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          SMS Configuration
        </h3>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Configure SMS settings for notification delivery.
        </p>

        <div className="grid grid-cols-1 gap-6">
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <h4 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">
              SMS Gateway Configuration
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SMS Provider
                </label>
                <input
                  type="text"
                  placeholder="Twilio"
                  disabled
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••••••"
                  disabled
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sender ID
                </label>
                <input
                  type="text"
                  placeholder="AltuHealth"
                  disabled
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Character Limit
                  </label>
                  <input
                    type="number"
                    placeholder="160"
                    disabled
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cost per SMS
                  </label>
                  <input
                    type="text"
                    placeholder="$0.05"
                    disabled
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <h4 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">
              SMS Features
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
                  Enable SMS Notifications
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
                  Allow Scheduled SMS
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  disabled
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Send Test SMS
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
                  Track SMS Delivery
                </span>
              </label>
            </div>
          </div>

          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
            <h4 className="text-base font-semibold text-green-900 dark:text-green-300 mb-2">
              SMS Status
            </h4>
            <p className="text-sm text-green-700 dark:text-green-400">
              ✓ SMS service is properly configured and ready to send
              notifications
            </p>
          </div>

          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <h4 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">
              SMS Statistics
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Total Sent
                </p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white/90">
                  3,820
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Delivered
                </p>
                <p className="text-2xl font-bold text-green-600">3,756 (98%)</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Failed
                </p>
                <p className="text-2xl font-bold text-red-600">64 (2%)</p>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <h4 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">
              Supported Countries
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              SMS notifications can be sent to the following countries:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                • United States (+1)
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                • Canada (+1)
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                • United Kingdom (+44)
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                • Nigeria (+234)
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                • Australia (+61)
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                • Germany (+49)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
