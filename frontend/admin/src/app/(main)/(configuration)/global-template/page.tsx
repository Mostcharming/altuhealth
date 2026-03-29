import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Global Template Settings",
  description:
    "Manage global notification templates within the AltuHealth admin panel.",
};

export default function GlobalTemplate() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Global Template" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Global Template Settings
        </h3>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Configure default template settings that apply across all notification
          channels.
        </p>

        <div className="grid grid-cols-1 gap-6">
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <h4 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">
              Template Variables
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Available variables that can be used in your templates:
            </p>
            <ul className="space-y-2">
              <li className="text-sm text-gray-700 dark:text-gray-300">
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {"{{"} firstName {"}}"}
                </code>
                - User&apos;s first name
              </li>
              <li className="text-sm text-gray-700 dark:text-gray-300">
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {"{{"} lastName {"}}"}
                </code>
                - User&apos;s last name
              </li>
              <li className="text-sm text-gray-700 dark:text-gray-300">
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {"{{"} email {"}}"}
                </code>
                - User&apos;s email address
              </li>
              <li className="text-sm text-gray-700 dark:text-gray-300">
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {"{{"} verificationCode {"}}"}
                </code>
                - Verification or OTP code
              </li>
              <li className="text-sm text-gray-700 dark:text-gray-300">
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {"{{"} appName {"}}"}
                </code>
                - Application name
              </li>
              <li className="text-sm text-gray-700 dark:text-gray-300">
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {"{{"} supportEmail {"}}"}
                </code>
                - Support email address
              </li>
            </ul>
          </div>

          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <h4 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">
              Template Best Practices
            </h4>
            <ul className="space-y-2">
              <li className="text-sm text-gray-700 dark:text-gray-300">
                ✓ Keep email subject lines concise and descriptive
              </li>
              <li className="text-sm text-gray-700 dark:text-gray-300">
                ✓ Use personalization variables to increase engagement
              </li>
              <li className="text-sm text-gray-700 dark:text-gray-300">
                ✓ Ensure SMS templates are under 160 characters for single
                message delivery
              </li>
              <li className="text-sm text-gray-700 dark:text-gray-300">
                ✓ Always include a call-to-action in your templates
              </li>
              <li className="text-sm text-gray-700 dark:text-gray-300">
                ✓ Test templates before activating them
              </li>
              <li className="text-sm text-gray-700 dark:text-gray-300">
                ✓ Maintain consistent branding across all templates
              </li>
            </ul>
          </div>

          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <h4 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">
              Common Templates
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                <h5 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                  Welcome Email
                </h5>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  Sent when a new user registers
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                <h5 className="text-sm font-medium text-green-900 dark:text-green-300 mb-1">
                  Password Reset
                </h5>
                <p className="text-xs text-green-700 dark:text-green-400">
                  Sent for password recovery
                </p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-800">
                <h5 className="text-sm font-medium text-purple-900 dark:text-purple-300 mb-1">
                  Verification Code
                </h5>
                <p className="text-xs text-purple-700 dark:text-purple-400">
                  Sent for email/SMS verification
                </p>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800">
                <h5 className="text-sm font-medium text-orange-900 dark:text-orange-300 mb-1">
                  Notification Alert
                </h5>
                <p className="text-xs text-orange-700 dark:text-orange-400">
                  Sent for system alerts
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
