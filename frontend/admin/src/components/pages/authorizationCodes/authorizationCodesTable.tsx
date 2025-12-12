"use client";

import Select from "@/components/form/Select";
import ConfirmModal from "@/components/modals/confirm";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { useModal } from "@/hooks/useModal";
import { PencilIcon, TrashBinIcon } from "@/icons";
import { apiClient } from "@/lib/apiClient";
import React, { useCallback, useEffect, useState } from "react";
import EditAuthorizationCode from "./editAuthorizationCode";

interface AuthorizationCode {
  id: string;
  authorizationCode: string;
  enrolleeId: string;
  enrollee?: {
    firstName: string;
    lastName: string;
    policyNumber: string;
  };
  providerId?: string;
  provider?: {
    name: string;
    code: string;
  };
  companyId: string;
  company?: {
    name: string;
  };
  authorizationType: string;
  validFrom: string;
  validTo: string;
  status: string;
  amountAuthorized?: number;
}

interface Enrollee {
  id: string;
  firstName: string;
  lastName: string;
  policyNumber: string;
}

interface Provider {
  id: string;
  name: string;
  code: string;
}

interface Company {
  id: string;
  name: string;
}

const AuthorizationCodesTable: React.FC = () => {
  const { isOpen, openModal, closeModal } = useModal();
  const errorModal = useModal();
  const successModal = useModal();
  const confirmModal = useModal();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [selectedEnrolleeId, setSelectedEnrolleeId] = useState<string>("");
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [enrollees, setEnrollees] = useState<Enrollee[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [authorizationCodes, setAuthorizationCodes] = useState<
    AuthorizationCode[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [hasPreviousPage, setHasPreviousPage] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedCodeId, setSelectedCodeId] = useState<string | null>(null);
  const [editingCode, setEditingCode] = useState<AuthorizationCode | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState(
    "Failed to delete authorization code. Please try again."
  );

  type Header = {
    key: keyof AuthorizationCode | "actions";
    label: string;
  };

  const select = [
    { value: "10", label: "10" },
    { value: "20", label: "20" },
    { value: "30", label: "30" },
    { value: "40", label: "40" },
    { value: "50", label: "50" },
  ];

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "used", label: "Used" },
    { value: "expired", label: "Expired" },
    { value: "cancelled", label: "Cancelled" },
    { value: "pending", label: "Pending" },
  ];

  const headers: Header[] = [
    { key: "authorizationCode", label: "Auth Code" },
    { key: "enrollee", label: "Enrollee" },
    { key: "provider", label: "Provider" },
    { key: "company", label: "Company" },
    { key: "authorizationType", label: "Type" },
    { key: "status", label: "Status" },
    { key: "validFrom", label: "Valid From" },
    { key: "actions", label: "Actions" },
  ];

  // Fetch enrollees, providers, companies on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [enrolleesData, providersData, companiesData] = await Promise.all(
          [
            apiClient("/admin/enrollees?limit=all", { method: "GET" }),
            apiClient("/admin/providers?limit=all", { method: "GET" }),
            apiClient("/admin/companies?limit=all", { method: "GET" }),
          ]
        );

        const enrolleesList: Enrollee[] =
          enrolleesData?.data?.enrollees &&
          Array.isArray(enrolleesData.data.enrollees)
            ? enrolleesData.data.enrollees
            : Array.isArray(enrolleesData)
            ? enrolleesData
            : [];
        setEnrollees(enrolleesList);

        const providersList: Provider[] =
          providersData?.data?.providers &&
          Array.isArray(providersData.data.providers)
            ? providersData.data.providers
            : Array.isArray(providersData)
            ? providersData
            : [];
        setProviders(providersList);

        const companiesList: Company[] =
          companiesData?.data?.companies &&
          Array.isArray(companiesData.data.companies)
            ? companiesData.data.companies
            : Array.isArray(companiesData)
            ? companiesData
            : [];
        setCompanies(companiesList);
      } catch (err) {
        console.warn("Failed to fetch initial data", err);
      }
    };
    fetchInitialData();
  }, []);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (limit) params.append("limit", String(limit));
      if (currentPage) params.append("page", String(currentPage));
      if (search) params.append("q", search);
      if (selectedEnrolleeId) params.append("enrolleeId", selectedEnrolleeId);
      if (selectedProviderId) params.append("providerId", selectedProviderId);
      if (selectedCompanyId) params.append("companyId", selectedCompanyId);
      if (selectedStatus) params.append("status", selectedStatus);

      const url = `/admin/authorization-codes?${params.toString()}`;

      const data = await apiClient(url, {
        method: "GET",
        onLoading: (l) => setLoading(l),
      });

      const items: AuthorizationCode[] =
        data?.data?.list && Array.isArray(data.data.list)
          ? data.data.list
          : Array.isArray(data)
          ? data
          : [];

      setAuthorizationCodes(items);
      setTotalItems(data?.data?.count ?? 0);
      setHasNextPage(Boolean(data?.data?.hasNextPage));
      setHasPreviousPage(Boolean(data?.data?.hasPreviousPage));
      setTotalPages(data?.data?.totalPages ?? 1);
    } catch (err) {
      console.warn("Authorization codes fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [
    limit,
    currentPage,
    search,
    selectedEnrolleeId,
    selectedProviderId,
    selectedCompanyId,
    selectedStatus,
  ]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const startEntry: number =
    totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endEntry: number = Math.min(currentPage * limit, totalItems);

  const visiblePages: number[] = React.useMemo(() => {
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPages]);

  const goToPage = (page: number): void => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const nextPage = (): void => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const previousPage = (): void => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleSelectChange = (value: string) => {
    setLimit(Number(value));
    setCurrentPage(1);
  };

  const handleDeleteModal = (id: string) => {
    setSelectedCodeId(id);
    confirmModal.openModal();
  };

  const handleCloseConfirm = () => {
    setSelectedCodeId(null);
    confirmModal.closeModal();
  };

  const handleView = (code: AuthorizationCode) => {
    setEditingCode(code);
    openModal();
  };

  const deleteCode = async () => {
    if (!selectedCodeId) return;
    try {
      setLoading(true);
      const url = `/admin/authorization-codes/${selectedCodeId}`;
      await apiClient(url, {
        method: "DELETE",
        onLoading: (l) => setLoading(l),
      });
      setAuthorizationCodes((prev) =>
        prev.filter((code) => code.id !== selectedCodeId)
      );
      setSelectedCodeId(null);
      confirmModal.closeModal();
      successModal.openModal();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
      errorModal.openModal();
    } finally {
      setLoading(false);
    }
  };

  const handleCloseEdit = () => {
    setEditingCode(null);
    closeModal();
  };

  const handleSuccessClose = () => {
    successModal.closeModal();
    closeModal();
    fetch();
  };

  const handleErrorClose = () => {
    errorModal.closeModal();
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "used":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "expired":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "cancelled":
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Authorization Codes Listing
          </h3>
        </div>

        <div className="flex gap-3.5">
          <div className="hidden flex-col gap-3 sm:flex sm:flex-row sm:items-center">
            {/* Enrollee Filter */}
            <div>
              <Select
                options={[
                  { value: "", label: "All Enrollees" },
                  ...enrollees.map((e) => ({
                    value: e.id,
                    label: `${e.firstName} ${e.lastName}`,
                  })),
                ]}
                placeholder="Select enrollee"
                onChange={(value) => {
                  setSelectedEnrolleeId(value as string);
                  setCurrentPage(1);
                }}
                defaultValue={selectedEnrolleeId}
              />
            </div>

            {/* Provider Filter */}
            <div>
              <Select
                options={[
                  { value: "", label: "All Providers" },
                  ...providers.map((p) => ({
                    value: p.id,
                    label: p.name,
                  })),
                ]}
                placeholder="Select provider"
                onChange={(value) => {
                  setSelectedProviderId(value as string);
                  setCurrentPage(1);
                }}
                defaultValue={selectedProviderId}
              />
            </div>

            {/* Company Filter */}
            <div>
              <Select
                options={[
                  { value: "", label: "All Companies" },
                  ...companies.map((c) => ({
                    value: c.id,
                    label: c.name,
                  })),
                ]}
                placeholder="Select company"
                onChange={(value) => {
                  setSelectedCompanyId(value as string);
                  setCurrentPage(1);
                }}
                defaultValue={selectedCompanyId}
              />
            </div>

            {/* Status Filter */}
            <div>
              <Select
                options={statusOptions}
                placeholder="Select status"
                onChange={(value) => {
                  setSelectedStatus(value as string);
                  setCurrentPage(1);
                }}
                defaultValue={selectedStatus}
              />
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by auth code..."
                className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pr-4 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden xl:w-[300px] dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearch(e.target.value)
                }
              />
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
              >
                <path
                  d="M8.25 14.25C11.5637 14.25 14.25 11.5637 14.25 8.25C14.25 4.93629 11.5637 2.25 8.25 2.25C4.93629 2.25 2.25 4.93629 2.25 8.25C2.25 11.5637 4.93629 14.25 8.25 14.25Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15.75 15.75L12.8325 12.8325"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
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
                {headers.map((h) => (
                  <th
                    key={h.key}
                    className="p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400"
                  >
                    <div className="flex items-center gap-3">
                      <p className="text-theme-xs font-medium text-gray-700 dark:text-gray-400">
                        {h.label}
                      </p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-x divide-y divide-gray-200 dark:divide-gray-800">
              {authorizationCodes.length > 0 ? (
                authorizationCodes.map((code: AuthorizationCode) => (
                  <tr
                    key={code.id}
                    className="transition hover:bg-gray-50 dark:hover:bg-gray-900"
                  >
                    <td className="p-4 whitespace-nowrap">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                        {code.authorizationCode}
                      </p>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <p className="text-sm text-gray-700 dark:text-gray-400">
                        {code.enrollee
                          ? `${code.enrollee.firstName} ${code.enrollee.lastName}`
                          : "—"}
                      </p>
                      {code.enrollee && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {code.enrollee.policyNumber}
                        </p>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <p className="text-sm text-gray-700 dark:text-gray-400">
                        {code.provider ? code.provider.name : "—"}
                      </p>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <p className="text-sm text-gray-700 dark:text-gray-400">
                        {code.company ? code.company.name : "—"}
                      </p>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {code.authorizationType}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeColor(
                          code.status
                        )}`}
                      >
                        {code.status}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <p className="text-sm text-gray-700 dark:text-gray-400">
                        {formatDate(code.validFrom)}
                      </p>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleView(code)}
                          className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90"
                        >
                          <PencilIcon />
                        </button>
                        <button
                          onClick={() => handleDeleteModal(code.id)}
                          className="text-gray-500 hover:text-error-500 dark:text-gray-400 dark:hover:text-error-500"
                        >
                          <TrashBinIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={headers.length} className="p-4 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No authorization codes found
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center flex-col sm:flex-row justify-between border-t border-gray-200 px-5 py-4 dark:border-gray-800">
        <div>
          <Select
            options={select}
            placeholder="Select limit"
            onChange={handleSelectChange}
            defaultValue="10"
          />
        </div>
        <div className="pb-4 sm:pb-0">
          <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">
            Showing{" "}
            <span className="text-gray-800 dark:text-white/90">
              {startEntry}
            </span>{" "}
            to{" "}
            <span className="text-gray-800 dark:text-white/90">{endEntry}</span>{" "}
            of{" "}
            <span className="text-gray-800 dark:text-white/90">
              {totalItems}
            </span>
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 bg-gray-50 p-4 sm:p-0 rounded-lg sm:bg-transparent dark:sm:bg-transparent w-full sm:w-auto dark:bg-white/[0.03] sm:justify-normal">
          <button
            className={`shadow-theme-xs flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 hover:text-gray-800 sm:p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={previousPage}
            disabled={!hasPreviousPage}
          >
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
                d="M2.58203 9.99868C2.58174 10.1909 2.6549 10.3833 2.80152 10.53L7.79818 15.5301C8.09097 15.8231 8.56584 15.8233 8.85883 15.5305C9.15183 15.2377 9.152 14.7629 8.85921 14.4699L5.13911 10.7472L16.6665 10.7472C17.0807 10.7472 17.4165 10.4114 17.4165 9.99715C17.4165 9.58294 17.0807 9.24715 16.6665 9.24715L5.14456 9.24715L8.85919 5.53016C9.15199 5.23717 9.15184 4.7623 8.85885 4.4695C8.56587 4.1767 8.09099 4.17685 7.79819 4.46984L2.84069 9.43049C2.68224 9.568 2.58203 9.77087 2.58203 9.99715C2.58203 9.99766 2.58203 9.99817 2.58203 9.99868Z"
                fill=""
              />
            </svg>
          </button>
          <span className="block text-sm font-medium text-gray-700 sm:hidden dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <ul className="hidden items-center gap-0.5 sm:flex">
            {visiblePages.map((page) => (
              <li key={page}>
                <button
                  onClick={() => goToPage(page)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    page === currentPage
                      ? "bg-blue-600 text-white dark:bg-blue-700"
                      : "hover:bg-gray-100 text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                  }`}
                >
                  {page}
                </button>
              </li>
            ))}
            {visiblePages[visiblePages.length - 1] < totalPages && (
              <li>
                <span className="px-2 py-2 text-gray-500">...</span>
              </li>
            )}
          </ul>
          <button
            className={`shadow-theme-xs flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 hover:text-gray-800 sm:p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 ${
              currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={nextPage}
            disabled={!hasNextPage}
          >
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
                d="M17.4165 9.9986C17.4168 10.1909 17.3437 10.3832 17.197 10.53L12.2004 15.5301C11.9076 15.8231 11.4327 15.8233 11.1397 15.5305C10.8467 15.2377 10.8465 14.7629 11.1393 14.4699L14.8594 10.7472L3.33203 10.7472C2.91782 10.7472 2.58203 10.4114 2.58203 9.99715C2.58203 9.58294 2.91782 9.24715 3.33203 9.24715L14.854 9.24715L11.1393 5.53016C10.8465 5.23717 10.8467 4.7623 11.1397 4.4695C11.4327 4.1767 11.9075 4.17685 12.2003 4.46984L17.1578 9.43049C17.3163 9.568 17.4165 9.77087 17.4165 9.99715C17.4165 9.99763 17.4165 9.99812 17.4165 9.9986Z"
                fill=""
              />
            </svg>
          </button>
        </div>
      </div>

      <ConfirmModal
        confirmModal={confirmModal}
        handleSave={deleteCode}
        closeModal={handleCloseConfirm}
      />
      <EditAuthorizationCode
        isOpen={isOpen}
        closeModal={handleCloseEdit}
        code={editingCode}
      />

      <SuccessModal
        successModal={successModal}
        handleSuccessClose={handleSuccessClose}
      />

      <ErrorModal
        message={errorMessage}
        errorModal={errorModal}
        handleErrorClose={handleErrorClose}
      />
    </div>
  );
};

export default AuthorizationCodesTable;
