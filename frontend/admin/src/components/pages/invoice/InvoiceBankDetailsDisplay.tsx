import { InvoiceBankDetails } from "@/lib/store/invoiceStore";

interface InvoiceBankDetailsDisplayProps {
  bankDetails?: InvoiceBankDetails | null;
  className?: string;
}

export default function InvoiceBankDetailsDisplay({
  bankDetails,
  className = "",
}: InvoiceBankDetailsDisplayProps) {
  if (!bankDetails) return null;

  return (
    <div
      className={`rounded-lg border border-brand-100 bg-brand-50/60 p-4 dark:border-brand-900/40 dark:bg-brand-900/10 ${className}`}
    >
      <h4 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white/90">
        Bank Transfer Details
      </h4>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-gray-500 dark:text-gray-400">Bank</dt>
          <dd className="font-medium text-gray-800 dark:text-white/90">
            {bankDetails.bankName}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500 dark:text-gray-400">
            Account Name
          </dt>
          <dd className="font-medium text-gray-800 dark:text-white/90">
            {bankDetails.accountName}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500 dark:text-gray-400">
            Account Number
          </dt>
          <dd className="font-medium tracking-wide text-gray-800 dark:text-white/90">
            {bankDetails.accountNumber}
          </dd>
        </div>
        {bankDetails.sortCode && (
          <div>
            <dt className="text-xs text-gray-500 dark:text-gray-400">
              Sort Code
            </dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {bankDetails.sortCode}
            </dd>
          </div>
        )}
        {bankDetails.swiftCode && (
          <div>
            <dt className="text-xs text-gray-500 dark:text-gray-400">
              SWIFT Code
            </dt>
            <dd className="font-medium text-gray-800 dark:text-white/90">
              {bankDetails.swiftCode}
            </dd>
          </div>
        )}
      </dl>
      {bankDetails.paymentInstructions && (
        <div className="mt-3 border-t border-brand-100 pt-3 dark:border-brand-900/40">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Payment Instructions
          </p>
          <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
            {bankDetails.paymentInstructions}
          </p>
        </div>
      )}
    </div>
  );
}
