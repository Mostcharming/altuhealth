"use client";

import { formatPrice } from "@/lib/formatDate";
import { InvoiceLineItem } from "@/lib/store/invoiceStore";

interface InvoiceDetailsTableProps {
  lineItems?: InvoiceLineItem[];
}

export default function InvoiceDetailsTable({
  lineItems = [],
}: InvoiceDetailsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
      <table className="min-w-full text-left text-gray-700 dark:text-gray-400">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr className="border-b border-gray-100 dark:border-gray-800">
            <th className="px-5 py-3 text-sm font-medium whitespace-nowrap text-gray-700 dark:text-gray-400">
              S.No.#
            </th>
            <th className="px-5 py-3 text-xs font-medium whitespace-nowrap text-gray-500 dark:text-gray-400">
              Description
            </th>
            <th className="px-5 py-3 text-center text-sm font-medium whitespace-nowrap text-gray-700 dark:text-gray-400">
              Quantity
            </th>
            <th className="px-5 py-3 text-center text-sm font-medium whitespace-nowrap text-gray-700 dark:text-gray-400">
              Unit Cost
            </th>
            <th className="px-5 py-3 text-center text-sm font-medium whitespace-nowrap text-gray-700 dark:text-gray-400">
              Discount
            </th>
            <th className="px-5 py-3 text-right text-sm font-medium whitespace-nowrap text-gray-700 dark:text-gray-400">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {lineItems && lineItems.length > 0 ? (
            lineItems.map((item, index) => (
              <tr key={item.id || index}>
                <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">
                  {index + 1}
                </td>
                <td className="px-5 py-3 text-sm font-medium text-gray-800 dark:text-white/90">
                  {item.description || item.serviceName}
                </td>
                <td className="px-5 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                  {item.quantity}
                </td>
                <td className="px-5 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                  {formatPrice(
                    parseFloat(String(item.unitCost || item.unitPrice || 0))
                  )}
                </td>
                <td className="px-5 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                  {item.discountAmount
                    ? formatPrice(parseFloat(String(item.discountAmount)))
                    : "0"}
                </td>
                <td className="px-5 py-3 text-right text-sm text-gray-500 dark:text-gray-400">
                  {formatPrice(
                    parseFloat(String(item.lineTotal || item.amount || 0))
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={6}
                className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
              >
                No line items found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
