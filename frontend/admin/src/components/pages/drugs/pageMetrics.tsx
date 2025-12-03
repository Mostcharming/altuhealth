"use client";

import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { apiClient } from "@/lib/apiClient";
import { useDrugStore } from "@/lib/store/drugStore";
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

  const errorModal = useModal();
  const successModal = useModal();

  // stores
  const addDrug = useDrugStore((s) => s.addDrug);

  // form state
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [strength, setStrength] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "pending">(
    "pending"
  );
  const [providerId, setProviderId] = useState(id);

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
  };

  const handleSuccessClose = () => {
    successModal.closeModal();
    resetForm();
    closeModal();
  };

  const handleErrorClose = () => {
    errorModal.closeModal();
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
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Add a new Drug
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Fill in the details below to create a new drug.
          </p>
        </div>

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
                  //   placeholder="e.g., mg, ml, tablet..."
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
