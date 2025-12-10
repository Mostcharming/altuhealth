"use client";
import Checkbox from "@/components/form/input/Checkbox";
import FileInput from "@/components/form/input/FileInput";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";
import ConfirmModal from "@/components/modals/confirm";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import { Modal } from "@/components/ui/modal";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { useModal } from "@/hooks/useModal";
import { PencilIcon, TrashBinIcon } from "@/icons";
import { apiClient } from "@/lib/apiClient";
import capitalizeWords from "@/lib/capitalize";
import { formatDate, formatPrice } from "@/lib/formatDate";
import { Service, useServiceStore } from "@/lib/store/serviceStore";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import EditService from "./editService";

interface ServiceTableProps {
  id?: string;
  buttonText?: string;
}

const ServiceTable: React.FC<ServiceTableProps> = ({
  id,
  buttonText = "Create a service",
}) => {
  const { isOpen, openModal, closeModal } = useModal();
  const createModal = useModal();
  const errorModal = useModal();
  const successModal = useModal();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [totalItems, setTotalItems] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [hasPreviousPage, setHasPreviousPage] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(1);
  const services = useServiceStore((s) => s.services);
  const setServices = useServiceStore((s) => s.setServices);
  const addService = useServiceStore((s) => s.addService);
  const confirmModal = useModal();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null
  );
  const [editingService, setEditingService] = useState<Service | null>(null);
  const removeService = useServiceStore((s) => s.removeService);
  const [errorMessage, setErrorMessage] = useState(
    "Failed to delete service. Please try again."
  );

  // Create service form state
  const [createName, setCreateName] = useState("");
  const [createCode, setCreateCode] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createRequiresPreauthorization, setCreateRequiresPreauthorization] =
    useState(false);
  const [createPrice, setCreatePrice] = useState("");
  const [createStatus, setCreateStatus] = useState<
    "active" | "inactive" | "pending"
  >("pending");

  // Bulk upload state
  const [isBulkUpload, setIsBulkUpload] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);

  type Header = {
    key: keyof Service | "actions";
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
    { key: "name", label: "Name" },
    { key: "code", label: "Code" },
    { key: "price", label: "Price" },
    { key: "requiresPreauthorization", label: "Preauth Required" },
    { key: "status", label: "Status" },
    { key: "createdAt", label: "Date Created" },
    { key: "actions", label: "Actions" },
  ];

  const fetch = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (limit) params.append("limit", String(limit));
      if (currentPage) params.append("page", String(currentPage));
      if (search) params.append("q", search);

      const url = `/admin/services/list?${params.toString()}`;

      const data = await apiClient(url, {
        method: "GET",
        onLoading: (l) => setLoading(l),
      });

      const items: Service[] =
        data?.data?.list && Array.isArray(data.data.list)
          ? data.data.list
          : Array.isArray(data)
          ? data
          : [];

      setServices(items);
      setTotalItems(data?.data?.count ?? 0);
      setHasNextPage(Boolean(data?.data?.hasNextPage));
      setHasPreviousPage(Boolean(data?.data?.hasPreviousPage));
      setTotalPages(data?.data?.totalPages ?? 1);
    } catch (err) {
      console.warn("Service fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [limit, currentPage, search, setServices]);

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
    setSelectedServiceId(id);
    confirmModal.openModal();
  };

  const handleCloseConfirm = () => {
    setSelectedServiceId(null);
    confirmModal.closeModal();
  };

  const handleView = (service: Service) => {
    setEditingService(service);
    openModal();
  };

  const deleteService = async () => {
    if (!selectedServiceId) return;
    try {
      setLoading(true);
      const url = `/admin/services/${selectedServiceId}`;
      await apiClient(url, {
        method: "DELETE",
        onLoading: (l) => setLoading(l),
      });

      removeService(selectedServiceId);
      setSelectedServiceId(null);
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
    setEditingService(null);
    closeModal();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const resetCreateForm = () => {
    setCreateName("");
    setCreateCode("");
    setCreateDescription("");
    setCreateRequiresPreauthorization(false);
    setCreatePrice("");
    setCreateStatus("pending");
  };

  const handleCreateSuccessClose = () => {
    successModal.closeModal();
    resetCreateForm();
    createModal.closeModal();
  };

  const handleCreateErrorClose = () => {
    errorModal.closeModal();
  };

  const handleCreateSubmit = async () => {
    try {
      if (!createName) {
        setErrorMessage("Name is required.");
        errorModal.openModal();
        return;
      }
      if (!createPrice) {
        setErrorMessage("Price is required.");
        errorModal.openModal();
        return;
      }
      if (!id) {
        setErrorMessage("Provider is required.");
        errorModal.openModal();
        return;
      }

      setLoading(true);

      const payload: {
        name: string;
        code?: string;
        description?: string;
        requiresPreauthorization: boolean;
        price: number;
        status: string;
        providerId: string;
      } = {
        name: createName.trim(),
        code: createCode.trim() || undefined,
        description: createDescription.trim() || undefined,
        requiresPreauthorization: createRequiresPreauthorization,
        price: parseFloat(createPrice),
        status: createStatus,
        providerId: id,
      };

      const data = await apiClient("/admin/services", {
        method: "POST",
        body: payload,
        onLoading: (l: boolean) => setLoading(l),
      });

      if (data?.data?.service) {
        addService({
          id: data.data.service.id,
          name: createName,
          code: createCode,
          description: createDescription || null,
          requiresPreauthorization: createRequiresPreauthorization,
          price: parseFloat(createPrice),
          status: createStatus,
          providerId: id,
          createdAt: data.data.service.createdAt,
        });
      }

      successModal.openModal();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
      errorModal.openModal();
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleTemplate = () => {
    const sampleData = [
      {
        name: "Consultation",
        code: "CONS-001",
        description: "General consultation service",
        requiresPreauthorization: "false",
        price: "5000",
        status: "active",
      },
      {
        name: "Laboratory Test",
        code: "LAB-001",
        description: "Basic laboratory test",
        requiresPreauthorization: "true",
        price: "3000",
        status: "active",
      },
    ];

    const headers = Object.keys(sampleData[0]);
    const csv = [
      headers.join(","),
      ...sampleData.map((row) =>
        headers
          .map((header) => {
            const value = row[header as keyof typeof row];
            return typeof value === "string" && value.includes(",")
              ? `"${value}"`
              : value;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "service_bulk_upload_template.csv";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleBulkUpload = async () => {
    try {
      if (!bulkFile) {
        setErrorMessage("Please select a file to upload.");
        errorModal.openModal();
        return;
      }

      if (!id) {
        setErrorMessage("Provider is required.");
        errorModal.openModal();
        return;
      }

      setLoading(true);

      const formData = new FormData();
      formData.append("file", bulkFile);
      formData.append("providerId", id);

      const data = await apiClient("/admin/services/bulk/create", {
        method: "POST",
        formData,
        onLoading: (l: boolean) => setLoading(l),
      });

      if (data?.data?.services && Array.isArray(data.data.services)) {
        data.data.services.forEach((service: Service) => {
          addService(service);
        });
      }

      successModal.openModal();
      setIsBulkUpload(false);
      setBulkFile(null);
      resetCreateForm();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
      errorModal.openModal();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Services Listing
          </h3>
        </div>

        <div className="flex gap-3.5">
          <div className="hidden flex-col gap-3 sm:flex sm:flex-row sm:items-center">
            <div className="relative">
              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
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
                    d="M3.04199 9.37363C3.04199 5.87693 5.87735 3.04199 9.37533 3.04199C12.8733 3.04199 15.7087 5.87693 15.7087 9.37363C15.7087 12.8703 12.8733 15.7053 9.37533 15.7053C5.87735 15.7053 3.04199 12.8703 3.04199 9.37363ZM9.37533 1.54199C5.04926 1.54199 1.54199 5.04817 1.54199 9.37363C1.54199 13.6991 5.04926 17.2053 9.37533 17.2053C11.2676 17.2053 13.0032 16.5344 14.3572 15.4176L17.1773 18.238C17.4702 18.5309 17.945 18.5309 18.2379 18.238C18.5308 17.9451 18.5309 17.4703 18.238 17.1773L15.4182 14.3573C16.5367 13.0033 17.2087 11.2669 17.2087 9.37363C17.2087 5.04817 13.7014 1.54199 9.37533 1.54199Z"
                    fill=""
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search..."
                className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pr-4 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden xl:w-[300px] dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearch(e.target.value)
                }
              />
            </div>
            <button
              onClick={createModal.openModal}
              className="cursor-pointer bg-brand-500 shadow-theme-xs hover:bg-brand-600 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M5 10.0002H15.0006M10.0002 5V15.0006"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {buttonText}
            </button>
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
                    className={` p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400`}
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
              {services.map((service: Service) => (
                <tr
                  key={service.id}
                  className="transition hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <td className="p-4 whitespace-nowrap">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                      {capitalizeWords(service.name) || "-"}
                    </p>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <p className="text-sm text-gray-700 dark:text-gray-400">
                      {service.code || "-"}
                    </p>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                      {formatPrice(service.price)}
                    </p>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium capitalize ${
                        service.requiresPreauthorization
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {service.requiresPreauthorization ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium capitalize ${getStatusColor(
                        service.status
                      )}`}
                    >
                      {service.status}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <p className="text-sm text-gray-700 dark:text-gray-400">
                      {service.createdAt ? formatDate(service.createdAt) : "-"}
                    </p>
                  </td>

                  <td className="p-4 whitespace-nowrap">
                    <div className="flex items-center w-full gap-2">
                      <button
                        onClick={() => handleView(service)}
                        className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90"
                        title="View/Edit"
                      >
                        <PencilIcon />
                      </button>

                      <button
                        onClick={() => handleDeleteModal(service.id)}
                        className="text-gray-500 hover:text-error-500 dark:text-gray-400 dark:hover:text-error-500"
                        title="Delete"
                      >
                        <TrashBinIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
            defaultValue=""
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
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium ${
                    page === currentPage
                      ? "bg-brand-500 text-white"
                      : "hover:bg-brand-500 text-gray-700 hover:text-white dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  {page}
                </button>
              </li>
            ))}
            {visiblePages[visiblePages.length - 1] < totalPages && (
              <>
                <li>
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium text-gray-700 dark:text-gray-400">
                    ...
                  </span>
                </li>
                <li>
                  <button
                    onClick={() => goToPage(totalPages)}
                    className="hover:bg-brand-500 flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium text-gray-700 hover:text-white dark:text-gray-400 dark:hover:text-white"
                  >
                    {totalPages}
                  </button>
                </li>
              </>
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
        handleSave={deleteService}
        closeModal={handleCloseConfirm}
      />
      <EditService
        isOpen={isOpen}
        closeModal={handleCloseEdit}
        service={editingService}
      />
      <Modal
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
        className="max-w-[900px] p-5 lg:p-10 m-4"
      >
        <div className="px-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                {isBulkUpload ? "Bulk Upload Services" : "Add a new Service"}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isBulkUpload
                  ? "Upload multiple services at once using a CSV file."
                  : "Fill in the details below to create a new service."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                label="Bulk Upload"
                defaultChecked={isBulkUpload}
                onChange={(checked) => {
                  setIsBulkUpload(checked);
                  resetCreateForm();
                  setBulkFile(null);
                }}
              />
            </div>
          </div>
        </div>

        {isBulkUpload ? (
          <form
            className="flex flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              handleBulkUpload();
            }}
          >
            <div className="custom-scrollbar h-full sm:h-full overflow-y-auto px-2">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5">
                <div>
                  <Label>CSV File *</Label>
                  <FileInput
                    accept=".csv,.xlsx,.xls"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      if (e.target.files && e.target.files[0]) {
                        setBulkFile(e.target.files[0]);
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Supported formats: CSV, XLSX, XLS
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 pt-4">
                  <button
                    type="button"
                    onClick={downloadSampleTemplate}
                    className="px-4 py-2 rounded border border-brand-500 text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10"
                  >
                    📥 Download Sample Template
                  </button>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={createModal.closeModal}
                      className="px-4 py-2 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 rounded bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50"
                    >
                      {loading ? "Uploading..." : "Upload Services"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <form
            className="flex flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateSubmit();
            }}
          >
            <div className="custom-scrollbar h-[350px] sm:h-[450px] overflow-y-auto px-2">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="col-span-2 lg:col-span-1">
                  <Label>Name</Label>
                  <Input
                    type="text"
                    value={createName}
                    placeholder="Enter service name..."
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setCreateName(e.target.value)
                    }
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Code</Label>
                  <Input
                    type="text"
                    value={createCode}
                    placeholder="Enter service code (optional)..."
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setCreateCode(e.target.value)
                    }
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Price</Label>
                  <Input
                    type="number"
                    value={createPrice}
                    placeholder="Enter price..."
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setCreatePrice(e.target.value)
                    }
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Status</Label>
                  <Select
                    options={[
                      { value: "active", label: "Active" },
                      { value: "inactive", label: "Inactive" },
                      { value: "pending", label: "Pending" },
                    ]}
                    placeholder="Select status"
                    onChange={(value) =>
                      setCreateStatus(
                        value as "active" | "inactive" | "pending"
                      )
                    }
                    defaultValue={createStatus}
                  />
                </div>

                <div className="col-span-2">
                  <Label>Description</Label>
                  <TextArea
                    placeholder="Type the description here..."
                    rows={4}
                    value={createDescription}
                    onChange={(value) => setCreateDescription(value)}
                  />
                </div>

                <div className="col-span-2">
                  <Checkbox
                    label="Requires Preauthorization"
                    checked={createRequiresPreauthorization}
                    onChange={(checked) =>
                      setCreateRequiresPreauthorization(checked)
                    }
                  />
                </div>

                <div className="col-span-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={createModal.closeModal}
                    className="px-4 py-2 rounded border"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded bg-brand-500 text-white"
                  >
                    {loading ? "Creating..." : "Create Service"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </Modal>
      <SuccessModal
        successModal={successModal}
        handleSuccessClose={handleCreateSuccessClose}
      />

      <ErrorModal
        message={errorMessage}
        errorModal={errorModal}
        handleErrorClose={handleCreateErrorClose}
      />
    </div>
  );
};

export default ServiceTable;
