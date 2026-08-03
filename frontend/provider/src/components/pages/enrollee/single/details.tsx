/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import IdCardModal from "@/components/modals/idCardModal";
import capitalizeWords from "@/lib/capitalize";
import { useState } from "react";

const formatDate = (date: string | null | undefined) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function Details({ data }: { data: any }) {
  const [showIdCard, setShowIdCard] = useState(false);

  const DetailRow = ({
    label,
    value,
  }: {
    label: string;
    value: string | number | boolean | null | undefined;
  }) => (
    <li className="flex items-start gap-5 py-2.5">
      <span className="w-1/2 text-sm text-gray-500 sm:w-1/3 dark:text-gray-400">
        {label}
      </span>
      <span className="w-1/2 text-sm text-gray-700 sm:w-2/3 dark:text-gray-400">
        {value ? String(value) : "N/A"}
      </span>
    </li>
  );

  return (
    <>
      {/* Row 1: Personal Information & Address Information */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Personal Information */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
          <h2 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
            Personal Information
          </h2>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            <DetailRow
              label="First Name"
              value={capitalizeWords(data?.firstName)}
            />
            <DetailRow
              label="Middle Name"
              value={capitalizeWords(data?.middleName)}
            />
            <DetailRow
              label="Last Name"
              value={capitalizeWords(data?.lastName)}
            />
            <DetailRow
              label="Date of Birth"
              value={formatDate(data?.dateOfBirth)}
            />
            <DetailRow label="Gender" value={capitalizeWords(data?.gender)} />
            <DetailRow label="Email" value={data?.email} />
            <DetailRow label="Phone Number" value={data?.phoneNumber} />
            <DetailRow
              label="Occupation"
              value={capitalizeWords(data?.occupation)}
            />
            <DetailRow
              label="Marital Status"
              value={capitalizeWords(data?.maritalStatus)}
            />
          </ul>
        </div>

        {/* Address Information */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
          <h2 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
            Address Information
          </h2>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            <DetailRow label="Address" value={data?.address} />
            <DetailRow label="State" value={capitalizeWords(data?.state)} />
            <DetailRow label="LGA" value={capitalizeWords(data?.lga)} />
          </ul>
        </div>
      </div>

      {/* Row 2: Enrollment Information & Medical & Coverage Information */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-4">
        {/* Enrollment Information */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
          <h2 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
            Enrollment Information
          </h2>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            <DetailRow label="Policy Number" value={data?.policyNumber} />
            <DetailRow label="Staff ID" value={data?.Staff.staffId} />
            <DetailRow label="Company" value={data?.Company?.name} />
            <DetailRow label="Company Plan" value={data?.CompanyPlan?.name} />
            <DetailRow
              label="Status"
              value={data?.isActive ? "Active" : "Inactive"}
            />
            <DetailRow
              label="Verified"
              value={data?.isVerified ? "Yes" : "No"}
            />
            <DetailRow
              label="Verified At"
              value={formatDate(data?.verifiedAt)}
            />
          </ul>
        </div>

        {/* Medical & Coverage Information */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
          <h2 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
            Medical & Coverage Information
          </h2>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            <DetailRow
              label="Max Dependents"
              value={data?.maxDependents ?? "N/A"}
            />
            <DetailRow
              label="Pre-existing Medical Records"
              value={data?.preexistingMedicalRecords}
            />
            <DetailRow
              label="Expiration Date"
              value={formatDate(data?.expirationDate)}
            />
          </ul>
        </div>
      </div>

      {/* Row 3: Additional Information (Full Width) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3 mt-4">
        <h2 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
          Additional Information
        </h2>
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          <DetailRow label="Date Added" value={formatDate(data?.createdAt)} />
          {data?.pictureUrl && (
            <li className="flex items-start gap-5 py-2.5">
              <span className="w-1/2 text-sm text-gray-500 sm:w-1/3 dark:text-gray-400">
                Picture URL
              </span>
              <span className="w-1/2 text-sm text-blue-600 break-all sm:w-2/3 dark:text-blue-400">
                <a
                  href={data?.pictureUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:no-underline"
                >
                  View Picture
                </a>
              </span>
            </li>
          )}
          <li className="flex items-start gap-5 py-2.5">
            <span className="w-1/2 text-sm text-gray-500 sm:w-1/3 dark:text-gray-400">
              ID Card
            </span>
            <span className="w-1/2 text-sm text-blue-600 sm:w-2/3 dark:text-blue-400">
              <button
                type="button"
                onClick={() => setShowIdCard(true)}
                className="underline hover:no-underline"
              >
                View ID Card
              </button>
            </span>
          </li>
        </ul>
      </div>

      <IdCardModal
        isOpen={showIdCard}
        onClose={() => setShowIdCard(false)}
        idCardData={{
          policyNumber: data?.policyNumber || "N/A",
          firstName: data?.firstName || "",
          lastName: data?.lastName || "",
          gender: data?.gender || "M",
          pictureUrl: data?.pictureUrl,
          plan:
            data?.CompanyPlan?.name ||
            data?.companyPlan?.name ||
            data?.plan?.name ||
            (typeof data?.plan === "string" ? data.plan : ""),
        }}
      />
    </>
  );
}
