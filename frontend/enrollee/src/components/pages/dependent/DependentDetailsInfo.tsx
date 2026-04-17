"use client";

const formatDate = (date: string | null | undefined) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const capitalizeWords = (str: string | null | undefined) => {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function DependentDetailsInfo({
  data,
}: {
  data: {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    dateOfBirth?: string;
    gender?: string;
    relationshipToEnrollee?: string;
    email?: string;
    phoneNumber?: string;
    occupation?: string;
    maritalStatus?: string;
    enrollmentDate?: string;
    preexistingMedicalRecords?: string;
    notes?: string;
  } | null;
}) {
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
        {typeof value === "boolean" ? (value ? "Yes" : "No") : value || "N/A"}
      </span>
    </li>
  );

  return (
    <>
      {/* Row 1: Personal Information & Contact Information */}
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
            <DetailRow
              label="Relationship to Enrollee"
              value={capitalizeWords(data?.relationshipToEnrollee)}
            />
          </ul>
        </div>

        {/* Contact Information */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
          <h2 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
            Contact Information
          </h2>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            <DetailRow label="Email" value={data?.email} />
            <DetailRow label="Phone Number" value={data?.phoneNumber} />
            <DetailRow label="Occupation" value={data?.occupation} />
            <DetailRow
              label="Marital Status"
              value={capitalizeWords(data?.maritalStatus)}
            />
            <DetailRow
              label="Enrollment Date"
              value={formatDate(data?.enrollmentDate)}
            />
          </ul>
        </div>
      </div>

      {/* Row 2: Medical Information & Additional Notes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-4">
        {/* Medical Information */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
          <h2 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
            Medical Information
          </h2>
          {data?.preexistingMedicalRecords ? (
            <p className="text-sm text-gray-700 dark:text-gray-400 whitespace-pre-wrap">
              {data?.preexistingMedicalRecords}
            </p>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">N/A</p>
          )}
        </div>

        {/* Additional Notes */}
        {data?.notes && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
            <h2 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
              Notes
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-400 whitespace-pre-wrap">
              {data?.notes}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
