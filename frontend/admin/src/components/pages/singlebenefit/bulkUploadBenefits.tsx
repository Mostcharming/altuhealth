/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import FileInput from "@/components/form/input/FileInput";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { apiClient } from "@/lib/apiClient";
import { useBenefitStore } from "@/lib/store/benefitStore";
import { ChangeEvent, useEffect, useState } from "react";

interface BenefitCategory {
  value: string;
  label: string;
}

export default function BulkUploadBenefits({
  buttonText,
}: {
  buttonText?: string;
}) {
  const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [isBulkUpload, setIsBulkUpload] = useState(false);

  const errorModal = useModal();
  const successModal = useModal();

  // stores
  const addBenefit = useBenefitStore((s) => s.addBenefit);

  // form state - single benefit
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [limit, setLimit] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [categories, setCategories] = useState<BenefitCategory[]>([]);

  // form state - bulk upload
  const [bulkCategoryId, setBulkCategoryId] = useState("");
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkCategories, setBulkCategories] = useState<BenefitCategory[]>([]);

  const [errorMessage, setErrorMessage] = useState<string>(
    "Failed to create/upload benefits. Please try again."
  );

  // Fetch benefit categories on modal open
  useEffect(() => {
    if (isOpen) {
      if (isBulkUpload) {
        fetchBulkCategories();
      } else {
        fetchCategories();
      }
    }
  }, [isOpen, isBulkUpload]);

  const fetchCategories = async () => {
    try {
      const data = await apiClient("/admin/benefit-categories/list?limit=all", {
        method: "GET",
      });
      const items = data?.data?.list || data?.data || [];
      const categoryOptions = Array.isArray(items)
        ? items.map((cat: any) => ({
            value: cat.id,
            label: cat.name,
          }))
        : [];
      setCategories(categoryOptions);
    } catch (err) {
      console.warn("Failed to fetch benefit categories", err);
    }
  };

  const fetchBulkCategories = async () => {
    try {
      const data = await apiClient("/admin/benefit-categories/list?limit=all", {
        method: "GET",
      });
      const items = data?.data?.list || data?.data || [];
      const categoryOptions = Array.isArray(items)
        ? items.map((cat: any) => ({
            value: cat.id,
            label: cat.name,
          }))
        : [];
      setBulkCategories(categoryOptions);
    } catch (err) {
      console.warn("Failed to fetch benefit categories", err);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setLimit("");
    setAmount("");
    setSelectedCategoryId("");
    setBulkCategoryId("");
    setBulkFile(null);
  };

  const handleSuccessClose = () => {
    successModal.closeModal();
    resetForm();
    closeModal();
  };

  const handleErrorClose = () => {
    errorModal.closeModal();
    resetForm();
    closeModal();
  };

  const handleSingleSubmit = async () => {
    try {
      // simple client-side validation
      if (!name) {
        setErrorMessage("Name is required.");
        errorModal.openModal();
        return;
      }

      if (!selectedCategoryId) {
        setErrorMessage("Please select a benefit category.");
        errorModal.openModal();
        return;
      }

      setLoading(true);

      const payload: {
        name: string;
        description: string;
        limit: number;
        amount: number;
        benefitCategoryId: string;
      } = {
        name: name.trim(),
        description: description.trim(),
        limit: parseInt(limit) || 0,
        amount: parseFloat(amount) || 0,
        benefitCategoryId: selectedCategoryId,
      };

      const data = await apiClient("/admin/benefits", {
        method: "POST",
        body: payload,
        onLoading: (l: boolean) => setLoading(l),
      });

      if (data) {
        addBenefit({
          id: data.data.id,
          name: name,
          description: description,
          limit: limit,
          amount: parseFloat(amount),
          benefitCategoryId: selectedCategoryId,
          createdAt: data.data.createdAt,
          BenefitCategory: {
            id: selectedCategoryId,
            name:
              categories.find((cat) => cat.value === selectedCategoryId)
                ?.label || "",
          },
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

  const handleMessageChange = (value: string) => {
    setDescription(value);
  };

  const downloadSampleTemplate = () => {
    const sampleData = [
      {
        name: "General Consultation",
        description: "Basic medical consultation with healthcare provider",
        amount: "50.00",
        limit: "10",
      },
      {
        name: "Dental Checkup",
        description: "Routine dental examination and cleaning",
        amount: "75.00",
        limit: "2",
      },
      {
        name: "Eye Exam",
        description: "Annual optical examination",
        amount: "100.00",
        limit: "1",
      },
      {
        name: "Physical Therapy",
        description: "Physiotherapy sessions for rehabilitation",
        amount: "80.00",
        limit: "20",
      },
      {
        name: "Prescription Medications",
        description: "Coverage for prescription drugs",
        amount: "0.00",
        limit: "100",
      },
    ];

    // Create CSV content
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

    // Create and trigger download
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "benefits_bulk_upload_template.csv";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleBulkUpload = async () => {
    try {
      if (!bulkCategoryId) {
        setErrorMessage("Benefit category is required for bulk upload.");
        errorModal.openModal();
        return;
      }

      if (!bulkFile) {
        setErrorMessage("Please select a file to upload.");
        errorModal.openModal();
        return;
      }

      setLoading(true);

      const formData = new FormData();
      formData.append("file", bulkFile);
      formData.append("categoryId", bulkCategoryId);

      const data = await apiClient("/admin/benefits/bulk/create", {
        method: "POST",
        formData,
        onLoading: (l: boolean) => setLoading(l),
      });

      if (data?.data?.benefits && Array.isArray(data.data.benefits)) {
        data.data.benefits.forEach((benefit: any) => {
          addBenefit(benefit);
        });
      }

      successModal.openModal();
      resetForm();
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
    <div className="p-4 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <div></div>
        <div>
          <div
            onClick={openModal}
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
            {buttonText || "Add Benefit"}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[900px] p-5 lg:p-10 m-4"
      >
        <div className="px-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                {isBulkUpload ? "Bulk Upload Benefits" : "Add a new Benefit"}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isBulkUpload
                  ? "Upload multiple benefits at once using a CSV file."
                  : "Fill in the details below to create a new benefit."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                label="Bulk Upload"
                defaultChecked={isBulkUpload}
                onChange={(checked) => {
                  setIsBulkUpload(checked);
                  resetForm();
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
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Benefit Category *</Label>
                  <Select
                    options={bulkCategories}
                    placeholder="Select benefit category"
                    onChange={(value) => setBulkCategoryId(value as string)}
                    defaultValue={bulkCategoryId}
                  />
                </div>

                <div className="col-span-2">
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

                <div className="col-span-2 flex items-center justify-between gap-3 pt-4">
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
                      onClick={closeModal}
                      className="px-4 py-2 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !bulkFile}
                      className="px-4 py-2 rounded bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50"
                    >
                      {loading ? "Uploading..." : "Upload Benefits"}
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
              handleSingleSubmit();
            }}
          >
            <div className="custom-scrollbar h-full sm:h-full overflow-y-auto px-2">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="col-span-2 lg:col-span-1">
                  <Label>Benefit Category</Label>
                  <Select
                    options={categories}
                    placeholder="Select a benefit category"
                    onChange={(value) => setSelectedCategoryId(value as string)}
                    defaultValue={selectedCategoryId}
                  />
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <Label>Name</Label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setName(e.target.value)
                    }
                  />
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <Label>Limit</Label>
                  <Input
                    type="number"
                    value={limit}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setLimit(e.target.value)
                    }
                  />
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setAmount(e.target.value)
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <TextArea
                    placeholder="Type your message here..."
                    rows={6}
                    value={description}
                    onChange={handleMessageChange}
                  />
                </div>

                <div className="col-span-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 rounded border"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded bg-brand-500 text-white"
                  >
                    {loading ? "Creating..." : "Create Benefit"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </Modal>

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
}
