"use client";

import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { PencilIcon } from "@/icons";
import { apiClient } from "@/lib/apiClient";
import { useNotificationTemplateStore } from "@/lib/store/notificationTemplateStore";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

interface NotificationTemplate {
  id: string;
  name: string;
  subject?: string;
}

const NotificationTemplatesTable: React.FC = () => {
  const router = useRouter();
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const templates = useNotificationTemplateStore(
    (state: { templates: NotificationTemplate[] }) => state.templates
  );
  const setTemplates = useNotificationTemplateStore(
    (state: { setTemplates: (items: NotificationTemplate[]) => void }) =>
      state.setTemplates
  );

  const fetch = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (search) params.append("q", search);

      const url = `/admin/notification-templates/list`;

      const data = await apiClient(url, {
        method: "GET",
        onLoading: (l: boolean) => setLoading(l),
      });

      const items: NotificationTemplate[] =
        data?.data.data && Array.isArray(data.data.data)
          ? data.data.data
          : Array.isArray(data)
          ? data
          : [];

      setTemplates(items);
    } catch (err) {
      console.warn("Template fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [search, setTemplates]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return (
    <div className="mt-7 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Notification Templates Listing
          </h3>
        </div>

        <div className="flex gap-3.5">
          <div className="hidden flex-col gap-3 sm:flex sm:flex-row sm:items-center">
            <div className="relative">
              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <svg
                  className="fill-current"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.04199 9.37363C3.04199 5.87693 5.87735 3.04199 9.37533 3.04199C12.8733 3.04199 15.7087 5.87693 15.7087 9.37363C15.7087 12.8703 12.8733 15.7053 9.37533 15.7053C5.87735 15.7053 3.04199 12.8703 3.04199 9.37363ZM9.37533 1.54199C5.04926 1.54199 1.54199 5.04817 1.54199 9.37363C1.54199 13.6991 5.04926 17.2053 9.37533 17.2053C11.2676 17.2053 13.0032 16.5344 14.3572 15.4176L17.1773 18.238C17.4702 18.5309 17.945 18.5309 18.2379 18.238C18.5308 17.9451 18.5309 17.4703 18.238 17.1773L15.4182 14.3573C16.5367 13.0033 17.2087 11.2669 17.2087 9.37363C17.2087 5.04817 13.7014 1.54199 9.37533 1.54199Z"
                    fill=""
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search..."
                className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pr-4 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden xl:w-[300px] dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearch(e.target.value)
                }
              />
            </div>
          </div>
        </div>
      </div>
      {loading ? (
        <SpinnerThree />
      ) : (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                <th className="p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400">
                  Template Name
                </th>
                <th className="p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400">
                  Subject
                </th>
                <th className="p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-x divide-y divide-gray-200 dark:divide-gray-800">
              {templates.map((template: NotificationTemplate) => (
                <tr
                  key={template.id}
                  className="transition hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <td className="p-4 whitespace-nowrap text-sm font-medium">
                    {template.name}
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {template.subject || "-"}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex items-center w-full gap-2">
                      <button
                        onClick={() =>
                          router.push(`/notification-templates/${template.id}`)
                        }
                        className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90"
                      >
                        <PencilIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default NotificationTemplatesTable;
