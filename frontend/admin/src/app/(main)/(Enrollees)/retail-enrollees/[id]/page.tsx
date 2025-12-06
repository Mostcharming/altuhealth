/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import PageBreadcrumbSub from "@/components/common/PageBreadCrumbSub";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { getRetailEnrollee } from "@/lib/apis/retailEnrollee";
import capitalizeWords from "@/lib/capitalize";
import { formatDate } from "@/lib/formatDate";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SingleRetailEnrollee() {
  const params = useParams();
  const id = params.id as string;
  const [enrollee, setEnrollee] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollee = async () => {
      try {
        setLoading(true);
        const response = await getRetailEnrollee(id);

        if (response?.data) {
          setEnrollee(response.data.enrollee);
        }
      } catch (error) {
        console.error("Failed to fetch retail enrollee:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEnrollee();
    }
  }, [id]);

  const pageTitle = enrollee
    ? `${capitalizeWords(enrollee?.firstName)} ${capitalizeWords(
        enrollee?.lastName
      )}`
    : "Single Retail Enrollee";

  return (
    <div>
      {loading ? (
        <SpinnerThree />
      ) : enrollee ? (
        <>
          <PageBreadcrumbSub
            parentTitle="Retail Enrollees"
            parentHref="/retail-enrollees"
            currentTitle={pageTitle}
          />
          <div className="space-y-6 mt-6">
            {/* Header Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-base font-medium text-gray-700 dark:text-gray-400">
                    Name:{" "}
                    {capitalizeWords(
                      enrollee?.firstName +
                        enrollee?.middleName +
                        enrollee?.lastName
                    )}
                  </span>
                </div>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                    enrollee.isActive
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {enrollee.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Details Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <h2 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Email
                  </p>
                  <p className="mt-1 text-gray-800 dark:text-white/90">
                    {capitalizeWords(enrollee.email)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Phone Number
                  </p>
                  <p className="mt-1 text-gray-800 dark:text-white/90">
                    {enrollee.phoneNumber || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Date of Birth
                  </p>
                  <p className="mt-1 text-gray-800 dark:text-white/90">
                    {formatDate(enrollee.dateOfBirth) || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Country
                  </p>
                  <p className="mt-1 text-gray-800 dark:text-white/90">
                    {enrollee.country || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    State
                  </p>
                  <p className="mt-1 text-gray-800 dark:text-white/90">
                    {enrollee.state || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    LGA
                  </p>
                  <p className="mt-1 text-gray-800 dark:text-white/90">
                    {enrollee.lga || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Subscription Details Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <h2 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
                Subscription Information
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Plan
                  </p>
                  <p className="mt-1 text-gray-800 dark:text-white/90">
                    {capitalizeWords(enrollee.plan?.name) || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Subscription Start Date
                  </p>
                  <p className="mt-1 text-gray-800 dark:text-white/90">
                    {formatDate(enrollee.subscriptionStartDate) || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Subscription End Date
                  </p>
                  <p className="mt-1 text-gray-800 dark:text-white/90">
                    {formatDate(enrollee.subscriptionEndDate) || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Max Dependents
                  </p>
                  <p className="mt-1 text-gray-800 dark:text-white/90">
                    {enrollee.maxDependents || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Metadata Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <h2 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
                Additional Information
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Date Created
                  </p>
                  <p className="mt-1 text-gray-800 dark:text-white/90">
                    {enrollee.createdAt ? formatDate(enrollee.createdAt) : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-center text-gray-500 dark:text-gray-400">
            Retail enrollee not found
          </p>
        </div>
      )}
    </div>
  );
}
