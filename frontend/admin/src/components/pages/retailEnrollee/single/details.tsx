/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import ErrorModal from "@/components/modals/error";
import IdCardModal from "@/components/modals/idCardModal";
import { useModal } from "@/hooks/useModal";
import { apiClient } from "@/lib/apiClient";
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

export default function RetailEnrolleeDetails({ data }: { data: any }) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showIdCard, setShowIdCard] = useState(false);
  const errorModal = useModal();

  const handleViewIdCard = async () => {
    try {
      setLoading(true);
      const response = await apiClient(
        `/admin/retail-enrollees/${data?.id}/download-id-card`,
        {
          method: "GET",
          onLoading: (l: boolean) => setLoading(l),
        }
      );

      if (response?.data.idCardUrl) {
        setShowIdCard(true);
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to fetch ID card"
      );
      errorModal.openModal();
    } finally {
      setLoading(false);
    }
  };

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
          </ul>
        </div>

        {/* Address Information */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
          <h2 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
            Address Information
          </h2>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            <DetailRow label="Country" value={capitalizeWords(data?.country)} />
            <DetailRow label="State" value={capitalizeWords(data?.state)} />
            <DetailRow label="LGA" value={capitalizeWords(data?.lga)} />
          </ul>
        </div>
      </div>

      {/* Row 2: Subscription Information & Coverage Information */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-4">
        {/* Subscription Information */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
          <h2 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
            Subscription Information
          </h2>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            <DetailRow label="Policy Number" value={data?.policyNumber} />
            <DetailRow label="Plan" value={data?.plan?.name} />
            <DetailRow
              label="Subscription Start Date"
              value={formatDate(data?.subscriptionStartDate)}
            />
            <DetailRow
              label="Subscription End Date"
              value={formatDate(data?.subscriptionEndDate)}
            />
            <DetailRow
              label="Status"
              value={data?.isActive ? "Active" : "Inactive"}
            />
          </ul>
        </div>

        {/* Coverage Information */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
          <h2 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
            Coverage Information
          </h2>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            <DetailRow
              label="Max Dependents"
              value={data?.maxDependents ?? "N/A"}
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
      </div>

      {/* Row 3: Additional Information (Full Width) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3 mt-4">
        <h2 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
          Additional Information
        </h2>
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          <DetailRow label="Date Added" value={formatDate(data?.createdAt)} />

          <li className="flex items-start gap-5 py-2.5">
            <span className="w-1/2 text-sm text-gray-500 sm:w-1/3 dark:text-gray-400">
              ID Card
            </span>
            <span className="w-1/2 sm:w-2/3">
              <button
                onClick={handleViewIdCard}
                disabled={loading}
                className="shadow-theme-xs inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
              >
                {loading ? "Processing..." : "View ID Card"}
              </button>
            </span>
          </li>
        </ul>
      </div>

      <ErrorModal
        message={errorMessage}
        errorModal={errorModal}
        handleErrorClose={() => {
          errorModal.closeModal();
        }}
      />

      <IdCardModal
        isOpen={showIdCard}
        onClose={() => setShowIdCard(false)}
        idCardData={{
          policyNumber: data?.policyNumber || "N/A",
          firstName: data?.firstName || "",
          lastName: data?.lastName || "",
          gender: data?.gender || "M",
          pictureUrl: data?.pictureUrl,
          plan: data?.plan?.name || "",
        }}
      />
    </>
  );
}
