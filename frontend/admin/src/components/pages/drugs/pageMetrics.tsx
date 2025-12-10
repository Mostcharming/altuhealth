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
import { Drug, useDrugStore } from "@/lib/store/drugStore";
import { ChangeEvent, useState } from "react";

export default function PageMetricsDrugs({
  id,
  buttonText,
}: {
  buttonText?: string;
  id?: string;
}) {
  const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [isBulkUpload, setIsBulkUpload] = useState(false);

  const errorModal = useModal();
  const successModal = useModal();

  // stores
  const addDrug = useDrugStore((s) => s.addDrug);

  // form state - single drug
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [strength, setStrength] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "pending">(
    "pending"
  );
  const [providerId, setProviderId] = useState(id);

  // form state - bulk upload
  const [bulkProviderId, setBulkProviderId] = useState("");
  const [bulkFile, setBulkFile] = useState<File | null>(null);

  const [errorMessage, setErrorMessage] = useState(
    "Failed to save drug. Please try again."
  );

  const resetForm = () => {
    setDescription("");
    setName("");
    setUnit("");
    setStrength("");
    setPrice("");
    setStatus("pending");
    setProviderId(id);
    setBulkProviderId("");
    setBulkFile(null);
  };

  const handleSuccessClose = () => {
    successModal.closeModal();
    resetForm();
    closeModal();
  };

  const handleErrorClose = () => {
    errorModal.closeModal();
  };

  const downloadSampleTemplate = () => {
    const sampleData = [
      {
        name: "Paracetamol",
        unit: "tablet",
        strength: "500mg",
        description: "Pain reliever and fever reducer",
        price: "500",
        status: "active",
      },
      {
        name: "Amoxicillin",
        unit: "capsule",
        strength: "250mg",
        description: "Antibiotic medication",
        price: "1500",
        status: "active",
      },
      {
        name: "Insulin",
        unit: "injection",
        strength: "100IU/ml",
        description: "Diabetes management",
        price: "5000",
        status: "pending",
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
    a.download = "drug_bulk_upload_template.csv";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleBulkUpload = async () => {
    try {
      if (!bulkProviderId) {
        setErrorMessage("Provider is required for bulk upload.");
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
      formData.append("providerId", bulkProviderId);

      const data = await apiClient("/admin/drugs/bulk/create", {
        method: "POST",
        formData,
        onLoading: (l: boolean) => setLoading(l),
      });

      if (data?.data?.drugs && Array.isArray(data.data.drugs)) {
        data.data.drugs.forEach((drug: Drug) => {
          addDrug(drug);
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

  const handlesubmit = async () => {
    try {
      // simple client-side validation
      if (!name) {
        setErrorMessage("Name is required.");
        errorModal.openModal();
        return;
      }
      if (!unit) {
        setErrorMessage("Unit is required.");
        errorModal.openModal();
        return;
      }
      if (!price) {
        setErrorMessage("Price is required.");
        errorModal.openModal();
        return;
      }
      if (!providerId) {
        setErrorMessage("Provider is required.");
        errorModal.openModal();
        return;
      }

      setLoading(true);

      const payload: {
        name: string;
        unit: string;
        description?: string;
        strength?: string;
        price: number;
        status: string;
        providerId: string;
      } = {
        name: name.trim(),
        unit: unit.trim(),
        description: description.trim() || undefined,
        strength: strength.trim() || undefined,
        price: parseFloat(price),
        status,
        providerId,
      };

      const data = await apiClient("/admin/drugs", {
        method: "POST",
        body: payload,
        onLoading: (l: boolean) => setLoading(l),
      });

      if (data?.data?.drug) {
        addDrug({
          id: data.data.drug.id,
          name: name,
          unit: unit,
          description: description || null,
          strength: strength || null,
          price: parseFloat(price),
          status: status,
          providerId: providerId,
          createdAt: data.data.drug.createdAt,
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

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
  };

  return (
    <div className="p-4 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className=" flex items-center justify-between">
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
            {buttonText}
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
                {isBulkUpload ? "Bulk Upload Drugs" : "Add a new Drug"}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isBulkUpload
                  ? "Upload multiple drugs at once using a CSV file."
                  : "Fill in the details below to create a new drug."}
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
            <div className="custom-scrollbar h-[350px] sm:h-[450px] overflow-y-auto px-2">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
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
                      disabled={loading}
                      className="px-4 py-2 rounded bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50"
                    >
                      {loading ? "Uploading..." : "Upload Drugs"}
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
              handlesubmit();
            }}
          >
            <div className="custom-scrollbar h-[350px] sm:h-[450px] overflow-y-auto px-2">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="col-span-2 lg:col-span-1">
                  <Label>Name</Label>
                  <Input
                    type="text"
                    value={name}
                    placeholder="Enter drug name..."
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setName(e.target.value)
                    }
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Unit</Label>
                  <Input
                    type="number"
                    value={unit}
                    placeholder="e.g., mg, ml, tablet..."
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setUnit(e.target.value)
                    }
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Strength</Label>
                  <Input
                    type="text"
                    value={strength}
                    placeholder="e.g., 500mg, 250ml..."
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setStrength(e.target.value)
                    }
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Price</Label>
                  <Input
                    type="number"
                    value={price}
                    placeholder="Enter price..."
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setPrice(e.target.value)
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
                      setStatus(value as "active" | "inactive" | "pending")
                    }
                    defaultValue={status}
                  />
                </div>

                <div className="col-span-2">
                  <Label>Description</Label>
                  <TextArea
                    placeholder="Type the description here..."
                    rows={4}
                    value={description}
                    onChange={handleDescriptionChange}
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
                    {loading ? "Creating..." : "Create Drug"}
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
