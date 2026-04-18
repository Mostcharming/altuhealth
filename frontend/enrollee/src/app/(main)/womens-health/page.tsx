import WomensHealthCalendar from "@/components/WomensHealthCalendar";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Women's Health | Altu Health",
  description:
    "Track your menstrual cycle, predict your period, and monitor your fertile window with our women's health tracker.",
};

export default function WomensHealthPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Women's Health" />
      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6 lg:p-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Women's Health Tracker
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor your menstrual cycle, track your period, and get insights
              about your fertile window and ovulation dates.
            </p>
          </div>

          {/* Health Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20 p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                📊 Track Your Cycle
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Log your last period start date to get accurate predictions for
                your next cycle.
              </p>
            </div>
            <div className="rounded-lg border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20 p-4">
              <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2">
                💚 Fertile Window
              </h3>
              <p className="text-sm text-green-800 dark:text-green-200">
                Understand your fertile window to plan family activities or for
                family planning purposes.
              </p>
            </div>
            <div className="rounded-lg border border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/20 p-4">
              <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
                🩺 Health Insights
              </h3>
              <p className="text-sm text-purple-800 dark:text-purple-200">
                Get personalized health insights based on your cycle data.
              </p>
            </div>
            <div className="rounded-lg border border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/20 p-4">
              <h3 className="font-semibold text-orange-900 dark:text-orange-300 mb-2">
                ⏰ Cycle Predictions
              </h3>
              <p className="text-sm text-orange-800 dark:text-orange-200">
                Get accurate predictions for your next period, ovulation, and
                fertile window.
              </p>
            </div>
          </div>
        </div>

        {/* Calendar Component */}
        <WomensHealthCalendar />
      </div>
    </div>
  );
}
