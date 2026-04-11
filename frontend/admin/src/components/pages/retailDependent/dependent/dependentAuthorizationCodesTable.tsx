/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { apiClient } from "@/lib/apiClient";
import { useCallback, useEffect, useState } from "react";

interface RetailDependentAuthorizationCodesTableProps {
  dependentId: string;
}

const RetailDependentAuthorizationCodesTable: React.FC<
  RetailDependentAuthorizationCodesTableProps
> = ({ dependentId }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [hasPreviousPage, setHasPreviousPage] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [authorizationCodes, setAuthorizationCodes] = useState<any[]>([]);

  type Header = {
    key: string;
    label: string;
  };

  const select = [
    { value: "10", label: "10" },
    { value: "20", label: "20" },
    { value: "30", label: "30" },
    { value: "40", label: "40" },
    { value: "50", label: "50" },
  ];

  const headers: Header[] = [
    { key: "authorizationCode", label: "Authorization Code" },
    { key: "authorizationType", label: "Type" },
    { key: "Provider", label: "Provider" },
    { key: "Diagnosis", label: "Diagnosis" },
    { key: "amountAuthorized", label: "Amount Authorized" },
    { key: "validFrom", label: "Valid From" },
    { key: "validTo", label: "Valid To" },
    { key: "status", label: "Status" },
  ];

  const fetch = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (limit) params.append("limit", String(limit));
      if (currentPage) params.append("page", String(currentPage));
      if (search) params.append("q", search);

      const url = `/admin/retail-enrollee-dependents/${dependentId}/authorization-codes?${params.toString()}`;

      const data = await apiClient(url, {
        method: "GET",
        onLoading: (l) => setLoading(l),
      });

      const items: any[] =
        data?.data?.authorizationCodes &&
        Array.isArray(data.data.authorizationCodes)
          ? data.data.authorizationCodes
          : Array.isArray(data)
          ? data
          : [];

      setAuthorizationCodes(items);
      setTotalItems(data?.data?.pagination?.total ?? 0);
      setHasNextPage(
        Boolean(
          data?.data?.pagination &&
            data.data.pagination.page < data.data.pagination.pages
        )
      );
      setHasPreviousPage(Boolean(data?.data?.pagination?.page > 1));
      setTotalPages(data?.data?.pagination?.pages ?? 1);
    } catch (err) {
      console.warn("Authorization codes fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [limit, currentPage, search, dependentId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const startEntry: number =
    totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;

  const endEntry: number = Math.min(currentPage * limit, totalItems);

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "used":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      {loading ? (
        <SpinnerThree />
      ) : authorizationCodes.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No authorization codes found
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                {headers.map((h) => (
                  <th
                    key={h.key}
                    className="p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400"
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {authorizationCodes.map((code: any) => (
                <tr
                  key={code.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <td className="p-4 text-sm text-gray-700 dark:text-gray-400">
                    {code.authorizationCode}
                  </td>
                  <td className="p-4 text-sm text-gray-700 dark:text-gray-400 capitalize">
                    {code.authorizationType}
                  </td>
                  <td className="p-4 text-sm text-gray-700 dark:text-gray-400">
                    {code.Provider?.name || "N/A"}
                  </td>
                  <td className="p-4 text-sm text-gray-700 dark:text-gray-400">
                    {code.Diagnosis?.name || "N/A"}
                  </td>
                  <td className="p-4 text-sm text-gray-700 dark:text-gray-400">
                    {code.amountAuthorized || "N/A"}
                  </td>
                  <td className="p-4 text-sm text-gray-700 dark:text-gray-400">
                    {formatDate(code.validFrom)}
                  </td>
                  <td className="p-4 text-sm text-gray-700 dark:text-gray-400">
                    {formatDate(code.validTo)}
                  </td>
                  <td className="p-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium capitalize ${getStatusBadge(
                        code.status
                      )}`}
                    >
                      {code.status}
                    </span>
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

export default RetailDependentAuthorizationCodesTable;
