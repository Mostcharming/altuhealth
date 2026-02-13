/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import DefaultTab from "@/components/pages/enrollee/single/DefaultTab";
import EnrolleeDetails from "@/components/pages/enrollee/single/details";
import EnrolleePHeader from "@/components/pages/enrollee/single/header";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { apiClient } from "@/lib/apiClient";
import { useParams, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import AiSidebarHistory from "./AiSidebarHistory";
import EnrolleeSearchContent from "./EnrolleeSearchContent";

export default function AiLayout({ children }: { children?: ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedEnrollee, setSelectedEnrollee] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [enrolleeData, setEnrolleeData] = useState<any | null>(null);
  const [enrolleeLoading, setEnrolleeLoading] = useState(false);

  // Fetch enrollee data when ID changes
  useEffect(() => {
    if (id) {
      const fetchEnrollee = async () => {
        try {
          setEnrolleeLoading(true);
          const response = await apiClient(`/admin/enrollees/${id}`);
          if (response.data) {
            setEnrolleeData(response.data.enrollee);
          }
        } catch (error) {
          console.error("Failed to fetch enrollee:", error);
        } finally {
          setEnrolleeLoading(false);
        }
      };

      fetchEnrollee();
    } else {
      setEnrolleeData(null);
    }
  }, [id]);

  const handleEnrolleeSelect = (enrollee: any) => {
    setSelectedEnrollee(enrollee);
    setIsLoading(true);
    router.push(`/enrollees/${enrollee.id}`);
  };

  return (
    <div className="relative h-[calc(100vh-134px)] xl:h-[calc(100vh-146px)] px-4 xl:flex xl:px-0">
      <div className="my-6 flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-3 xl:hidden dark:border-gray-800 dark:bg-gray-900">
        <h4 className="pl-2 text-lg font-medium text-gray-800 dark:text-white/90">
          Chats History
        </h4>
        <button
          onClick={() => setSidebarOpen(true)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M4 6L20 6M4 18L20 18M4 12L20 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <div className="flex-1 xl:py-10">
        <div className="relative mx-auto items-center max-w-[720px]">
          {children || (
            <>
              {enrolleeLoading ? (
                <SpinnerThree />
              ) : enrolleeData ? (
                <div className="space-y-6 mt-6">
                  <EnrolleePHeader data={enrolleeData} />
                  <div>
                    <EnrolleeDetails data={enrolleeData} />
                  </div>
                  {id && <DefaultTab id={id} />}
                </div>
              ) : (
                <EnrolleeSearchContent
                  selectedEnrollee={selectedEnrollee}
                  isLoading={isLoading}
                />
              )}
            </>
          )}
          {/* <!-- Fixed Input Wrapper --> */}
        </div>
      </div>

      <AiSidebarHistory
        isSidebarOpen={sidebarOpen}
        onCloseSidebar={() => setSidebarOpen(false)}
        onEnrolleeSelect={handleEnrolleeSelect}
      />
    </div>
  );
}
