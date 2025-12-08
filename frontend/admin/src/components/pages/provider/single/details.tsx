/* eslint-disable @typescript-eslint/no-explicit-any */
import capitalizeWords from "@/lib/capitalize";

export default function Details({ data }: { data: any }) {
  console.log("Provider Details Data:", data);
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
      <h2 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
        Provider Details
      </h2>
      <ul className="divide-y divide-gray-100 dark:divide-gray-800">
        <li className="flex items-start gap-5 py-2.5">
          <span className="w-1/2 text-sm text-gray-500 sm:w-1/3 dark:text-gray-400">
            Category
          </span>
          <span className="w-1/2 text-sm text-gray-700 sm:w-2/3 dark:text-gray-400">
            {capitalizeWords(data?.category) || "N/A"}
          </span>
        </li>
        <li className="flex items-start gap-5 py-2.5">
          <span className="w-1/2 text-sm text-gray-500 sm:w-1/3 dark:text-gray-400">
            Code
          </span>
          <span className="w-1/2 text-sm text-gray-700 sm:w-2/3 dark:text-gray-400">
            {data?.code || "N/A"}
          </span>
        </li>
        <li className="flex items-start gap-5 py-2.5">
          <span className="w-1/2 text-sm text-gray-500 sm:w-1/3 dark:text-gray-400">
            UPN
          </span>
          <span className="w-1/2 text-sm text-gray-700 sm:w-2/3 dark:text-gray-400">
            {data?.upn || "N/A"}
          </span>
        </li>
        <li className="flex items-start gap-5 py-2.5">
          <span className="w-1/2 text-sm text-gray-500 sm:w-1/3 dark:text-gray-400">
            Email
          </span>
          <span className="w-1/2 text-sm text-gray-700 sm:w-2/3 dark:text-gray-400">
            {capitalizeWords(data?.email) || "N/A"}
          </span>
        </li>
        <li className="flex items-start gap-5 py-2.5">
          <span className="w-1/2 text-sm text-gray-500 sm:w-1/3 dark:text-gray-400">
            Phone Number
          </span>
          <span className="w-1/2 text-sm text-gray-700 sm:w-2/3 dark:text-gray-400">
            {capitalizeWords(data?.phoneNumber) || "N/A"}
          </span>
        </li>
        <li className="flex items-start gap-5 py-2.5">
          <span className="w-1/2 text-sm text-gray-500 sm:w-1/3 dark:text-gray-400">
            Secondary Phone Number
          </span>
          <span className="w-1/2 text-sm text-gray-700 sm:w-2/3 dark:text-gray-400">
            {capitalizeWords(data?.secondaryPhoneNumber) || "N/A"}
          </span>
        </li>

        <li className="flex items-start gap-5 py-2.5">
          <span className="w-1/2 text-sm text-gray-500 sm:w-1/3 dark:text-gray-400">
            Address
          </span>
          <span className="w-1/2 text-sm text-gray-700 sm:w-2/3 dark:text-gray-400">
            {capitalizeWords(data?.address) || "N/A"}
          </span>
        </li>
        <li className="flex items-start gap-5 py-2.5">
          <span className="w-1/2 text-sm text-gray-500 sm:w-1/3 dark:text-gray-400">
            Website
          </span>
          <span className="w-1/2 text-sm text-gray-700 sm:w-2/3 dark:text-gray-400">
            {data?.website || "N/A"}
          </span>
        </li>
        <li className="flex items-start gap-5 py-2.5">
          <span className="w-1/2 text-sm text-gray-500 sm:w-1/3 dark:text-gray-400">
            Country
          </span>
          <span className="w-1/2 text-sm text-gray-700 sm:w-2/3 dark:text-gray-400">
            {capitalizeWords(data?.country) || "N/A"}
          </span>
        </li>
        <li className="flex items-start gap-5 py-2.5">
          <span className="w-1/2 text-sm text-gray-500 sm:w-1/3 dark:text-gray-400">
            State
          </span>
          <span className="w-1/2 text-sm text-gray-700 sm:w-2/3 dark:text-gray-400">
            {capitalizeWords(data?.state) || "N/A"}
          </span>
        </li>
        <li className="flex items-start gap-5 py-2.5">
          <span className="w-1/2 text-sm text-gray-500 sm:w-1/3 dark:text-gray-400">
            LGA
          </span>
          <span className="w-1/2 text-sm text-gray-700 sm:w-2/3 dark:text-gray-400">
            {capitalizeWords(data?.lga) || "N/A"}
          </span>
        </li>
        {/* <li className="flex items-start gap-5 py-2.5">
          <span className="w-1/2 text-sm text-gray-500 sm:w-1/3 dark:text-gray-400">
            Payment Batch
          </span>
          <span className="w-1/2 text-sm text-gray-700 sm:w-2/3 dark:text-gray-400">
            {capitalizeWords(data?.paymentBatch) || "N/A"}
          </span>
        </li> */}
        <li className="flex items-start gap-5 py-2.5">
          <span className="w-1/2 text-sm text-gray-500 sm:w-1/3 dark:text-gray-400">
            Bank Name
          </span>
          <span className="w-1/2 text-sm text-gray-700 sm:w-2/3 dark:text-gray-400">
            {capitalizeWords(data?.bank) || "N/A"}
          </span>
        </li>
        <li className="flex items-start gap-5 py-2.5">
          <span className="w-1/2 text-sm text-gray-500 sm:w-1/3 dark:text-gray-400">
            Bank Branch
          </span>
          <span className="w-1/2 text-sm text-gray-700 sm:w-2/3 dark:text-gray-400">
            {capitalizeWords(data?.bankBranch) || "N/A"}
          </span>
        </li>
        <li className="flex items-start gap-5 py-2.5">
          <span className="w-1/2 text-sm text-gray-500 sm:w-1/3 dark:text-gray-400">
            Account Name
          </span>
          <span className="w-1/2 text-sm text-gray-700 sm:w-2/3 dark:text-gray-400">
            {capitalizeWords(data?.accountName) || "N/A"}
          </span>
        </li>
        <li className="flex items-start gap-5 py-2.5">
          <span className="w-1/2 text-sm text-gray-500 sm:w-1/3 dark:text-gray-400">
            Account Number
          </span>
          <span className="w-1/2 text-sm text-gray-700 sm:w-2/3 dark:text-gray-400">
            {capitalizeWords(data?.accountNumber) || "N/A"}
          </span>
        </li>
        <li className="flex items-start gap-5 py-2.5">
          <span className="w-1/2 text-sm text-gray-500 sm:w-1/3 dark:text-gray-400">
            Manager
          </span>
          <span className="w-1/2 text-sm text-gray-700 sm:w-2/3 dark:text-gray-400">
            {capitalizeWords(
              data?.manager.firstName + data?.manager.lastName
            ) || "N/A"}
          </span>
        </li>
        <li className="flex items-start gap-5 py-2.5">
          <span className="w-1/2 text-sm text-gray-500 sm:w-1/3 dark:text-gray-400">
            Provider Specialization
          </span>
          <span className="w-1/2 text-sm text-gray-700 sm:w-2/3 dark:text-gray-400">
            {capitalizeWords(data?.ProviderSpecialization.name) || "N/A"}
          </span>
        </li>
      </ul>
    </div>
  );
}
